/**
 * __tests__/lib/m1-m4-hardening.test.ts
 *
 * Unit tests for M1 and M4 security and financial integrity hardening:
 * 1. createBookingAction input validation for guestsCount (INVALID_GUEST_COUNT).
 * 2. processPartialRefundAction cumulative refund limits (EXCEEDS_PAYMENT_AMOUNT).
 * 3. Founder & Admin action role check enforcement.
 */

import { createBookingAction, refundBookingAction } from "@/lib/actions/index";
import { processPartialRefundAction } from "@/lib/actions/stripe";
import { getSiteCMSAction } from "@/lib/actions/founder";
import { UserRole } from "@prisma/client";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

// Mocks
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    travelerProfile: { findUnique: jest.fn() },
    wedding: { findUnique: jest.fn() },
    booking: { findUnique: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
    payment: { findUnique: jest.fn(), update: jest.fn() },
    refund: { findMany: jest.fn(), create: jest.fn() },
    transaction: { create: jest.fn() },
    siteCMS: { upsert: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (cb: any) => cb({
      refund: { create: jest.fn().mockResolvedValue({ id: "ref_1" }) },
      payment: { update: jest.fn().mockResolvedValue({ id: "pay_1" }) },
      booking: { update: jest.fn().mockResolvedValue({ id: "b_paid_123", status: "REFUNDED" }) },
      transaction: { create: jest.fn().mockResolvedValue({ id: "tx_1" }) },
    })),
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "user_123", role: "TRAVELER", status: "ACTIVE" }),
  requireRole: jest.fn().mockImplementation((roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) {
      return Promise.resolve({ id: "admin_123", role: UserRole.ADMIN, email: "admin@weddingwithindia.com" });
    }
    return Promise.reject(new Error("FORBIDDEN"));
  }),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, remaining: 5 }),
}));

jest.mock("@/lib/actions/safety", () => ({
  assertCanBook: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/actions/admin", () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/email", () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue(undefined),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    refunds: {
      create: jest.fn().mockResolvedValue({ id: "ref_stripe_123" }),
    },
  },
}));

const { prisma } = jest.requireMock("@/lib/prisma");

describe("M4 Financial Integrity - createBookingAction Guest Count Validation", () => {
  it("should throw INVALID_GUEST_COUNT if guestsCount is 0", async () => {
    await expect(
      createBookingAction({
        weddingId: "wedding_123",
        date: "2026-10-10",
        guestsCount: 0,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.");
  });

  it("should throw INVALID_GUEST_COUNT if guestsCount is negative", async () => {
    await expect(
      createBookingAction({
        weddingId: "wedding_123",
        date: "2026-10-10",
        guestsCount: -5,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.");
  });

  it("should throw INVALID_GUEST_COUNT if guestsCount is a float", async () => {
    await expect(
      createBookingAction({
        weddingId: "wedding_123",
        date: "2026-10-10",
        guestsCount: 2.5,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.");
  });

  it("should throw INVALID_GUEST_COUNT if guestsCount is non-number type", async () => {
    await expect(
      createBookingAction({
        weddingId: "wedding_123",
        date: "2026-10-10",
        guestsCount: "3" as any,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.");
  });
});

describe("M4 Financial Integrity - processPartialRefundAction Cumulative Limit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw EXCEEDS_PAYMENT_AMOUNT if cumulative refunds exceed payment total", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_123",
      amount: 1000,
      stripePaymentIntentId: "pi_123",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 600, status: "COMPLETED" },
    ]);

    await expect(
      processPartialRefundAction("pay_123", 500, "Extra refund")
    ).rejects.toThrow("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.");
  });

  it("should allow partial refund when cumulative total is within payment amount", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_123",
      amount: 1000,
      stripePaymentIntentId: "pi_123",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 400, status: "COMPLETED" },
    ]);

    prisma.refund.create.mockResolvedValue({
      id: "ref_2",
      paymentId: "pay_123",
      amount: 500,
      status: "COMPLETED",
    });

    const res = await processPartialRefundAction("pay_123", 500, "Valid partial refund");
    expect(res).toEqual({ success: true });
    expect(prisma.refund.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "pay_123",
        amount: 500,
        status: "COMPLETED",
      }),
    });
  });
});

describe("M1 Admin Security Hardening - getSiteCMSAction Role Enforcement", () => {
  it("should call requireRole([UserRole.ADMIN]) at entry of getSiteCMSAction", async () => {
    const { requireRole } = jest.requireMock("@/lib/auth");
    prisma.siteCMS.upsert.mockResolvedValue({ id: "global", heroTitle: "Welcome" });

    const result = await getSiteCMSAction();
    expect(requireRole).toHaveBeenCalledWith([UserRole.ADMIN]);
    expect(result).toHaveProperty("heroTitle", "Welcome");
  });
});

describe("M2 Transaction Atomicity - refundBookingAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error if non-admin user attempts refund", async () => {
    const { requireAuth } = jest.requireMock("@/lib/auth");
    requireAuth.mockResolvedValueOnce({ id: "user_1", role: UserRole.TRAVELER, status: "ACTIVE" });

    await expect(refundBookingAction("booking_123")).rejects.toThrow("Forbidden: Only administrators can process refunds.");
  });

  it("should throw error if booking is not found or not paid before Stripe refund call", async () => {
    const { requireAuth } = jest.requireMock("@/lib/auth");
    const { stripe } = jest.requireMock("@/lib/stripe");
    requireAuth.mockResolvedValueOnce({ id: "admin_1", role: UserRole.ADMIN, status: "ACTIVE" });

    prisma.booking.findUnique.mockResolvedValueOnce(null);

    await expect(refundBookingAction("invalid_booking")).rejects.toThrow("Booking not found.");
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });

  it("should perform Stripe refund API call outside transaction before updating DB state", async () => {
    const { requireAuth } = jest.requireMock("@/lib/auth");
    const { stripe } = jest.requireMock("@/lib/stripe");
    const { sendRefundConfirmationEmail } = jest.requireMock("@/lib/email");

    requireAuth.mockResolvedValueOnce({ id: "admin_1", role: UserRole.ADMIN, status: "ACTIVE" });

    prisma.booking.findUnique.mockResolvedValueOnce({
      id: "b_paid_123",
      status: "PAID",
      totalAmount: 500,
      weddingId: "w_123",
      payments: [{ id: "pay_1", amount: 500, stripePaymentIntentId: "pi_123", status: "PAID" }],
      traveler: { fullName: "Alice Traveler", user: { email: "alice@example.com" } },
    });

    const callOrder: string[] = [];
    stripe.refunds.create.mockImplementationOnce(async () => {
      callOrder.push("stripe.refunds.create");
      return { id: "stripe_ref_999" };
    });

    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      callOrder.push("prisma.$transaction");
      return cb({
        refund: { create: jest.fn().mockResolvedValue({ id: "ref_1" }) },
        payment: { update: jest.fn().mockResolvedValue({ id: "pay_1" }) },
        booking: { update: jest.fn().mockResolvedValue({ id: "b_paid_123", status: "REFUNDED" }) },
        transaction: { create: jest.fn().mockResolvedValue({ id: "tx_1" }) },
      });
    });

    const result = await refundBookingAction("b_paid_123");

    expect(callOrder).toEqual(["stripe.refunds.create", "prisma.$transaction"]);
    expect(result).toEqual({ id: "b_paid_123", status: "REFUNDED" });
    expect(sendRefundConfirmationEmail).toHaveBeenCalledWith(
      "alice@example.com",
      "Alice Traveler",
      "w_123",
      "stripe_ref_999",
      500
    );
  });
});

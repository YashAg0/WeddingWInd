/**
 * __tests__/lib/m1-m4-hardening.test.ts
 *
 * Unit tests for M1 and M4 security and financial integrity hardening:
 * 1. createBookingAction input validation for guestsCount (INVALID_GUEST_COUNT).
 * 2. Manual Refund execution & validation.
 * 3. Founder & Admin action role check enforcement.
 */

import { createBookingAction, refundBookingAction } from "@/lib/actions/index";
import { getSiteCMSAction } from "@/lib/actions/founder";
import { UserRole } from "@prisma/client";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
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
    refund: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    transaction: { create: jest.fn() },
    notification: { create: jest.fn() },
    siteCMS: { upsert: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (cb: any) => {
      if (typeof cb === "function") {
        return cb({
          refund: { create: jest.fn().mockResolvedValue({ id: "ref_1", amount: 500, status: "SUCCESS" }) },
          payment: {
            findUnique: jest.fn().mockResolvedValue({
              id: "pay_1",
              amount: 500,
              currency: "USD",
              status: "PAID",
              bookingId: "b_paid_123",
              booking: {
                id: "b_paid_123",
                traveler: { user: { id: "u1", email: "alice@example.com" }, fullName: "Alice Traveler" },
                wedding: { title: "Grand Palace Celebration" },
              },
              refunds: [],
            }),
            update: jest.fn().mockResolvedValue({ id: "pay_1", status: "REFUNDED" }),
          },
          booking: { update: jest.fn().mockResolvedValue({ id: "b_paid_123", status: "REFUNDED" }) },
          transaction: { create: jest.fn().mockResolvedValue({ id: "tx_1" }) },
          notification: { create: jest.fn().mockResolvedValue({ id: "notif_1" }) },
        });
      }
      return cb;
    }),
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

  it("should throw error if booking is not found or not paid", async () => {
    const { requireAuth } = jest.requireMock("@/lib/auth");
    requireAuth.mockResolvedValueOnce({ id: "admin_1", role: UserRole.ADMIN, status: "ACTIVE" });

    prisma.booking.findUnique.mockResolvedValueOnce(null);

    await expect(refundBookingAction("invalid_booking")).rejects.toThrow("Booking not found.");
  });

  it("should perform atomic manual refund in database and dispatch notification", async () => {
    const { requireAuth } = jest.requireMock("@/lib/auth");
    const { sendRefundConfirmationEmail } = jest.requireMock("@/lib/email");

    requireAuth.mockResolvedValueOnce({ id: "admin_1", role: UserRole.ADMIN, status: "ACTIVE", email: "admin@test.com" });

    prisma.booking.findUnique.mockResolvedValueOnce({
      id: "b_paid_123",
      status: "PAID",
      totalAmount: 500,
      wedding: { title: "Grand Palace Celebration" },
      payments: [{ id: "pay_1", amount: 500, status: "PAID" }],
      traveler: { fullName: "Alice Traveler", user: { email: "alice@example.com" } },
    });

    const result = await refundBookingAction("b_paid_123", "Customer requested cancellation");

    expect(result).toHaveProperty("status", "SUCCESS");
    expect(sendRefundConfirmationEmail).toHaveBeenCalledWith(
      "alice@example.com",
      "Alice Traveler",
      "Grand Palace Celebration",
      expect.any(String),
      500
    );
  });
});

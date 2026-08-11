/**
 * __tests__/lib/m2-challenger-verification.test.ts
 *
 * Challenger empirical test harness for M2 Database & Transaction Integrity:
 * 1. Verifies Stripe webhook POST transaction atomicity.
 * 2. Verifies DB commit before email dispatch and email failure resilience in stripe webhook.
 * 3. Verifies refundBookingAction transaction ordering and email failure resilience.
 * 4. Verifies idempotency and status guard in stripe webhook handler.
 */

jest.mock("@/lib/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_test_123",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
    DATABASE_URL: "postgres://mock",
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("next/headers", () => ({
  headers: jest.fn().mockReturnValue(new Map([["stripe-signature", "valid_sig"]])),
}));

// Mocks for stripe
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
  },
}));

// Mocks for email
jest.mock("@/lib/email", () => ({
  sendInvoiceEmail: jest.fn(),
  sendRefundConfirmationEmail: jest.fn(),
}));

// Mocks for referrals
jest.mock("@/lib/actions/referrals", () => ({
  generateBookingCommissionAction: jest.fn(),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock auth
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

// Mock crypto pass helpers
jest.mock("@/lib/security/guest-pass-crypto", () => ({
  hashPassToken: jest.fn().mockReturnValue("hashed_token"),
  encryptPass: jest.fn().mockReturnValue("encrypted_token"),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentIntent: {
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    guestPass: {
      create: jest.fn(),
    },
    travelerPreparation: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    refund: {
      create: jest.fn(),
    },
    stripeWebhookEvent: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "evt_db_1" }),
      update: jest.fn().mockResolvedValue({ id: "evt_db_1" }),
    },
    stripeWebhookEvent: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";
import { refundBookingAction } from "@/lib/actions/index";
import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";

const { stripe } = jest.requireMock("@/lib/stripe");
const { sendInvoiceEmail, sendRefundConfirmationEmail } = jest.requireMock("@/lib/email");
const { prisma } = jest.requireMock("@/lib/prisma");
const { requireAuth } = jest.requireMock("@/lib/auth");

describe("M2 Challenger Empirical Verification - Stripe Webhook Transaction Atomicity & Email Resilience", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process checkout.session.completed inside $transaction and send email outside $transaction", async () => {
    const mockSession = {
      id: "cs_test_123",
      payment_intent: "pi_test_123",
      currency: "usd",
      metadata: { bookingId: "booking_valid_1" },
    };

    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_123",
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    const executionOrder: string[] = [];

    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      executionOrder.push("prisma.$transaction_start");
      const txMock = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking_valid_1",
            status: BookingStatus.PENDING,
            totalAmount: 1500,
            guestsCount: 2,
            date: new Date("2026-11-01"),
            payments: [],
            wedding: { title: "Royal Palace Wedding" },
            traveler: {
              fullName: "John Doe",
              user: { id: "user_john", email: "john@example.com" },
            },
          }),
          update: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.booking.update");
            return { id: "booking_valid_1", status: BookingStatus.PAID };
          }),
        },
        payment: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.payment.create");
            return { id: "pay_123" };
          }),
        },
        paymentIntent: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.paymentIntent.create");
            return { id: "pi_record_123" };
          }),
        },
        transaction: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.transaction.create");
            return { id: "tx_record_123" };
          }),
        },
        guestPass: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.guestPass.create");
            return { id: "pass_123" };
          }),
        },
        travelerPreparation: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.travelerPreparation.create");
            return { id: "prep_123" };
          }),
        },
        notification: {
          create: jest.fn().mockImplementation(() => {
            executionOrder.push("tx.notification.create");
            return { id: "notif_123" };
          }),
        },
      };
      const result = await cb(txMock);
      executionOrder.push("prisma.$transaction_end");
      return result;
    });

    sendInvoiceEmail.mockImplementationOnce(async () => {
      executionOrder.push("sendInvoiceEmail");
    });

    const dummyRequest = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(dummyRequest);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("OK");

    // Verify ordering: all DB mutations inside transaction, then sendInvoiceEmail outside transaction
    expect(executionOrder).toEqual([
      "prisma.$transaction_start",
      "tx.payment.create",
      "tx.paymentIntent.create",
      "tx.transaction.create",
      "tx.booking.update",
      "tx.guestPass.create",
      "tx.travelerPreparation.create",
      "tx.notification.create",
      "prisma.$transaction_end",
      "sendInvoiceEmail",
    ]);

    expect(sendInvoiceEmail).toHaveBeenCalledWith(
      "john@example.com",
      "John Doe",
      "Royal Palace Wedding",
      "pay_123",
      1500,
      2,
      expect.any(String)
    );
  });

  it("should NOT roll back DB transaction if sendInvoiceEmail fails (throws an error)", async () => {
    const mockSession = {
      id: "cs_test_456",
      payment_intent: "pi_test_456",
      currency: "usd",
      metadata: { bookingId: "booking_email_fail_1" },
    };

    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_456",
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    let dbCommitted = false;

    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      const txMock = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking_email_fail_1",
            status: BookingStatus.PENDING,
            totalAmount: 2000,
            guestsCount: 4,
            date: new Date("2026-12-01"),
            payments: [],
            wedding: { title: "Beachside Wedding" },
            traveler: {
              fullName: "Jane Smith",
              user: { id: "user_jane", email: "jane@example.com" },
            },
          }),
          update: jest.fn().mockResolvedValue({ id: "booking_email_fail_1", status: BookingStatus.PAID }),
        },
        payment: { create: jest.fn().mockResolvedValue({ id: "pay_456" }) },
        paymentIntent: { create: jest.fn().mockResolvedValue({ id: "pi_record_456" }) },
        transaction: { create: jest.fn().mockResolvedValue({ id: "tx_record_456" }) },
        guestPass: { create: jest.fn().mockResolvedValue({ id: "pass_456" }) },
        travelerPreparation: { create: jest.fn().mockResolvedValue({ id: "prep_456" }) },
        notification: { create: jest.fn().mockResolvedValue({ id: "notif_456" }) },
      };
      const res = await cb(txMock);
      dbCommitted = true;
      return res;
    });

    // Make sendInvoiceEmail reject with SMTP connection failure
    sendInvoiceEmail.mockRejectedValueOnce(new Error("SMTP Connection Timeout"));

    const dummyRequest = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(dummyRequest);
    const text = await response.text();

    // Verify DB committed cleanly
    expect(dbCommitted).toBe(true);
    // Verify HTTP status is 200 OK because webhook processing succeeded
    expect(response.status).toBe(200);
    expect(text).toBe("OK");
    expect(sendInvoiceEmail).toHaveBeenCalled();
  });

  it("should ignore payment if booking is already PAID (Idempotency)", async () => {
    const mockSession = {
      id: "cs_test_dup",
      payment_intent: "pi_test_dup",
      currency: "usd",
      metadata: { bookingId: "booking_already_paid" },
    };

    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_dup",
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      const txMock = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking_already_paid",
            status: BookingStatus.PAID, // Already paid!
            totalAmount: 1000,
            payments: [{ id: "existing_payment" }],
            wedding: { title: "Palace Wedding" },
            traveler: { fullName: "Jane", user: { email: "jane@test.com" } },
          }),
        },
      };
      return cb(txMock);
    });

    const dummyRequest = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(dummyRequest);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("OK");
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it("should ignore payment if booking is CANCELLED or REFUNDED", async () => {
    const mockSession = {
      id: "cs_test_cancelled",
      payment_intent: "pi_test_cancelled",
      currency: "usd",
      metadata: { bookingId: "booking_cancelled" },
    };

    stripe.webhooks.constructEvent.mockReturnValue({
      id: "evt_cancelled",
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      const txMock = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking_cancelled",
            status: BookingStatus.CANCELLED, // Cancelled state
            totalAmount: 1000,
            payments: [],
            wedding: { title: "Palace Wedding" },
            traveler: { fullName: "Jane", user: { email: "jane@test.com" } },
          }),
        },
      };
      return cb(txMock);
    });

    const dummyRequest = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(dummyRequest);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("OK");
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });
});

describe("M2 Challenger Empirical Verification - refundBookingAction Email Failure Resilience", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return updated booking even if sendRefundConfirmationEmail fails", async () => {
    requireAuth.mockResolvedValueOnce({ id: "admin_1", role: UserRole.ADMIN, status: "ACTIVE" });

    prisma.booking.findUnique.mockResolvedValueOnce({
      id: "b_paid_refund_test",
      status: BookingStatus.PAID,
      totalAmount: 800,
      weddingId: "w_888",
      payments: [{ id: "pay_888", amount: 800, stripePaymentIntentId: "pi_888", status: "PAID" }],
      traveler: { fullName: "Bob Traveler", user: { email: "bob@example.com" } },
    });

    stripe.refunds.create.mockResolvedValueOnce({ id: "re_stripe_888" });

    let dbUpdated = false;
    prisma.$transaction.mockImplementationOnce(async (cb: any) => {
      const txMock = {
        refund: { create: jest.fn().mockResolvedValue({ id: "ref_888" }) },
        payment: { update: jest.fn().mockResolvedValue({ id: "pay_888", status: PaymentStatus.REFUNDED }) },
        booking: { update: jest.fn().mockResolvedValue({ id: "b_paid_refund_test", status: BookingStatus.REFUNDED }) },
        transaction: { create: jest.fn().mockResolvedValue({ id: "tx_refund_888" }) },
      };
      const res = await cb(txMock);
      dbUpdated = true;
      return res;
    });

    sendRefundConfirmationEmail.mockRejectedValueOnce(new Error("Email provider offline"));

    const result = await refundBookingAction("b_paid_refund_test");

    expect(dbUpdated).toBe(true);
    expect(result).toEqual({ id: "b_paid_refund_test", status: BookingStatus.REFUNDED });
    expect(sendRefundConfirmationEmail).toHaveBeenCalledWith(
      "bob@example.com",
      "Bob Traveler",
      "w_888",
      "re_stripe_888",
      800
    );
  });
});

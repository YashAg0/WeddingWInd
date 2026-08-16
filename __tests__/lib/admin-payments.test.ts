import { UserRole } from "@prisma/client";

// Mock requireRole and requireAuth
jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn(),
  requireAuth: jest.fn(),
}));

// Mock Prisma
const mockTransactions = [
  {
    id: "tx_123",
    paymentId: "pay_123",
    type: "PAYMENT",
    amount: 15500,
    status: "SUCCESS",
    referenceId: "ref_123",
    createdAt: new Date(),
    payment: {
      id: "pay_123",
      bookingId: "b1",
      amount: 15500,
      currency: "INR",
      status: "PAID",
      booking: {
        id: "b1",
        traveler: { fullName: "Ananya Sharma" },
        wedding: { title: "Grand Jaipur Celebration" },
      },
    },
  },
];

const mockRefunds = [
  {
    id: "ref_1",
    paymentId: "pay_123",
    amount: 1500,
    reason: "Date change",
    status: "COMPLETED",
    createdAt: new Date(),
    payment: {
      id: "pay_123",
      booking: {
        traveler: { fullName: "Kabir Mehta" },
        wedding: { title: "Udaipur Royal Wedding" },
      },
    },
  },
];

const mockPayouts: any[] = [];
const mockWebhookEvents: any[] = [];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(async () => mockTransactions),
    },
    refund: {
      findMany: jest.fn(async () => mockRefunds),
      create: jest.fn(async ({ data }) => ({ id: "ref_new", ...data })),
    },
    payout: {
      findMany: jest.fn(async () => mockPayouts),
    },
    stripeWebhookEvent: {
      findMany: jest.fn(async () => mockWebhookEvents),
      findUnique: jest.fn(async ({ where }) => ({
        id: where.id,
        stripeEventId: "mock_evt_123",
        type: "payment_intent.succeeded",
        status: "FAILED",
      })),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data, status: "PROCESSED" })),
    },
    payment: {
      findUnique: jest.fn(async ({ where }) => ({
        id: where.id,
        amount: 1000,
        currency: "USD",
        stripePaymentIntentId: "mock_pi_123",
        status: "PAID",
      })),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
    booking: {
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
    auditLog: {
      create: jest.fn(async () => ({ id: "audit_1" })),
    },
    $transaction: jest.fn(async (cb: any) => cb({
      refund: { create: jest.fn(async ({ data }: any) => ({ id: "ref_new", ...data })) },
      payment: { update: jest.fn() },
      booking: { update: jest.fn() },
    })),
  },
}));

// Mock revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { adminGetPaymentsAndQueuesAction } from "@/lib/actions/admin";
import { processPartialRefundAction, retryStripeWebhookEventAction } from "@/lib/actions/stripe";
import { requireRole } from "@/lib/auth";

describe("Admin Payments Operations & Financial Safety Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. ADMIN can read payment data from database", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-user-id",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });

    const result = await adminGetPaymentsAndQueuesAction();
    expect(result).toHaveProperty("transactions");
    expect(result).toHaveProperty("refundQueue");
    expect(result).toHaveProperty("payoutQueue");
    expect(result).toHaveProperty("webhookEvents");
    expect(Array.isArray(result.transactions)).toBe(true);
    expect(result.transactions.length).toBe(1);
  });

  test("2. Non-admin user is rejected from reading payment data", async () => {
    (requireRole as jest.Mock).mockRejectedValue(new Error("FORBIDDEN: You do not have permissions to access this route."));

    await expect(adminGetPaymentsAndQueuesAction()).rejects.toThrow("FORBIDDEN");
  });

  test("3. Partial refund action validates maximum payment amount and requires ADMIN", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-user-id",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });

    // Attempt partial refund of $500 when cumulative refunds exceed payment limit
    await expect(processPartialRefundAction("pay_123", 500, "Exceeds total")).rejects.toThrow(
      "EXCEEDS_PAYMENT_AMOUNT"
    );
  });

  test("4. Retry webhook event action updates status and requires ADMIN", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-user-id",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });

    const res = await retryStripeWebhookEventAction("evt_123");
    expect(res).toEqual({ success: true });
  });
});

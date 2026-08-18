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
      create: jest.fn(async ({ data }) => ({ id: "tx_new", ...data })),
    },
    refund: {
      findMany: jest.fn(async () => mockRefunds),
      create: jest.fn(async ({ data }) => ({ id: "ref_new", ...data })),
      findFirst: jest.fn(async () => null),
    },
    payout: {
      findMany: jest.fn(async () => mockPayouts),
    },
    stripeWebhookEvent: {
      findMany: jest.fn(async () => mockWebhookEvents),
    },
    systemConfig: {
      findUnique: jest.fn(async () => ({
        paypalProcessingFeePercent: 3.5,
        paypalProcessingFeeFixedAmount: 0.0,
        paypalDomainAllowlist: "paypal.com,paypal.me",
        currencyCode: "USD",
      })),
    },
    payment: {
      findUnique: jest.fn(async ({ where }) => ({
        id: where.id,
        amount: 1000,
        currency: "USD",
        status: "PAID",
        bookingId: "b1",
        booking: {
          id: "b1",
          traveler: { user: { id: "u1", email: "traveler@test.com" } },
          wedding: { title: "Royal Palace Wedding", hostCouple: { user: { id: "h1" } }, date: new Date() },
          guestPasses: [],
          preparations: null,
        },
        refunds: [],
      })),
      findFirst: jest.fn(async () => null),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
    booking: {
      findUnique: jest.fn(async ({ where }) => ({
        id: where.id,
        status: "AWAITING_PAYMENT",
        totalAmount: 1000,
        guestsCount: 2,
        date: new Date(),
        traveler: { user: { id: "u1", email: "traveler@test.com" } },
        wedding: { title: "Royal Palace Wedding", hostCouple: { user: { id: "h1" } }, date: new Date() },
        payments: [],
      })),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
    guestPass: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }) => ({ id: "pass_1", ...data })),
    },
    travelerPreparation: {
      create: jest.fn(async ({ data }) => ({ id: "prep_1", ...data })),
    },
    notification: {
      create: jest.fn(async ({ data }) => ({ id: "notif_1", ...data })),
    },
    auditLog: {
      create: jest.fn(async () => ({ id: "audit_1" })),
    },
    $transaction: jest.fn(async (cb: any) => {
      if (typeof cb === "function") {
        return cb({
          payment: {
            findUnique: jest.fn(async ({ where }) => ({
              id: where.id,
              amount: 1000,
              currency: "USD",
              status: "PAID",
              bookingId: "b1",
              booking: {
                id: "b1",
                traveler: { user: { id: "u1", email: "traveler@test.com" }, fullName: "Test Traveler" },
                wedding: { title: "Royal Palace Wedding", hostCouple: { user: { id: "h1" } }, date: new Date() },
                guestPasses: [],
                preparations: null,
              },
              refunds: [],
            })),
            update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
          },
          booking: {
            update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
          },
          refund: {
            create: jest.fn(async ({ data }: any) => ({ id: "ref_new", ...data })),
          },
          transaction: {
            create: jest.fn(async ({ data }: any) => ({ id: "tx_new", ...data })),
          },
          notification: {
            create: jest.fn(async ({ data }: any) => ({ id: "notif_1", ...data })),
          },
        });
      }
      return cb;
    }),
  },
}));

// Mock revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

import { adminGetPaymentsAndQueuesAction } from "@/lib/actions/admin";
import { adminRecordManualRefundAction } from "@/lib/actions/payment-manual";
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
    expect(Array.isArray(result.transactions)).toBe(true);
    expect(result.transactions.length).toBe(1);
  });

  test("2. Non-admin user is rejected from reading payment data", async () => {
    (requireRole as jest.Mock).mockRejectedValue(new Error("FORBIDDEN: You do not have permissions to access this route."));

    await expect(adminGetPaymentsAndQueuesAction()).rejects.toThrow("FORBIDDEN");
  });

  test("3. Manual refund action records refund and requires ADMIN", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-user-id",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });

    const res = await adminRecordManualRefundAction({
      paymentId: "pay_123",
      refundAmount: 500,
      reason: "Customer Requested Refund",
      refundTransactionId: "REF-PP-12345",
      refundNotes: "Processed via PayPal console",
    });

    expect(res.success).toBe(true);
    expect(res.refund.amount).toBe(500);
  });
});

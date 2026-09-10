/**
 * __tests__/lib/retry-safety-idempotency.test.ts
 *
 * RIGOROUS RETRY SAFETY & IDEMPOTENCY REGRESSION SUITE
 */

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

import {
  markPaymentPaidAtomic,
  createOrUpdatePaymentRequestAtomic,
  recordManualRefundAtomic,
} from "@/lib/services/payments";
import { generateBookingCommissionAction } from "@/lib/actions/referrals";
import { canProcessHostPayout } from "@/lib/booking-statuses";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, BookingStatus, ReferralStatus } from "@prisma/client";

describe("Gate 1: Retry Safety & Idempotency Audit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(prisma.systemConfig, "findUnique").mockResolvedValue({
      id: "global",
      paypalProcessingFeePercent: 3.5,
      paypalProcessingFeeFixedAmount: 0.49,
      paypalDomainAllowlist: "paypal.com,paypal.me",
      currencyCode: "USD",
    } as any);
  });

  describe("1. Payment Verification (markPaymentPaidAtomic)", () => {
    it("is strictly idempotent: second call returns alreadyPaid without creating duplicate guest passes or transactions", async () => {
      const mockCreatedPasses: any[] = [];
      const mockCreatedTransactions: any[] = [];
      let paymentStatus = PaymentStatus.PENDING;
      let bookingStatus = BookingStatus.AWAITING_PAYMENT;

      const mockPayment: any = {
        id: "pay-123",
        amount: 250,
        currency: "USD",
        status: PaymentStatus.PENDING,
        provider: "MANUAL_PAYPAL",
        booking: {
          id: "bk-123",
          status: BookingStatus.AWAITING_PAYMENT,
          traveler: { user: { id: "u-trav", email: "trav@example.com" }, fullName: "Traveler Alex" },
          wedding: { title: "Royal Wedding", hostCouple: { user: { id: "u-host" } } },
          date: new Date(),
          guestsCount: 2,
        },
      };

      const mockTx: any = {
        payment: {
          findUnique: jest.fn().mockImplementation(() => {
            return Promise.resolve({
              ...mockPayment,
              status: paymentStatus,
              booking: { ...mockPayment.booking, status: bookingStatus },
            });
          }),
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn().mockImplementation(({ data }: any) => {
            paymentStatus = data.status;
            return Promise.resolve({ ...mockPayment, ...data });
          }),
        },
        booking: {
          findUnique: jest.fn().mockResolvedValue({ id: "bk-123", status: "PAID", weddingTier: "STANDARD", guestsCount: 2 }),
          update: jest.fn().mockImplementation(({ data }: any) => {
            bookingStatus = data.status;
            return Promise.resolve({ ...mockPayment.booking, ...data });
          }),
        },
        transaction: {
          create: jest.fn().mockImplementation(({ data }: any) => {
            mockCreatedTransactions.push(data);
            return Promise.resolve({ id: "txn-" + mockCreatedTransactions.length, ...data });
          }),
        },
        guestPass: {
          findFirst: jest.fn().mockImplementation(() => {
            return Promise.resolve(mockCreatedPasses[0] || null);
          }),
          create: jest.fn().mockImplementation(({ data }: any) => {
            mockCreatedPasses.push(data);
            return Promise.resolve({ id: "pass-" + mockCreatedPasses.length, ...data });
          }),
        },
        travelerPreparation: {
          create: jest.fn().mockResolvedValue({ id: "prep-1" }),
        },
        agentReferral: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn().mockResolvedValue({}),
        },
        commission: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: "comm-1" }),
        },
        notification: {
          create: jest.fn().mockResolvedValue({ id: "notif-1" }),
        },
      };

      const firstResult = await markPaymentPaidAtomic(mockTx, {
        paymentId: "pay-123",
        transactionId: "PP-TXN-9999",
        paymentNotes: "First attempt",
        adminUserId: "admin-1",
        adminEmail: "admin@example.com",
      });

      expect(firstResult.success).toBe(true);
      expect(firstResult.alreadyPaid).toBe(false);
      expect(mockCreatedTransactions.length).toBe(1);
      expect(mockCreatedPasses.length).toBe(1);

      const retryResult = await markPaymentPaidAtomic(mockTx, {
        paymentId: "pay-123",
        transactionId: "PP-TXN-9999",
        paymentNotes: "Retry after network loss",
        adminUserId: "admin-1",
        adminEmail: "admin@example.com",
      });

      expect(retryResult.success).toBe(true);
      expect(retryResult.alreadyPaid).toBe(true);
      expect(retryResult.guestPassCreated).toBe(false);
      expect(mockCreatedTransactions.length).toBe(1);
      expect(mockCreatedPasses.length).toBe(1);
    });
  });

  describe("2. Payment Request Creation (createOrUpdatePaymentRequestAtomic)", () => {
    it("updates existing pending payment on retry instead of creating duplicate payment record", async () => {
      let existingPending: any = null;
      let createdPayments = 0;
      let updatedPayments = 0;

      const mockBooking: any = {
        id: "bk-200",
        customerTotalAmount: 300,
        status: BookingStatus.APPROVED,
        payments: [],
        traveler: { user: { id: "u-t" } },
        wedding: { title: "Goa Celebration", isDemo: false, suspended: false },
      };

      const mockTx: any = {
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
          update: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.AWAITING_PAYMENT }),
        },
        payment: {
          findFirst: jest.fn().mockImplementation(() => Promise.resolve(existingPending)),
          create: jest.fn().mockImplementation(({ data }: any) => {
            createdPayments++;
            existingPending = { id: "pay-created-1", ...data };
            return Promise.resolve(existingPending);
          }),
          update: jest.fn().mockImplementation(({ data }: any) => {
            updatedPayments++;
            existingPending = { ...existingPending, ...data };
            return Promise.resolve(existingPending);
          }),
        },
        notification: {
          create: jest.fn().mockResolvedValue({ id: "notif-2" }),
        },
      };

      await createOrUpdatePaymentRequestAtomic(mockTx, {
        bookingId: "bk-200",
        baseAmount: 300,
        currency: "USD",
        paymentLink: "https://paypal.me/weddingwithindia",
        adminUserId: "admin-1",
        adminEmail: "admin@wwi.com",
      });

      expect(createdPayments).toBe(1);
      expect(updatedPayments).toBe(0);

      await createOrUpdatePaymentRequestAtomic(mockTx, {
        bookingId: "bk-200",
        baseAmount: 300,
        currency: "USD",
        paymentLink: "https://paypal.me/weddingwithindia",
        adminUserId: "admin-1",
        adminEmail: "admin@wwi.com",
      });

      expect(createdPayments).toBe(1);
      expect(updatedPayments).toBe(1);
    });
  });

  describe("3. Referral Commission Generation (generateBookingCommissionAction)", () => {
    it("enforces unique idempotencyKey to prevent duplicate agent commissions", async () => {
      let createdCommissions = 0;
      const commissionDb = new Map<string, any>();

      const mockTx: any = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "bk-300",
            status: "PAID",
            weddingTier: "STANDARD",
            guestsCount: 2,
          }),
        },
        agentReferral: {
          findFirst: jest.fn().mockResolvedValue({
            id: "ref-1",
            agentId: "agent-1",
            status: ReferralStatus.QUALIFIED,
            agent: { userId: "agent-user-id" },
          }),
          update: jest.fn().mockResolvedValue({ id: "ref-1", status: ReferralStatus.CONVERTED }),
        },
        agentProfile: {
          findUnique: jest.fn().mockResolvedValue({ id: "agent-1", userId: "agent-user-id" }),
        },
        commission: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            return Promise.resolve(commissionDb.get(where.idempotencyKey) || null);
          }),
          create: jest.fn().mockImplementation(({ data }: any) => {
            if (commissionDb.has(data.idempotencyKey)) {
              throw new Error("Unique constraint violation on idempotencyKey");
            }
            createdCommissions++;
            commissionDb.set(data.idempotencyKey, { id: "comm-1", ...data });
            return Promise.resolve(commissionDb.get(data.idempotencyKey));
          }),
        },
        notification: {
          create: jest.fn().mockResolvedValue({ id: "notif-comm" }),
        },
      };

      const res1 = await generateBookingCommissionAction(
        mockTx,
        "pay-300",
        "bk-300",
        "traveler-different-id",
        500
      );
      expect(res1.success).toBe(true);
      expect(createdCommissions).toBe(1);

      const res2 = await generateBookingCommissionAction(
        mockTx,
        "pay-300",
        "bk-300",
        "traveler-different-id",
        500
      );
      expect(res2.success).toBe(true);
      expect(res2.reason).toBe("Commission already processed.");
      expect(createdCommissions).toBe(1);
    });
  });

  describe("4. Host Payout Eligibility Guard (canProcessHostPayout)", () => {
    it("strictly blocks duplicate host payouts once transferred", () => {
      const check1 = canProcessHostPayout(PaymentStatus.PAID, false, BookingStatus.COMPLETED);
      expect(check1.eligible).toBe(true);

      const check2 = canProcessHostPayout(PaymentStatus.PAID, true, BookingStatus.COMPLETED);
      expect(check2.eligible).toBe(false);
      expect(check2.reason).toContain("already been processed");
    });
  });

  describe("5. Refund Over-Allocation Guard (recordManualRefundAtomic)", () => {
    it("strictly rejects retry attempts exceeding total payment amount", async () => {
      const mockPayment: any = {
        id: "pay-ref-1",
        status: PaymentStatus.PAID,
        amount: 200,
        refunds: [{ id: "ref-1", amount: 200, status: "SUCCEEDED" }],
        booking: {
          traveler: { user: { email: "test@example.com" } },
          wedding: { title: "Jaipur Palace" },
        },
      };

      const mockTx: any = {
        payment: {
          findUnique: jest.fn().mockResolvedValue(mockPayment),
        },
      };

      await expect(
        recordManualRefundAtomic(mockTx, {
          paymentId: "pay-ref-1",
          refundAmount: 200,
          adminUserId: "admin-1",
          adminEmail: "admin@test.com",
        })
      ).rejects.toThrow(/exceeds remaining unrefunded payment balance/i);
    });
  });
});

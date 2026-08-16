import {
  createBookingAction,
  deleteWedding,
} from "@/lib/actions/index";
import { CAPACITY_HOLDING_BOOKING_STATUSES } from "@/lib/booking-statuses";
import {
  adminReviewHostApplicationAction,
  adminProcessHostPayoutAction,
} from "@/lib/actions/admin";
import { resolveUserRole } from "@/lib/rbac";
import { isFinanciallyHeld } from "@/lib/actions/safety";
import {
  submitPayoutRequestAction,
  settleMaturedCommissionsAction,
  generateBookingCommissionAction,
} from "@/lib/actions/referrals";
import { evaluateReviewEligibility } from "@/lib/services/review-eligibility";
import { submitReviewAction } from "@/lib/actions/reviews";
import { deleteSavedSearch } from "@/lib/actions/discovery";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  UserRole,
  BookingStatus,
  CommissionStatus,
  WeddingStatus,
  ReviewType,
} from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    transfers: {
      create: jest.fn().mockResolvedValue({ id: "tr_test_123" }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: "cs_test_123", url: "https://stripe.com/checkout" }),
      },
    },
    events: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock("@/lib/email", () => ({
  sendVerificationApprovedEmail: jest.fn().mockResolvedValue(true),
  sendVerificationRejectedEmail: jest.fn().mockResolvedValue(true),
  sendInvoiceEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/prisma", () => {
  const mockPrisma: any = {
    wedding: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn().mockResolvedValue({ id: "couple-1", userId: "host-user-1" }),
      findFirst: jest.fn(),
    },
    travelerProfile: {
      findUnique: jest.fn().mockResolvedValue({ id: "traveler-1", userId: "traveler-user-1" }),
      findFirst: jest.fn(),
    },
    guestPass: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    verification: {
      upsert: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    safetyCase: {
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    userRestriction: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    reputationEvent: {
      create: jest.fn().mockResolvedValue({ id: "rep-event-1" }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    reputationProfile: {
      findUnique: jest.fn().mockResolvedValue({ overallScore: 85 }),
      upsert: jest.fn(),
    },
    trustScoreSnapshot: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    badge: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
    weddingQualityBadge: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    payout: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    savedSearch: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    agentProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    agentReferral: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    commission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    payoutRequest: {
      create: jest.fn(),
    },
    referralFraudFlag: {
      create: jest.fn(),
    },
    cancellationRequest: {
      count: jest.fn().mockResolvedValue(0),
    },
    dispute: {
      count: jest.fn().mockResolvedValue(0),
    },
    review: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    refund: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn(async (cb) => {
      if (typeof cb === "function") {
        return cb(mockPrisma);
      }
      return cb;
    }),
  };
  return { prisma: mockPrisma };
});

describe("Remediation Integration Suite — P0 & P1 Fixes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Capacity & Overbooking Invariants", () => {
    it("should include AWAITING_PAYMENT and CONFIRMED in CAPACITY_HOLDING_BOOKING_STATUSES", () => {
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).toContain(BookingStatus.AWAITING_PAYMENT);
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).toContain(BookingStatus.CONFIRMED);
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).toContain(BookingStatus.PAID);
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).toContain(BookingStatus.READY_FOR_EVENT);
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).not.toContain(BookingStatus.CANCELLED);
      expect(CAPACITY_HOLDING_BOOKING_STATUSES).not.toContain(BookingStatus.REJECTED);
    });

    it("should prevent duplicate booking creation if an active reservation exists", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "user-1",
        role: UserRole.TRAVELER,
        email: "traveler@test.com",
        travelerProfile: { id: "traveler-1" },
      });

      (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
        id: "wedding-1",
        suspended: false,
        isDemo: false,
        hostCouple: { userId: "host-couple-user-id" },
      });

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({
        id: "existing-booking-1",
        status: BookingStatus.AWAITING_PAYMENT,
      });

      await expect(
        createBookingAction({
          weddingId: "wedding-1",
          guestsCount: 2,
          notes: "Trip",
        })
      ).rejects.toThrow("You already have an active reservation request or booking for this wedding.");
    });
  });

  describe("2. Coordinator RBAC & Authorization", () => {
    it("should resolve UserRole.COORDINATOR to 'COORDINATOR'", () => {
      const role = resolveUserRole({
        role: UserRole.COORDINATOR,
        email: "coord@weddingwithindia.com",
      });
      expect(role).toBe("COORDINATOR");
    });

    it("should NOT strip ADMIN role if admin email contains 'coordinator'", () => {
      const role = resolveUserRole({
        role: UserRole.ADMIN,
        email: "coordinator-lead@weddingwithindia.com",
      });
      expect(role).toBe("ADMIN");
    });
  });

  describe("3. Host Application Review Enum Fix", () => {
    it("should transition wedding status to DRAFT when rejected without Prisma enum error", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        id: "admin-1",
        email: "admin@test.com",
        role: UserRole.ADMIN,
      });

      (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
        id: "wedding-99",
        title: "Sunset Wedding",
        slug: "sunset-wedding",
        hostCoupleId: "couple-99",
        hostCouple: {
          id: "couple-99",
          userId: "user-host-99",
          user: { id: "user-host-99", name: "Ananya", email: "ananya@test.com" },
        },
      });

      (prisma.wedding.update as jest.Mock).mockResolvedValue({
        id: "wedding-99",
        status: WeddingStatus.DRAFT,
      });

      const result = await adminReviewHostApplicationAction(
        "wedding-99",
        "REJECTED",
        "Please provide updated ID documents."
      );

      expect(prisma.wedding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "wedding-99" },
          data: { status: WeddingStatus.DRAFT },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  describe("4. Safety Holds & Financial Protection", () => {
    it("should return false if safety case is RESOLVED or CLOSED", async () => {
      (prisma.safetyCase.findFirst as jest.Mock).mockResolvedValue(null);

      const isHeld = await isFinanciallyHeld({
        weddingId: "wedding-1",
        userId: "user-1",
      });

      expect(isHeld).toBe(false);
      expect(prisma.safetyCase.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            financialHold: true,
            status: { notIn: ["RESOLVED", "CLOSED"] },
          }),
        })
      );
    });
  });

  describe("5. Multi-Currency Host Payouts", () => {
    it("should pass dynamic currency (INR) and 100x multiplier to Stripe transfer", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        id: "admin-1",
        email: "admin@test.com",
        role: UserRole.ADMIN,
      });

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: "pay-inr-1",
        bookingId: "b-1",
        amount: 5000,
        currency: "INR",
        booking: {
          id: "b-1",
          weddingId: "w-1",
          traveler: { userId: "traveler-1" },
          wedding: {
            hostCouple: {
              userId: "host-1",
              stripeAccountId: "acct_stripe_host_123",
            },
          },
        },
      });

      (prisma.safetyCase.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.payout.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.payout.create as jest.Mock).mockResolvedValue({
        id: "payout-1",
        amount: 5000,
      });

      await adminProcessHostPayoutAction("pay-inr-1");

      expect(stripe.transfers.create).toHaveBeenCalledWith({
        amount: 500000, // 5000 * 100
        currency: "inr",
        destination: "acct_stripe_host_123",
        metadata: {
          paymentId: "pay-inr-1",
          bookingId: "b-1",
        },
      });
    });
  });

  describe("6. Saved Search IDOR Protection", () => {
    it("should throw Forbidden when non-owner non-admin deletes a saved search", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "attacker-user-id",
        role: UserRole.TRAVELER,
      });

      (prisma.savedSearch.findUnique as jest.Mock).mockResolvedValue({
        id: "search-123",
        userId: "victim-user-id",
      });

      await expect(deleteSavedSearch("search-123")).rejects.toThrow("Forbidden: You do not own this saved search.");
    });

    it("should allow saved search deletion when owner matches authenticated user", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "owner-user-id",
        role: UserRole.TRAVELER,
      });

      (prisma.savedSearch.findUnique as jest.Mock).mockResolvedValue({
        id: "search-123",
        userId: "owner-user-id",
      });

      (prisma.savedSearch.delete as jest.Mock).mockResolvedValue({ id: "search-123" });

      const res = await deleteSavedSearch("search-123");
      expect(res.success).toBe(true);
      expect(prisma.savedSearch.delete).toHaveBeenCalledWith({ where: { id: "search-123" } });
    });
  });

  describe("7. Commission Maturity & Partial Locking", () => {
    it("should settle matured commissions whose availableAt is in the past", async () => {
      (prisma.commission.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await settleMaturedCommissionsAction("agent-123");

      expect(prisma.commission.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: CommissionStatus.PENDING,
          agentId: "agent-123",
        }),
        data: {
          status: CommissionStatus.APPROVED,
        },
      });
      expect(result.count).toBe(3);
    });

    it("should lock only the required commissions to cover payout amount", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "agent-user-id",
        role: UserRole.TRAVELER,
      });

      (prisma.agentProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "agent-profile-1",
        userId: "agent-user-id",
      });

      (prisma.safetyCase.findFirst as jest.Mock).mockResolvedValue(null);

      // Agent has 3 approved commissions: $50, $50, $100 (Total $200)
      (prisma.commission.findMany as jest.Mock).mockResolvedValue([
        { id: "comm-1", commissionAmount: 50, status: CommissionStatus.APPROVED },
        { id: "comm-2", commissionAmount: 50, status: CommissionStatus.APPROVED },
        { id: "comm-3", commissionAmount: 100, status: CommissionStatus.APPROVED },
      ]);

      (prisma.payoutRequest.create as jest.Mock).mockResolvedValue({
        id: "req-1",
        amount: 100,
        status: "REQUESTED",
      });

      // Requesting $100 should only lock comm-1 ($50) and comm-2 ($50), leaving comm-3 unlocked
      await submitPayoutRequestAction({
        amount: 100,
        method: "BANK_TRANSFER",
      });

      expect(prisma.commission.update).toHaveBeenCalledTimes(2);
      expect(prisma.commission.update).toHaveBeenCalledWith({
        where: { id: "comm-1" },
        data: { payoutRequestId: "req-1", status: CommissionStatus.LOCKED },
      });
      expect(prisma.commission.update).toHaveBeenCalledWith({
        where: { id: "comm-2" },
        data: { payoutRequestId: "req-1", status: CommissionStatus.LOCKED },
      });
    });

    it("should reject self-referral commission generation and flag fraud", async () => {
      const mockTx: any = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({ id: "b-1", status: "PAID" }),
        },
        agentReferral: {
          findFirst: jest.fn().mockResolvedValue({
            id: "ref-1",
            agentId: "agent-1",
            agent: { userId: "agent-same-user-id" },
          }),
        },
        referralFraudFlag: {
          create: jest.fn().mockResolvedValue({ id: "fraud-1" }),
        },
      };

      const result = await generateBookingCommissionAction(
        mockTx,
        "pay-1",
        "b-1",
        "agent-same-user-id", // Same traveler user ID as agent
        1000
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe("Self-referral commissions are prohibited.");
      expect(mockTx.referralFraudFlag.create).toHaveBeenCalled();
    });
  });

  describe("8. Review Eligibility & Rating Validation", () => {
    it("should allow CHECKED_IN guest to review after event date has started", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "u-1",
        travelerProfile: { id: "t-1" },
      });

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "b-checkedin",
        travelerId: "t-1",
        status: BookingStatus.CHECKED_IN,
        payments: [{ amount: 200 }],
        wedding: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        },
      });

      (prisma.refund.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);

      const eligibility = await evaluateReviewEligibility({
        userId: "u-1",
        bookingId: "b-checkedin",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(eligibility.eligible).toBe(true);
    });

    it("should reject reviews with invalid rating outside [1, 5]", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "u-1",
        role: UserRole.TRAVELER,
      });

      await expect(
        submitReviewAction({
          bookingId: "b-1",
          rating: 6, // Out of bounds
          comment: "Super great experience!",
        })
      ).rejects.toThrow("INVALID_RATING: Rating must be an integer between 1 and 5.");
    });
  });

  describe("9. Safe Wedding Soft Deletion", () => {
    it("should soft delete wedding if bookings exist instead of throwing foreign key error", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "host-user-1",
        role: UserRole.COUPLE,
      });

      (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
        id: "w-delete-test",
        hostCoupleId: "couple-1",
        hostCouple: { id: "couple-1", userId: "host-user-1" },
        bookings: [{ id: "b-existing-1", status: BookingStatus.CANCELLED }],
      });

      (prisma.wedding.update as jest.Mock).mockResolvedValue({
        id: "w-delete-test",
        status: WeddingStatus.DRAFT,
        suspended: true,
      });

      const result = await deleteWedding("w-delete-test");
      expect(result.success).toBe(true);
      expect(prisma.wedding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "w-delete-test" },
          data: expect.objectContaining({
            status: WeddingStatus.DRAFT,
            suspended: true,
          }),
        })
      );
    });
  });
});

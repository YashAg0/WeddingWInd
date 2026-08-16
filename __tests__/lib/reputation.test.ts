/**
 * __tests__/lib/reputation.test.ts
 *
 * Unit tests for Bayesian Average Ratings, Review Eligibility, and Heuristic Fraud Signals.
 * Run: npx jest __tests__/lib/reputation.test.ts
 */

import { calculateBayesianRating } from "@/lib/services/trust-score";
import { evaluateReviewEligibility } from "@/lib/services/review-eligibility";
import { evaluateReviewFraud } from "@/lib/services/review-fraud";
import { BookingStatus, ReviewType, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Mock safety checks and prisma
jest.mock("@/lib/actions/safety", () => ({
  checkUserRestriction: jest.fn().mockResolvedValue(false)
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0)
    },
    review: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn()
    },
    safetyCase: {
      count: jest.fn()
    },
    reputationProfile: {
      upsert: jest.fn(),
      findUnique: jest.fn()
    },
    trustScoreSnapshot: {
      create: jest.fn(),
      findFirst: jest.fn()
    },
    agentReferral: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([])
    },
    refund: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0)
    },
    guestCheckIn: {
      count: jest.fn().mockResolvedValue(1)
    },
    reputationEvent: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0)
    },
    cancellationRequest: {
      count: jest.fn().mockResolvedValue(0)
    },
    qualityBadge: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    },
    userQualityBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    weddingQualityBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    coupleProfile: {
      findUnique: jest.fn()
    },
    travelerProfile: {
      findUnique: jest.fn()
    },
    wedding: {
      findUnique: jest.fn()
    }
  }
}));

describe("Reputation Engine tests", () => {
  
  describe("Bayesian Rating Calculations", () => {
    
    it("should return marketplace default average (4.5) when review count is 0", async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      
      const res = await calculateBayesianRating("test-wedding-id");
      expect(res.avgRating).toBe(4.5);
      expect(res.bayesianRating).toBe(4.5);
      expect(res.reviewCount).toBe(0);
    });

    it("should calculate correct weighted Bayesian rating with review counts", async () => {
      // Mock 1 review with 5 stars
      // Bayesian formula: (5.0 * 1 + 4.5 * 3) / (1 + 3) = (5 + 13.5) / 4 = 18.5 / 4 = 4.625 => 4.63
      (prisma.review.findMany as jest.Mock).mockResolvedValue([
        { rating: 5 }
      ]);
      
      const res = await calculateBayesianRating("test-wedding-id");
      expect(res.avgRating).toBe(5.0);
      expect(res.bayesianRating).toBe(4.63);
      expect(res.reviewCount).toBe(1);
    });

    it("should shift closer to real average as review volume increases", async () => {
      // Mock 12 reviews averaging 4.8 stars
      // Bayesian: (4.8 * 12 + 4.5 * 3) / (12 + 3) = (57.6 + 13.5) / 15 = 71.1 / 15 = 4.74
      const mockReviews = Array.from({ length: 12 }, () => ({ rating: 4.8 }));
      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      
      const res = await calculateBayesianRating("test-wedding-id");
      expect(res.avgRating).toBe(4.8);
      expect(res.bayesianRating).toBe(4.74);
      expect(res.reviewCount).toBe(12);
    });
  });

  describe("Review Eligibility Safeguards", () => {
    
    it("should reject review if user is banned", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        status: UserStatus.BANNED
      });

      const res = await evaluateReviewEligibility({
        userId: "user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("USER_BANNED");
    });

    it("should reject review if traveler does not own the booking", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "my-traveler-id" }
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "someone-elses-id",
        status: BookingStatus.COMPLETED,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [],
        refunds: []
      });

      const res = await evaluateReviewEligibility({
        userId: "user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("NOT_BOOKING_OWNER");
    });

    it("should reject review if booking has not checked in or completed", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "my-traveler-id" }
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "my-traveler-id",
        status: BookingStatus.APPROVED, // only approved, not checked-in/attended
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [],
        refunds: []
      });

      const res = await evaluateReviewEligibility({
        userId: "user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });

    it("should reject review if booking is only CHECKED_IN but not completed/attended", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "my-traveler-id" }
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "my-traveler-id",
        status: BookingStatus.PENDING,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [],
        refunds: []
      });

      const res = await evaluateReviewEligibility({
        userId: "user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });
  });

  describe("Heuristic Fraud Signal Engine", () => {
    
    it("should flag SELF_REVIEW when traveler tries to review their own hosted wedding", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        traveler: { userId: "host-user-id" },
        wedding: {
          hostCouple: {
            userId: "host-user-id",
            user: { name: "Host Couple" }
          }
        }
      });

      const res = await evaluateReviewFraud({
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 5,
        comment: "Amazing experience!"
      }, "host-user-id");

      const selfReviewSignal = res.signals.find(s => s.type === "SELF_REVIEW");
      expect(selfReviewSignal).toBeDefined();
      expect(selfReviewSignal?.severity).toBe("CRITICAL");
      expect(selfReviewSignal?.score).toBe(1.0);
    });

    it("should flag DUPLICATE_CONTENT when exact review comment text exists elsewhere", async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        traveler: { userId: "traveler-user-id" },
        wedding: {
          hostCouple: {
            userId: "host-user-id",
            user: { name: "Host Couple" }
          }
        }
      });

      (prisma.review.findFirst as jest.Mock).mockResolvedValue({
        id: "other-review-id",
        comment: "Copped duplicate review content text."
      });

      const res = await evaluateReviewFraud({
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 5,
        comment: "Copped duplicate review content text."
      }, "traveler-user-id");

      const dupSignal = res.signals.find(s => s.type === "DUPLICATE_CONTENT");
      expect(dupSignal).toBeDefined();
      expect(dupSignal?.severity).toBe("HIGH");
      expect(dupSignal?.score).toBe(0.95);
    });
  });

  describe("Trust Score Snapshot Thresholds", () => {
    it("should write snapshot if delta is greater than or equal to 1", async () => {
      const { recalculateTrustScore } = require("@/lib/services/trust-score");
      (prisma.reputationEvent.findMany as jest.Mock).mockResolvedValue([
        { scoreEffect: 5 }
      ]);
      (prisma.trustScoreSnapshot.findFirst as jest.Mock).mockResolvedValue({
        overallScore: 80
      });

      const score = await recalculateTrustScore("HOST", "test-host-id");
      expect(score).toBe(85);
      expect(prisma.trustScoreSnapshot.create).toHaveBeenCalled();
    });

    it("should NOT write snapshot if delta is less than 1 (no material change)", async () => {
      const { recalculateTrustScore } = require("@/lib/services/trust-score");
      jest.clearAllMocks();
      (prisma.reputationEvent.findMany as jest.Mock).mockResolvedValue([
        { scoreEffect: 0.4 } // delta will be rounded to 0
      ]);
      (prisma.trustScoreSnapshot.findFirst as jest.Mock).mockResolvedValue({
        overallScore: 80
      });

      const score = await recalculateTrustScore("HOST", "test-host-id");
      expect(score).toBe(80);
      expect(prisma.trustScoreSnapshot.create).not.toHaveBeenCalled();
    });
  });

  describe("Badge Evaluation Rules", () => {
    it("should award Reliable Host badge only if host has at least 3 completed bookings", async () => {
      const { evaluateEntityBadges } = require("@/lib/services/badges");
      
      // Setup mock data for reliable host evaluation:
      (prisma.reputationProfile.findUnique as jest.Mock).mockResolvedValue({
        overallScore: 90
      });
      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "host-id",
        userId: "host-user-id",
        user: {
          verification: {
            status: "APPROVED"
          }
        }
      });
      (prisma.qualityBadge.findUnique as jest.Mock).mockImplementation((params) => {
        if (params.where.key === "reliable-host" || params.where.key === "verified-host") {
          return { id: "badge-id", active: true };
        }
        return null;
      });
      (prisma.cancellationRequest.count as jest.Mock).mockResolvedValue(0);
      
      // 1. With 2 completed bookings: meets cancellation/score, but lacks completedBookingsCount >= 3
      (prisma.booking.count as jest.Mock).mockResolvedValue(2);
      (prisma.userQualityBadge.findUnique as jest.Mock).mockResolvedValue(null);
      
      await evaluateEntityBadges("HOST", "host-id");
      
      // Should not create userQualityBadge (meetsReliable = false)
      expect(prisma.userQualityBadge.create).not.toHaveBeenCalled();

      // 2. With 3 completed bookings: should award the badge
      jest.clearAllMocks();
      (prisma.booking.count as jest.Mock).mockResolvedValue(3);
      (prisma.reputationProfile.findUnique as jest.Mock).mockResolvedValue({
        overallScore: 90
      });
      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "host-id",
        userId: "host-user-id",
        user: {
          verification: {
            status: "APPROVED"
          }
        }
      });
      (prisma.qualityBadge.findUnique as jest.Mock).mockImplementation((params) => {
        if (params.where.key === "reliable-host" || params.where.key === "verified-host") {
          return { id: "badge-id", active: true };
        }
        return null;
      });
      (prisma.cancellationRequest.count as jest.Mock).mockResolvedValue(0);
      (prisma.booking.count as jest.Mock).mockResolvedValue(3);
      
      await evaluateEntityBadges("HOST", "host-id");
      
      expect(prisma.userQualityBadge.create).toHaveBeenCalled();
    });
  });
});

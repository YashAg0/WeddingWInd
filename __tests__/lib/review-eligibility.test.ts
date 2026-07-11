/**
 * __tests__/lib/review-eligibility.test.ts
 *
 * Verification tests for Phase 14.7 Review Directions, Eligibility States, and Role Constraints.
 */

import { evaluateReviewEligibility } from "@/lib/services/review-eligibility";
import { BookingStatus, ReviewType, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/actions/safety", () => ({
  checkUserRestriction: jest.fn().mockResolvedValue(false),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
    },
    agentReferral: {
      findFirst: jest.fn(),
    },
    refund: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

describe("Review Directions & Eligibility Lifecycle Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("A. Review Directions", () => {
    it("should allow TRAVELER_TO_WEDDING success on attended booking", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "traveler-id" },
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.ATTENDED,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
        refunds: [],
      });
      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(true);
    });

    it("should allow HOST_TO_TRAVELER success on checked_in guest", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "host-user-id",
        status: UserStatus.ACTIVE,
        coupleProfile: { id: "host-id" },
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.CHECKED_IN,
        wedding: { hostCoupleId: "host-id" },
      });
      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await evaluateReviewEligibility({
        userId: "host-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.HOST_TO_TRAVELER,
      });

      expect(res.eligible).toBe(true);
    });

    it("should allow TRAVELER_TO_AGENT success with referral context", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "traveler-id" },
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.COMPLETED,
        wedding: { hostCoupleId: "host-id" },
      });
      (prisma.agentReferral.findFirst as jest.Mock).mockResolvedValue({
        id: "referral-id",
        agentId: "agent-id",
      });
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({
        id: "booking-id",
      });
      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_AGENT,
      });

      expect(res.eligible).toBe(true);
    });

    it("should allow SYSTEM_FEEDBACK for admin only", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "admin-user-id",
        status: UserStatus.ACTIVE,
        role: "ADMIN",
      });
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
      });
      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await evaluateReviewEligibility({
        userId: "admin-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.SYSTEM_FEEDBACK,
      });

      expect(res.eligible).toBe(true);
    });

    it("should reject SYSTEM_FEEDBACK for non-admin traveler", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        status: UserStatus.ACTIVE,
        role: "TRAVELER",
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.SYSTEM_FEEDBACK,
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("UNAUTHORIZED_FEEDBACK");
    });
  });

  describe("B. Eligibility States", () => {
    const setupTravelerUser = () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        status: UserStatus.ACTIVE,
        travelerProfile: { id: "traveler-id" },
      });
    };

    it("should reject CHECKED_IN for traveler", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.CHECKED_IN,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });

    it("should reject PAID status traveler reviews", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.PAID,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });

    it("should reject CONFIRMED / APPROVED status reviews", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.APPROVED,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });

    it("should reject NO_SHOW traveler reviews", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.NO_SHOW,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
      expect(res.reasonCode).toBe("INVALID_ATTENDANCE");
    });

    it("should reject REFUNDED traveler reviews", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.REFUNDED,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
    });

    it("should reject CANCELLED traveler reviews", async () => {
      setupTravelerUser();
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-id",
        travelerId: "traveler-id",
        status: BookingStatus.CANCELLED,
        wedding: { hostCoupleId: "host-id", date: new Date(Date.now() - 10000) },
        payments: [{ amount: 100 }],
      });

      const res = await evaluateReviewEligibility({
        userId: "traveler-user-id",
        bookingId: "booking-id",
        reviewType: ReviewType.TRAVELER_TO_WEDDING,
      });

      expect(res.eligible).toBe(false);
    });
  });
});

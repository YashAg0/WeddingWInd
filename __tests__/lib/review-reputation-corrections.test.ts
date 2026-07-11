/**
 * __tests__/lib/review-reputation-corrections.test.ts
 *
 * Verification tests for Phase 14.7 Review Edit, Deletion, and Moderation score adjustments.
 */

import { editReviewAction, deleteReviewAction, adminModerateReviewAction } from "@/lib/actions/reviews";
import { logReputationEvent } from "@/lib/services/reputation";
import { prisma } from "@/lib/prisma";
import { ReviewType } from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "traveler-user-id", role: "TRAVELER", travelerProfile: { id: "traveler-id" } }),
  isAdmin: jest.fn().mockResolvedValue(true)
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/services/review-fraud", () => ({
  evaluateReviewFraud: jest.fn().mockResolvedValue({ detected: false, signals: [] }),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    booking: {
      findUnique: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
    },
    agentReferral: {
      findFirst: jest.fn(),
    },
    safetyCase: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(prisma);
    }),
  },
}));

describe("Review Reputation Corrections Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate correct delta and emit deterministic events on edit (5 -> 1)", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      bookingId: "booking-id",
      travelerId: "traveler-id",
      rating: 5,
      type: ReviewType.TRAVELER_TO_WEDDING,
      status: "PUBLISHED",
      createdAt: new Date(),
      editCount: 0,
    });
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      weddingId: "wedding-id",
      traveler: { userId: "traveler-user-id" },
    });
    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-id",
      hostCoupleId: "host-id",
    });

    await editReviewAction({
      reviewId: "review-id",
      rating: 1,
      comment: "Updated bad comment text.",
    });

    // Old Rating = 5 (effect = 3)
    // New Rating = 1 (effect = -5)
    // Diff = -8
    expect(logReputationEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "WEDDING",
      scoreEffect: -8,
      idempotencyKey: "EDIT_REVIEW_DIFF:review-id:1:WEDDING",
    }));
  });

  it("should calculate correct delta and emit deterministic events on edit (1 -> 5)", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      bookingId: "booking-id",
      travelerId: "traveler-id",
      rating: 1,
      type: ReviewType.TRAVELER_TO_WEDDING,
      status: "PUBLISHED",
      createdAt: new Date(),
      editCount: 1,
    });
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      weddingId: "wedding-id",
      traveler: { userId: "traveler-user-id" },
    });
    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-id",
      hostCoupleId: "host-id",
    });

    await editReviewAction({
      reviewId: "review-id",
      rating: 5,
      comment: "Updated back to excellent.",
    });

    // Old Rating = 1 (effect = -5)
    // New Rating = 5 (effect = 3)
    // Diff = 8
    expect(logReputationEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "WEDDING",
      scoreEffect: 8,
      idempotencyKey: "EDIT_REVIEW_DIFF:review-id:2:WEDDING",
    }));
  });

  it("should NOT emit event on text-only edit (5 -> 5)", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      bookingId: "booking-id",
      travelerId: "traveler-id",
      rating: 5,
      type: ReviewType.TRAVELER_TO_WEDDING,
      status: "PUBLISHED",
      createdAt: new Date(),
      editCount: 2,
    });
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      weddingId: "wedding-id",
      traveler: { userId: "traveler-user-id" },
    });

    await editReviewAction({
      reviewId: "review-id",
      rating: 5,
      comment: "Just changing the comment text, rating stays 5.",
    });

    expect(logReputationEvent).not.toHaveBeenCalled();
  });

  it("should correctly revert score on soft deletion", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      bookingId: "booking-id",
      travelerId: "traveler-id",
      rating: 5,
      type: ReviewType.TRAVELER_TO_WEDDING,
      status: "PUBLISHED",
      createdAt: new Date(),
    });
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      weddingId: "wedding-id",
      traveler: { userId: "traveler-user-id" },
    });
    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-id",
      hostCoupleId: "host-id",
    });

    await deleteReviewAction("review-id");

    // Old Rating = 5 (effect = 3)
    // New Rating = null (effect = 0)
    // Diff = -3
    expect(logReputationEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "WEDDING",
      scoreEffect: -3,
      idempotencyKey: "REVERT_REVIEW:review-id:WEDDING",
    }));
  });
});

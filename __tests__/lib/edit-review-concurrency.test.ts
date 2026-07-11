/**
 * __tests__/lib/edit-review-concurrency.test.ts
 *
 * Verification tests for Phase 14.8 Edit Review optimistic concurrency control (OCC).
 */

import { editReviewAction } from "@/lib/actions/reviews";
import { prisma } from "@/lib/prisma";
import { logReputationEvent } from "@/lib/services/reputation";
import { ReviewType } from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({
    id: "traveler-user-id",
    role: "TRAVELER",
    travelerProfile: { id: "traveler-id" },
  }),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/services/review-fraud", () => ({
  evaluateReviewFraud: jest.fn().mockResolvedValue({ detected: false, signals: [] }),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    booking: {
      findUnique: jest.fn().mockResolvedValue({
        id: "booking-id",
        weddingId: "wedding-id",
        traveler: { userId: "traveler-user-id" },
      }),
    },
    wedding: {
      findUnique: jest.fn().mockResolvedValue({
        id: "wedding-id",
        hostCoupleId: "host-id",
      }),
    },
  },
}));

describe("Review Edit - Optimistic Concurrency Control (OCC) retry policy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should succeed on first attempt if no concurrent edits occur", async () => {
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

    (prisma.review.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await editReviewAction({
      reviewId: "review-id",
      rating: 2,
      comment: "Updated bad comment",
    });

    expect(res.success).toBe(true);
    expect(prisma.review.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.review.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.review.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "review-id", editCount: 0 },
      })
    );

    // Reputation adjustment uses the successful revision (editCount = 1)
    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "EDIT_REVIEW_DIFF:review-id:1:WEDDING",
        scoreEffect: -8, // 5 (effect 3) -> 2 (effect -5) => net diff = -8
      })
    );
  });

  it("should retry if a concurrent edit updates the editCount (count = 0) and succeed on retry", async () => {
    // Attempt 1: read editCount = 0, updateMany fails (count = 0)
    // Attempt 2: read editCount = 1 (updated by competitor), updateMany succeeds (count = 1)
    (prisma.review.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: "review-id",
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 5,
        type: ReviewType.TRAVELER_TO_WEDDING,
        status: "PUBLISHED",
        createdAt: new Date(),
        editCount: 0,
      })
      .mockResolvedValueOnce({
        id: "review-id",
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 5,
        type: ReviewType.TRAVELER_TO_WEDDING,
        status: "PUBLISHED",
        createdAt: new Date(),
        editCount: 1,
      });

    (prisma.review.updateMany as jest.Mock)
      .mockResolvedValueOnce({ count: 0 }) // Conflict!
      .mockResolvedValueOnce({ count: 1 }); // Success!

    const res = await editReviewAction({
      reviewId: "review-id",
      rating: 2,
      comment: "Updated bad comment",
    });

    expect(res.success).toBe(true);
    expect(prisma.review.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.review.updateMany).toHaveBeenCalledTimes(2);

    // Verify first updateMany targeted editCount: 0
    expect(prisma.review.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "review-id", editCount: 0 },
      })
    );

    // Verify second updateMany targeted editCount: 1
    expect(prisma.review.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "review-id", editCount: 1 },
      })
    );

    // Reputation adjustment uses the successful revision (editCount = 2)
    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "EDIT_REVIEW_DIFF:review-id:2:WEDDING",
        scoreEffect: -8,
      })
    );
  });

  it("should fail with concurrency conflict error after max attempts (5) of consecutive conflicts", async () => {
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

    (prisma.review.updateMany as jest.Mock).mockResolvedValue({ count: 0 }); // Always conflicts

    await expect(
      editReviewAction({
        reviewId: "review-id",
        rating: 2,
        comment: "Updated bad comment",
      })
    ).rejects.toThrow(
      "CONCURRENCY_CONFLICT: Unable to update review due to concurrent modifications. Please try again."
    );

    expect(prisma.review.findUnique).toHaveBeenCalledTimes(5);
    expect(prisma.review.updateMany).toHaveBeenCalledTimes(5);
    expect(logReputationEvent).not.toHaveBeenCalled();
  });
});

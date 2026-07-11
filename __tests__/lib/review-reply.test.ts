/**
 * __tests__/lib/review-reply.test.ts
 *
 * Verification tests for Phase 14.7 Review Replies, Soft Delete history, and Host Authorizations.
 */

import { replyToReviewAction, removeReviewReplyAction } from "@/lib/actions/reviews";
import { prisma } from "@/lib/prisma";

let currentUserId = "host-user-id";
let currentUserCoupleProfileId = "host-id";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockImplementation(async () => ({
    id: currentUserId,
    role: "COUPLE",
    coupleProfile: { id: currentUserCoupleProfileId },
  })),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reviewReply: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Review Reply Soft Delete & History Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentUserId = "host-user-id";
    currentUserCoupleProfileId = "host-id";
  });

  it("should reject reply creation if actor is not the wedding host", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      booking: {
        wedding: {
          hostCoupleId: "actual-host-id",
        },
      },
    });

    currentUserCoupleProfileId = "wrong-host-id";

    await expect(
      replyToReviewAction({
        reviewId: "review-id",
        content: "Host reply content",
      })
    ).rejects.toThrow("Only the host of this wedding can reply to this review.");
  });

  it("should prevent duplicate active replies but allow creation after soft deletion", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      booking: {
        wedding: {
          hostCoupleId: "host-id",
        },
      },
    });

    // 1. Block duplicate active reply
    (prisma.reviewReply.findFirst as jest.Mock).mockResolvedValue({
      id: "reply-id",
      content: "First reply content",
    });

    await expect(
      replyToReviewAction({
        reviewId: "review-id",
        content: "Second reply content",
      })
    ).rejects.toThrow("You have already replied to this review.");

    // 2. Allow if previous reply was soft-deleted (findFirst returns null for deletedAt: null query)
    jest.clearAllMocks();
    (prisma.reviewReply.findFirst as jest.Mock).mockResolvedValue(null);

    await replyToReviewAction({
      reviewId: "review-id",
      content: "New reply content",
    });

    expect(prisma.reviewReply.create).toHaveBeenCalled();
  });

  it("should soft delete reply by updating deletedAt timestamp", async () => {
    (prisma.reviewReply.findUnique as jest.Mock).mockResolvedValue({
      id: "reply-id",
      reviewId: "review-id",
      review: {
        booking: {
          wedding: {
            hostCoupleId: "host-id",
          },
        },
      },
    });

    await removeReviewReplyAction("reply-id");

    expect(prisma.reviewReply.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "reply-id" },
        data: { deletedAt: expect.any(Date) },
      })
    );
  });
});

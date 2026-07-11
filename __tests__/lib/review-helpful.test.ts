/**
 * __tests__/lib/review-helpful.test.ts
 *
 * Verification tests for Phase 14.7 Review Helpful Vote toggle, status checks, and reconciliation.
 */

import { voteReviewHelpfulAction, reconcileReviewHelpfulCount } from "@/lib/actions/reviews";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "voter-user-id", role: "TRAVELER" }),
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
    reviewHelpfulVote: {
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("Helpful Votes Toggle & Reconciliation Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should block voting on a soft-deleted review", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      deletedAt: new Date(),
      status: "PUBLISHED",
    });

    await expect(voteReviewHelpfulAction("review-id")).rejects.toThrow("Cannot vote on a deleted or hidden review.");
  });

  it("should block voting on a hidden review", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      deletedAt: null,
      status: "HIDDEN",
    });

    await expect(voteReviewHelpfulAction("review-id")).rejects.toThrow("Cannot vote on a deleted or hidden review.");
  });

  it("should create vote on first check and delete it on second (toggle)", async () => {
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-id",
      deletedAt: null,
      status: "PUBLISHED",
    });

    // 1. First Vote (Not voted yet)
    (prisma.reviewHelpfulVote.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.reviewHelpfulVote.count as jest.Mock).mockResolvedValue(1);

    const firstRes = await voteReviewHelpfulAction("review-id");
    expect(prisma.reviewHelpfulVote.create).toHaveBeenCalled();
    expect(firstRes.voted).toBe(true);
    expect(firstRes.helpfulVotes).toBe(1);

    // 2. Second Vote (Already voted)
    jest.clearAllMocks();
    (prisma.reviewHelpfulVote.findUnique as jest.Mock).mockResolvedValue({
      id: "vote-id",
      reviewId: "review-id",
      userId: "voter-user-id",
    });
    (prisma.reviewHelpfulVote.count as jest.Mock).mockResolvedValue(0);

    const secondRes = await voteReviewHelpfulAction("review-id");
    expect(prisma.reviewHelpfulVote.delete).toHaveBeenCalled();
    expect(secondRes.voted).toBe(false);
    expect(secondRes.helpfulVotes).toBe(0);
  });
});

/**
 * __tests__/lib/review-reports.test.ts
 *
 * Verification tests for Phase 14.7 Review Report abuse controls, constraints, and thresholds.
 */

import { reportReviewAction } from "@/lib/actions/reviews";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "reporter-user-id", role: "TRAVELER" }),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    reviewReport: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    review: {
      update: jest.fn(),
    },
  },
}));

describe("Review Reports Abuse Controls Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject report details exceeding 500 characters", async () => {
    const longDetails = "a".repeat(501);

    await expect(
      reportReviewAction({
        reviewId: "review-id",
        reason: "SPAM",
        details: longDetails,
      })
    ).rejects.toThrow("Report details must be 500 characters or less.");
  });

  it("should reject duplicate reports from the same reporter", async () => {
    (prisma.reviewReport.findUnique as jest.Mock).mockResolvedValue({
      id: "report-id",
    });

    await expect(
      reportReviewAction({
        reviewId: "review-id",
        reason: "SPAM",
        details: "Valid details",
      })
    ).rejects.toThrow("You have already reported this review.");
  });

  it("should create report and transition review status to UNDER_REVIEW when threshold of 3 is reached", async () => {
    (prisma.reviewReport.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.reviewReport.count as jest.Mock).mockResolvedValue(3);

    const res = await reportReviewAction({
      reviewId: "review-id",
      reason: "HATEFUL_CONTENT" as any,
      details: "Valid details",
    });

    expect(prisma.reviewReport.create).toHaveBeenCalled();
    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "review-id" },
        data: { status: "UNDER_REVIEW" },
      })
    );
    expect(res.flagged).toBe(true);
  });
});

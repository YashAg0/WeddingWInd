/**
 * __tests__/lib/badges.test.ts
 *
 * Verification tests for Phase 14.7 Quality Badges, verified host badge, reliable host badge,
 * guest-favorite badge, and trusted traveler badge awards/revocations.
 */

import { evaluateEntityBadges } from "@/lib/services/badges";
import { prisma } from "@/lib/prisma";
import { ReputationEntityType } from "@prisma/client";

jest.mock("@/lib/services/trust-score", () => ({
  calculateBayesianRating: jest.fn().mockResolvedValue({
    avgRating: 4.9,
    bayesianRating: 4.85,
    reviewCount: 6,
  }),
  getPublishedReviewWhere: jest.fn().mockImplementation((extraWhere) => ({
    status: "PUBLISHED",
    deletedAt: null,
    ...extraWhere
  })),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    reputationProfile: {
      findUnique: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn(),
    },
    travelerProfile: {
      findUnique: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
    },
    qualityBadge: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    safetyCase: {
      count: jest.fn(),
    },
    cancellationRequest: {
      count: jest.fn(),
    },
    booking: {
      count: jest.fn(),
    },
    userQualityBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    weddingQualityBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Quality Badge Award & Revocation Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should award Verified Host badge only if verified status is APPROVED and overall score is >= 80", async () => {
    (prisma.reputationProfile.findUnique as jest.Mock).mockResolvedValue({
      overallScore: 85,
    });
    (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue({
      id: "host-id",
      userId: "host-user-id",
      user: {
        verification: { status: "APPROVED" },
      },
    });
    (prisma.qualityBadge.findUnique as jest.Mock).mockResolvedValue({
      id: "badge-id",
      active: true,
      key: "verified-host",
    });
    (prisma.safetyCase.count as jest.Mock).mockResolvedValue(0);
    (prisma.userQualityBadge.findUnique as jest.Mock).mockResolvedValue(null);

    await evaluateEntityBadges(ReputationEntityType.HOST, "host-id");

    expect(prisma.userQualityBadge.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "host-user-id",
          badgeId: "badge-id",
        })
      })
    );
  });

  it("should soft-revoke Verified Host badge if overall score falls below 80", async () => {
    (prisma.reputationProfile.findUnique as jest.Mock).mockResolvedValue({
      overallScore: 75, // falls below 80
    });
    (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue({
      id: "host-id",
      userId: "host-user-id",
      user: {
        verification: { status: "APPROVED" },
      },
    });
    (prisma.qualityBadge.findUnique as jest.Mock).mockResolvedValue({
      id: "badge-id",
      active: true,
      key: "verified-host",
    });
    (prisma.safetyCase.count as jest.Mock).mockResolvedValue(0);
    (prisma.userQualityBadge.findUnique as jest.Mock).mockResolvedValue({
      id: "user-badge-id",
      revokedAt: null,
    });

    await evaluateEntityBadges(ReputationEntityType.HOST, "host-id");

    expect(prisma.userQualityBadge.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-badge-id" },
        data: expect.objectContaining({
          revokedAt: expect.any(Date),
        }),
      })
    );
  });
});

/**
 * __tests__/lib/discovery-ranking.test.ts
 *
 * Verification tests for Phase 14.7 Discovery Relevance Ranking formula, clamping,
 * and stable sorting tie-breakers.
 */

import { searchWeddingsAction } from "@/lib/actions/discovery";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    wedding: {
      findMany: jest.fn(),
    },
    reputationProfile: {
      findUnique: jest.fn(),
    },
    weddingQualityBadge: {
      findFirst: jest.fn(),
    },
    reviewFraudSignal: {
      count: jest.fn(),
    },
    review: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    safetyCase: {
      count: jest.fn().mockResolvedValue(0),
    },
    searchAnalytics: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Discovery Relevance Ranking Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should clamp manualTrendingBoost below 0.0 to 0.0, and above 5.0 to 5.0", async () => {
    (prisma.wedding.findMany as jest.Mock).mockResolvedValue([
      {
        id: "wedding-1",
        title: "Negative Boost Wedding",
        location: "Mumbai, Maharashtra",
        category: "Royal",
        manualTrendingBoost: -3.5,
        bookings: [],
        featured: false,
      },
      {
        id: "wedding-2",
        title: "High Boost Wedding",
        location: "Mumbai, Maharashtra",
        category: "Royal",
        manualTrendingBoost: 12.0,
        bookings: [],
        featured: false,
      },
    ]);

    (prisma.reputationProfile.findUnique as jest.Mock).mockResolvedValue({
      overallScore: 80,
    });
    (prisma.weddingQualityBadge.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.reviewFraudSignal.count as jest.Mock).mockResolvedValue(0);

    const res = await searchWeddingsAction({ query: "Mumbai" });

    // Relevance score formula:
    // (w.featured ? 40 : 0) + (cappedBoost * 8) + (trustScore * 0.4) + (bayesianRating * 4) + ...
    // Capped boost for wedding-1 should be 0.0 => score effect: 0 * 8 = 0
    // Capped boost for wedding-2 should be 5.0 => score effect: 5 * 8 = 40
    const w1 = res.weddings.find((w) => w.id === "wedding-1");
    const w2 = res.weddings.find((w) => w.id === "wedding-2");

    expect(w1).toBeDefined();
    expect(w2).toBeDefined();

    // Trust score score effect: 80 * 0.4 = 32
    // Bayesian prior: 4.5 * 4 = 18
    // Total for w1 = 0 + 0 + 32 + 18 = 50
    // Total for w2 = 0 + 40 + 32 + 18 = 90
    expect(w1?.relevanceScore).toBe(50);
    expect(w2?.relevanceScore).toBe(90);
  });
});

/**
 * __tests__/lib/review-aggregates.test.ts
 *
 * Verification tests for Phase 14.7 getWeddingRatingAggregate service, null safety,
 * star distribution, and Bayesian weighting.
 */

import { getWeddingRatingAggregate } from "@/lib/services/trust-score";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
    },
  },
}));

describe("Review Aggregates & Bayesian Weighting Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return clean default unrated schema when there are no reviews", async () => {
    (prisma.review.findMany as jest.Mock).mockResolvedValue([]);

    const res = await getWeddingRatingAggregate("wedding-id");

    expect(res.averageRating).toBe(4.5); // default fallback
    expect(res.reviewCount).toBe(0);
    expect(res.bayesianRating).toBe(4.5);
    expect(res.categoryAverages.food).toBeNull();
  });

  it("should calculate correct average, star distribution, and category averages", async () => {
    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      {
        rating: 5,
        ratingFood: 5,
        ratingCulture: 4,
        ratingHospitality: null,
      },
      {
        rating: 3,
        ratingFood: 3,
        ratingCulture: null,
        ratingHospitality: 5,
      },
    ]);

    const res = await getWeddingRatingAggregate("wedding-id");

    expect(res.averageRating).toBe(4.0); // (5 + 3) / 2
    expect(res.reviewCount).toBe(2);
    expect(res.starDistribution[5]).toBe(1);
    expect(res.starDistribution[3]).toBe(1);
    expect(res.categoryAverages.food).toBe(4.0); // (5 + 3) / 2
    expect(res.categoryAverages.culture).toBe(4.0); // only 1 review had a value
    expect(res.categoryAverages.hospitality).toBe(5.0); // only 1 review had a value
  });

  it("should compute Bayesian Rating using formula (R * v + C * m) / (v + m)", async () => {
    // 3 reviews of 5.0 stars
    // Prior C = 4.5, weight m = 3
    // W = (5.0 * 3 + 4.5 * 3) / (3 + 3) = (15 + 13.5) / 6 = 28.5 / 6 = 4.75
    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      { rating: 5 },
      { rating: 5 },
      { rating: 5 },
    ]);

    const res = await getWeddingRatingAggregate("wedding-id");

    expect(res.bayesianRating).toBe(4.75);
  });
});

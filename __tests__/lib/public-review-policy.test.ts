/**
 * __tests__/lib/public-review-policy.test.ts
 *
 * Direct production-helper test for getPublishedReviewWhere policy.
 */

import { getPublishedReviewWhere, getWeddingRatingAggregate } from "@/lib/services/trust-score";
import { getWeddingBySlug } from "@/lib/actions/index";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    wedding: {
      findUnique: jest.fn().mockResolvedValue({
        id: "wedding-id",
        slug: "test-slug",
        title: "Test Wedding",
        location: "Test Location",
        capacity: 100,
        pricePerGuest: 50,
        mainImageUrl: "http://test",
        description: "Test Description",
        category: "Royal",
        date: new Date(),
        hostCouple: {
          languagesSpoken: "English",
          familyBio: "Family Bio",
          user: { name: "Host Couple", avatar: "host-avatar" },
        },
        gallery: [],
        events: [],
        traditions: [],
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    reputationEvent: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    booking: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    reputationProfile: {
      upsert: jest.fn().mockResolvedValue({}),
    },
    trustScoreSnapshot: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("next/cache", () => ({
  unstable_cache: (cb: any) => cb,
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  __esModule: true,
  requireAuth: jest.fn().mockResolvedValue({ id: "user-id", role: "TRAVELER" }),
  syncAndGetDbUser: jest.fn().mockResolvedValue({ id: "user-id", role: "TRAVELER" }),
  requireRole: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../lib/auth", () => ({
  __esModule: true,
  requireAuth: jest.fn().mockResolvedValue({ id: "user-id", role: "TRAVELER" }),
  syncAndGetDbUser: jest.fn().mockResolvedValue({ id: "user-id", role: "TRAVELER" }),
  requireRole: jest.fn().mockResolvedValue(true),
}));

describe("Authoritative Review Validity Policy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the authoritative validity policy directly", () => {
    const policy = getPublishedReviewWhere();
    expect(policy).toEqual({
      status: "PUBLISHED",
      deletedAt: null,
    });
  });

  it("should merge validity policy with additional queries correctly", () => {
    const policy = getPublishedReviewWhere({ type: "TRAVELER_TO_WEDDING" });
    expect(policy).toEqual({
      status: "PUBLISHED",
      deletedAt: null,
      type: "TRAVELER_TO_WEDDING",
    });
  });

  it("should ensure getWeddingRatingAggregate uses the helper query policy", async () => {
    await getWeddingRatingAggregate("wedding-id");

    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: getPublishedReviewWhere({
          booking: { weddingId: "wedding-id" },
          type: "TRAVELER_TO_WEDDING",
        }),
      })
    );
  });

  it("should ensure getWeddingBySlug public query uses the helper query policy", async () => {
    await getWeddingBySlug("test-slug");

    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: getPublishedReviewWhere({
          booking: { weddingId: "wedding-id" },
          type: "TRAVELER_TO_WEDDING",
        }),
      })
    );
  });
});

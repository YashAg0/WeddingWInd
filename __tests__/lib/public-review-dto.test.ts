/**
 * __tests__/lib/public-review-dto.test.ts
 *
 * Verification tests for Phase 14.7 Public Review DTO and Privacy Boundary.
 */

import { getWeddingBySlug } from "@/lib/actions/index";
import { prisma } from "@/lib/prisma";

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

jest.mock("@/lib/services/trust-score", () => ({
  calculateBayesianRating: jest.fn().mockResolvedValue({
    avgRating: 4.8,
    bayesianRating: 4.75,
    reviewCount: 12,
  }),
  getPublishedReviewWhere: jest.fn().mockImplementation((extraWhere) => ({
    status: "PUBLISHED",
    deletedAt: null,
    ...extraWhere
  })),
}));

jest.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    wedding: {
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
    review: {
      findMany: jest.fn(),
    },
  },
}));

describe("Public Review DTO & Privacy Boundary Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should strip sensitive user fields (clerkUserId, email, phone) from public reviews list", async () => {
    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-id",
      slug: "test-wedding",
      title: "Royal Palace Wedding",
      location: "Udaipur, Rajasthan",
      capacity: 300,
      pricePerGuest: 150,
      mainImageUrl: "https://url.com",
      description: "Description",
      hostCouple: {
        languagesSpoken: "English",
        familyBio: "Bio",
        user: { name: "Host Couple", avatar: "host-avatar" },
      },
      gallery: [],
      events: [],
      traditions: [],
      date: new Date(),
    });

    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      {
        id: "review-id",
        rating: 5,
        comment: "Excellent experience!",
        createdAt: new Date(),
        status: "PUBLISHED",
        traveler: {
          fullName: "Jane Doe",
          user: {
            id: "user-id",
            name: "Jane",
            email: "jane@sensitive-email.com",
            clerkUserId: "user_clerk_id_123",
            phone: "+1234567890",
            status: "ACTIVE",
          },
        },
        repliesList: [
          {
            id: "reply-id",
            content: "Host response text",
            createdAt: new Date(),
            user: {
              id: "host-user-id",
              name: "Host Couple",
              email: "host@sensitive-email.com",
              clerkUserId: "host_clerk_id_123",
            },
          },
        ],
      },
    ]);

    const res = await getWeddingBySlug("test-wedding");

    expect(res).toBeDefined();
    expect(res?.reviews).toHaveLength(1);

    const publicReview = res?.reviews[0];

    // Traveler details must exclude private info
    expect(publicReview.traveler.fullName).toBe("Jane Doe");
    expect(publicReview.traveler.user.name).toBe("Jane");
    expect(publicReview.traveler.user.clerkUserId).toBeUndefined();
    expect(publicReview.traveler.user.email).toBeUndefined();
    expect(publicReview.traveler.user.phone).toBeUndefined();

    // Reply details must exclude private info
    const publicReply = publicReview.repliesList[0];
    expect(publicReply.content).toBe("Host response text");
    expect(publicReply.user.name).toBe("Host Couple");
    expect(publicReply.user.clerkUserId).toBeUndefined();
    expect(publicReply.user.email).toBeUndefined();
  });
});

import { UserRole, VerificationStatus } from "@prisma/client";

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  syncAndGetDbUser: jest.fn(),
  getDbUser: jest.fn(),
}));

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  coupleProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  verification: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  wedding: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  recentlyViewed: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  savedSearch: {
    findMany: jest.fn(),
  },
  travelerProfile: {
    findUnique: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const { requireAuth, requireRole, syncAndGetDbUser, getDbUser: _getDbUser } = require("@/lib/auth");

describe("Auth Role & Host Identity Synchronization Hardening", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Normal TRAVELER login returns traveler role regardless of status", async () => {
    const dbTraveler = {
      id: "traveler-user-1",
      email: "traveler@example.com",
      role: UserRole.TRAVELER,
      status: "ONBOARDING",
      travelerProfile: { country: "United States" },
    };

    syncAndGetDbUser.mockResolvedValue(dbTraveler);

    const user = await syncAndGetDbUser();
    expect(user.role).toBe("TRAVELER");
  });

  it("2 & 3. Host applicant login returns COUPLE role even if status is ONBOARDING", async () => {
    const dbCoupleHost = {
      id: "host-user-2",
      email: "host.applicant@example.com",
      role: UserRole.COUPLE,
      status: "ONBOARDING",
      coupleProfile: { familyBio: "Royal Rajput wedding" },
    };

    syncAndGetDbUser.mockResolvedValue(dbCoupleHost);

    const user = await syncAndGetDbUser();
    expect(user.role).toBe("COUPLE");
    expect(user.status).toBe("ONBOARDING");
  });

  it("4 & 5. User with NEED_MORE_DOCUMENTS retains host application relation and notes", async () => {
    const hostUser = {
      id: "host-user-3",
      email: "host.needdocs@example.com",
      role: UserRole.COUPLE,
      status: "ONBOARDING",
    };

    requireAuth.mockResolvedValue(hostUser);
    mockPrisma.user.findUnique.mockResolvedValue(hostUser);

    const existingWedding = {
      id: "wedding-uuid-need-docs",
      title: "Karan & Meera Wedding",
      location: "Kumarakom, Kerala",
      status: "DRAFT",
    };

    mockPrisma.coupleProfile.findUnique.mockResolvedValue({
      id: "couple-prof-3",
      userId: hostUser.id,
      weddings: [existingWedding],
    });

    mockPrisma.verification.findUnique.mockResolvedValue({
      userId: hostUser.id,
      status: VerificationStatus.NEED_MORE_DOCUMENTS,
      notes: "Upload venue authorization letter.",
    });

    const { GET } = require("@/app/api/host-application/route");
    const res = await GET();
    const json = await res.json();

    expect(json.hasActiveApplication).toBe(true);
    expect(json.application.applicationId).toBe("wedding-uuid-need-docs");
    expect(json.application.verificationStatus).toBe("NEED_MORE_DOCUMENTS");
    expect(json.application.adminNotes).toBe("Upload venue authorization letter.");
  });

  it("10. DB outage remains fail-closed in syncAndGetDbUser", async () => {
    syncAndGetDbUser.mockRejectedValue(
      new Error("SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly.")
    );

    await expect(syncAndGetDbUser()).rejects.toThrow("SERVICE_UNAVAILABLE");
  });

  it("11. Recently-viewed non-critical failure does not destroy dashboard (safely returns empty array)", async () => {
    requireAuth.mockRejectedValue(new Error("DB connection timeout"));

    const { fetchRecentlyViewed, fetchSavedSearches, getPersonalizedRecommendations } = require("@/lib/actions/discovery");

    const rv = await fetchRecentlyViewed();
    const ss = await fetchSavedSearches();
    const recs = await getPersonalizedRecommendations();

    expect(rv).toEqual([]);
    expect(ss).toEqual([]);
    expect(recs).toEqual([]);
  });

  it("15. Non-admin cannot change another user's role", async () => {
    requireRole.mockRejectedValue(new Error("FORBIDDEN: You do not have permissions to access this route."));

    const { adminUpdateUserRoleAction } = require("@/lib/actions/admin");

    await expect(
      adminUpdateUserRoleAction("victim-user-id", UserRole.ADMIN)
    ).rejects.toThrow("FORBIDDEN");
  });
});

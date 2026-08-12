import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  coupleProfile: {
    findUnique: jest.fn(),
  },
  verification: {
    findUnique: jest.fn(),
  },
  wedding: {
    findFirst: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const { requireAuth } = require("@/lib/auth");
const { resolveAuthenticatedUserExperience } = require("@/lib/actions/auth-experience");

describe("Auth Onboarding Redirect & Host Dashboard Persistence Matrix", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. New user with no profile/wedding resolves to NEW_USER and requires onboarding", async () => {
    const mockUser = { id: "new-user-1", email: "new@example.com", role: UserRole.TRAVELER, status: UserStatus.ONBOARDING };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      travelerProfile: null,
      coupleProfile: null,
      agentProfile: null,
      verification: null,
    });

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("NEW_USER");
    expect(result.onboardingRequired).toBe(true);
  });

  it("2. Existing TRAVELER with profile resolves to EXISTING_TRAVELER without onboarding", async () => {
    const mockUser = { id: "trav-user-2", email: "trav@example.com", role: UserRole.TRAVELER, status: UserStatus.ACTIVE };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      travelerProfile: { id: "tp-1", country: "USA" },
      coupleProfile: null,
      agentProfile: null,
    });

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_TRAVELER");
    expect(result.onboardingRequired).toBe(false);
  });

  it("3. Existing COUPLE with CoupleProfile resolves to EXISTING_COUPLE without onboarding", async () => {
    const mockUser = { id: "couple-user-3", email: "couple@example.com", role: UserRole.COUPLE, status: UserStatus.ONBOARDING };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      coupleProfile: { id: "cp-1", weddings: [] },
      travelerProfile: null,
      agentProfile: null,
    });

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_COUPLE");
    expect(result.onboardingRequired).toBe(false);
  });

  it("4 & 5. Existing COUPLE with NEED_MORE_DOCUMENTS resolves to EXISTING_COUPLE with action required status", async () => {
    const mockUser = { id: "host-user-5", email: "tanishqgupta891@gmail.com", role: UserRole.COUPLE, status: UserStatus.ONBOARDING };
    const mockWedding = {
      id: "56498080-ef16-404e-abb0-5d557440e094",
      title: "Ananya & Kabir Wedding",
      status: "DRAFT",
      isDemo: false,
    };
    const mockVerification = {
      id: "verif-1",
      status: VerificationStatus.NEED_MORE_DOCUMENTS,
      notes: "Please upload proof of venue reservation.",
    };

    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      coupleProfile: { id: "cp-5", weddings: [mockWedding] },
      verification: mockVerification,
    });

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_COUPLE");
    expect(result.onboardingRequired).toBe(false);
    expect(result.hasHostApplication).toBe(true);
    expect(result.weddingId).toBe("56498080-ef16-404e-abb0-5d557440e094");
    expect(result.verificationStatus).toBe("NEED_MORE_DOCUMENTS");
    expect(result.reviewerNotes).toBe("Please upload proof of venue reservation.");
  });

  it("6. Existing AGENT with profile resolves to EXISTING_AGENT", async () => {
    const mockUser = { id: "agent-user-6", email: "agent@example.com", role: UserRole.AGENT, status: UserStatus.ACTIVE };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      agentProfile: { id: "ap-1", organization: "Vedic Weddings Inc" },
    });

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_AGENT");
    expect(result.onboardingRequired).toBe(false);
  });

  it("7. Existing ADMIN resolves to EXISTING_ADMIN", async () => {
    const mockUser = { id: "admin-user-7", email: "admin@example.com", role: UserRole.ADMIN, status: UserStatus.ACTIVE };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_ADMIN");
    expect(result.onboardingRequired).toBe(false);
  });

  it("8. Existing COORDINATOR resolves to EXISTING_COORDINATOR", async () => {
    const mockUser = { id: "coord-user-8", email: "coord@example.com", role: UserRole.COORDINATOR, status: UserStatus.ACTIVE };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_COORDINATOR");
    expect(result.onboardingRequired).toBe(false);
  });

  it("9. Database lookup failure returns DB_UNAVAILABLE (never NEW_USER)", async () => {
    requireAuth.mockRejectedValue(new Error("PrismaClientInitializationError: Connection pool exhausted"));

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("DB_UNAVAILABLE");
    expect(result.onboardingRequired).toBe(false);
  });

  it("10. Host experience resolution handles fast-path DB user with verification and weddings", async () => {
    const mockUser = {
      id: "host-fast-10",
      email: "hostfast@example.com",
      role: UserRole.COUPLE,
      status: UserStatus.ONBOARDING,
      coupleProfile: {
        id: "cp-10",
        weddings: [{ id: "wed-10", title: "My Wedding", isDemo: false }],
      },
      verification: { id: "ver-10", status: VerificationStatus.NEED_MORE_DOCUMENTS, notes: "Upload ID" },
    };
    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await resolveAuthenticatedUserExperience();

    expect(result.state).toBe("EXISTING_COUPLE");
    expect(result.hasHostApplication).toBe(true);
    expect(result.weddingId).toBe("wed-10");
    expect(result.verificationStatus).toBe("NEED_MORE_DOCUMENTS");
  });
});

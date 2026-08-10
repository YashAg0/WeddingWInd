/**
 * __tests__/lib/m3-admin-verification.test.ts
 *
 * Comprehensive unit test suite for Milestone M3:
 * 1. R5: Founder Admin Bootstrap & Sync Verification (syncAndGetDbUser linking pending_admin, self-role elevation block).
 * 2. R6: Admin Routing Protection & Auth Redirects (sanitizeRedirectUrl, canonical /login, admin role checks).
 * 3. R7: Admin Controls & 4-Level Verification Upload Gate (UI locking, Server Action check, UploadThing middleware, DB schema unique update).
 */

import { sanitizeRedirectUrl } from "@/lib/utils";
import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";

// Mocks for Next.js and Clerk
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    const err: any = new Error(`NEXT_REDIRECT: ${url}`);
    err.digest = `NEXT_REDIRECT;${url}`;
    throw err;
  }),
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Email module
jest.mock("@/lib/email", () => ({
  sendHostApprovalWithPaymentLinkEmail: jest.fn().mockResolvedValue(undefined),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  sendHostRejectionEmail: jest.fn().mockResolvedValue(undefined),
  sendVerificationSubmittedEmail: jest.fn().mockResolvedValue(undefined),
  sendVerificationApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendVerificationRejectedEmail: jest.fn().mockResolvedValue(undefined),
}));

// Mock Attribution module
jest.mock("@/lib/attribution", () => ({
  getAttributionCookie: jest.fn().mockResolvedValue(null),
}));

// Mock Rate Limit
jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, remaining: 5 }),
}));

// Mock Stripe
jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
  },
}));

// Mock Prisma and DB availability
const now = new Date();
const mockTx = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  travelerProfile: {
    upsert: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: "notif_123" }),
    },
    $transaction: jest.fn((callback: any) => callback(mockTx)),
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

// Mock Clerk Server SDK
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
  createRouteMatcher: jest.fn(() => jest.fn()),
}));

const { prisma } = jest.requireMock("@/lib/prisma");
const { auth, currentUser } = jest.requireMock("@clerk/nextjs/server");

// Import modules under test after mocks are defined
import { syncAndGetDbUser, requireRole, isAdmin } from "@/lib/auth";
import { updateUserRoleAction, submitVerificationAction } from "@/lib/actions/index";
import { ourFileRouter } from "@/lib/storage/index";

describe("R5: Founder Admin Bootstrap & Sync Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should link pending_admin record to authenticated Clerk user ID while retaining ADMIN role and ACTIVE status", async () => {
    auth.mockResolvedValue({ userId: "clerk_founder_real_id" });
    currentUser.mockResolvedValue({
      id: "clerk_founder_real_id",
      emailAddresses: [{ emailAddress: "founder@weddingwithindia.com" }],
      firstName: "Founder",
      lastName: "Admin",
      imageUrl: "https://example.com/avatar.jpg",
    });

    const pendingAdminUser = {
      id: "founder_db_uuid_123",
      email: "founder@weddingwithindia.com",
      clerkUserId: "pending_admin_1786309454941",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      name: "Pending Founder",
      createdAt: now,
      updatedAt: now,
    };

    mockTx.user.findUnique
      .mockResolvedValueOnce(null) // existingByClerkId
      .mockResolvedValueOnce(pendingAdminUser) // findUnique existingByEmail
      .mockResolvedValueOnce({
        id: "founder_db_uuid_123",
        email: "founder@weddingwithindia.com",
        clerkUserId: "clerk_founder_real_id",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        name: "Founder Admin",
        avatar: "https://example.com/avatar.jpg",
        createdAt: now,
        updatedAt: now,
        travelerProfile: {},
        coupleProfile: null,
        agentProfile: null,
      }); // final findUnique after transaction

    mockTx.user.update.mockResolvedValue({
      id: "founder_db_uuid_123",
      clerkUserId: "clerk_founder_real_id",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });

    const result = await syncAndGetDbUser();

    expect(mockTx.user.findUnique).toHaveBeenCalledWith({
      where: { email: "founder@weddingwithindia.com" },
    });

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "founder_db_uuid_123" },
      data: {
        clerkUserId: "clerk_founder_real_id",
        name: "Founder Admin",
        avatar: "https://example.com/avatar.jpg",
      },
    });

    expect(result).toBeDefined();
    expect(result?.role).toBe(UserRole.ADMIN);
    expect(result?.status).toBe(UserStatus.ACTIVE);
    expect(result?.clerkUserId).toBe("clerk_founder_real_id");
  });

  it("should block client self-elevation attempts to ADMIN in updateUserRoleAction", async () => {
    auth.mockResolvedValue({ userId: "user_regular_123" });
    currentUser.mockResolvedValue({
      id: "user_regular_123",
      emailAddresses: [{ emailAddress: "user@example.com" }],
      firstName: "Regular",
      lastName: "User",
    });

    const regularUser = {
      id: "user_db_id_123",
      clerkUserId: "user_regular_123",
      email: "user@example.com",
      name: "Regular User",
      role: UserRole.TRAVELER,
      status: UserStatus.ONBOARDING,
      createdAt: now,
      updatedAt: now,
      travelerProfile: {},
      coupleProfile: null,
      agentProfile: null,
    };

    mockTx.user.findUnique
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser)
      .mockResolvedValueOnce(regularUser);

    mockTx.user.upsert.mockResolvedValue(regularUser);

    await expect(updateUserRoleAction(UserRole.ADMIN)).rejects.toThrow(
      "FORBIDDEN: Cannot self-assign administrative roles."
    );
  });
});

describe("R6: Admin Routing Protection & Auth Redirects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sanitizeRedirectUrl should allow valid relative internal paths starting with '/'", () => {
    expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/dashboard/admin")).toBe("/dashboard/admin");
    expect(sanitizeRedirectUrl("/weddings/test-wedding?tab=info")).toBe("/weddings/test-wedding?tab=info");
  });

  it("sanitizeRedirectUrl should reject open redirects (://, //, non-relative)", () => {
    expect(sanitizeRedirectUrl("//attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("http://evil.com/login")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeRedirectUrl(null)).toBe("/dashboard");
    expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectUrl(null, "/custom-fallback")).toBe("/custom-fallback");
  });

  it("requireRole([UserRole.ADMIN]) should reject non-admin users with FORBIDDEN error", async () => {
    auth.mockResolvedValue({ userId: "user_traveler_123" });
    currentUser.mockResolvedValue({
      id: "user_traveler_123",
      emailAddresses: [{ emailAddress: "traveler@example.com" }],
      firstName: "Traveler",
      lastName: "User",
    });

    const travelerUser = {
      id: "user_traveler_db_id",
      clerkUserId: "user_traveler_123",
      email: "traveler@example.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      travelerProfile: {},
      coupleProfile: null,
      agentProfile: null,
    };

    mockTx.user.findUnique
      .mockResolvedValueOnce(travelerUser)
      .mockResolvedValueOnce(travelerUser)
      .mockResolvedValueOnce(travelerUser);

    mockTx.user.upsert.mockResolvedValue(travelerUser);

    await expect(requireRole([UserRole.ADMIN])).rejects.toThrow(
      "FORBIDDEN: You do not have permissions to access this route."
    );
  });

  it("isAdmin should return true for ADMIN and false for non-ADMIN", async () => {
    auth.mockResolvedValue({ userId: "admin_user_123" });
    prisma.user.findUnique.mockResolvedValue({
      id: "admin_db_id",
      clerkUserId: "admin_user_123",
      role: UserRole.ADMIN,
    });

    expect(await isAdmin()).toBe(true);

    auth.mockResolvedValue({ userId: "traveler_user_123" });
    prisma.user.findUnique.mockResolvedValue({
      id: "traveler_db_id",
      clerkUserId: "traveler_user_123",
      role: UserRole.TRAVELER,
    });

    expect(await isAdmin()).toBe(false);
  });
});

describe("R7: Admin Controls & 4-Level Verification Upload Gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Level 2 (Server Action): submitVerificationAction throws VERIFICATION_NOT_REQUESTED when status is NOT_SUBMITTED or record is null", async () => {
    auth.mockResolvedValue({ userId: "user_kyc_123" });
    currentUser.mockResolvedValue({
      id: "user_kyc_123",
      emailAddresses: [{ emailAddress: "kyc@example.com" }],
      firstName: "KYC",
      lastName: "User",
    });

    const kycUser = {
      id: "user_db_kyc_123",
      clerkUserId: "user_kyc_123",
      email: "kyc@example.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      travelerProfile: {},
      coupleProfile: null,
      agentProfile: null,
    };

    mockTx.user.findUnique
      .mockResolvedValueOnce(kycUser)
      .mockResolvedValueOnce(kycUser)
      .mockResolvedValueOnce(kycUser);

    mockTx.user.upsert.mockResolvedValue(kycUser);

    // Case 1: No verification record
    prisma.verification.findUnique.mockResolvedValue(null);

    await expect(
      submitVerificationAction({ govtIdUrl: "https://example.com/id.pdf" })
    ).rejects.toThrow("VERIFICATION_NOT_REQUESTED");

    // Case 2: Status is NOT_SUBMITTED
    mockTx.user.findUnique
      .mockResolvedValueOnce(kycUser)
      .mockResolvedValueOnce(kycUser)
      .mockResolvedValueOnce(kycUser);

    prisma.verification.findUnique.mockResolvedValue({
      id: "v_123",
      userId: "user_db_kyc_123",
      status: VerificationStatus.NOT_SUBMITTED,
    });

    await expect(
      submitVerificationAction({ govtIdUrl: "https://example.com/id.pdf" })
    ).rejects.toThrow("VERIFICATION_NOT_REQUESTED");
  });

  it("Level 3 (UploadThing Storage): verificationDocument middleware throws UNAUTHORIZED_NO_VERIFICATION_REQUEST when unrequested", async () => {
    auth.mockResolvedValue({ userId: "user_storage_123" });
    prisma.verification.findUnique.mockResolvedValue(null);

    // UploadThing file router route getter
    const route = (ourFileRouter as any).verificationDocument;
    const middlewareFn = route?._def?.middleware || route?.middleware;

    expect(typeof middlewareFn).toBe("function");
    await expect(middlewareFn()).rejects.toThrow("UNAUTHORIZED_NO_VERIFICATION_REQUEST");
  });

  it("Level 3 (UploadThing Storage): verificationDocument middleware throws UNAUTHORIZED_VERIFICATION_LOCKED when APPROVED", async () => {
    auth.mockResolvedValue({ userId: "user_storage_123" });
    prisma.verification.findUnique.mockResolvedValue({
      id: "v_approved_123",
      userId: "user_storage_123",
      status: "APPROVED",
    });

    const route = (ourFileRouter as any).verificationDocument;
    const middlewareFn = route?._def?.middleware || route?.middleware;

    expect(typeof middlewareFn).toBe("function");
    await expect(middlewareFn()).rejects.toThrow("UNAUTHORIZED_VERIFICATION_LOCKED");
  });

  it("Level 4 (DB Layer): Prisma update fails if no Verification record exists for userId", async () => {
    auth.mockResolvedValue({ userId: "user_db_gate_123" });
    currentUser.mockResolvedValue({
      id: "user_db_gate_123",
      emailAddresses: [{ emailAddress: "dbgate@example.com" }],
      firstName: "DB",
      lastName: "Gate",
    });

    const dbGateUser = {
      id: "user_db_gate_id",
      clerkUserId: "user_db_gate_123",
      email: "dbgate@example.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      travelerProfile: {},
      coupleProfile: null,
      agentProfile: null,
    };

    mockTx.user.findUnique
      .mockResolvedValueOnce(dbGateUser)
      .mockResolvedValueOnce(dbGateUser)
      .mockResolvedValueOnce(dbGateUser);

    mockTx.user.upsert.mockResolvedValue(dbGateUser);

    prisma.verification.findUnique.mockResolvedValue({
      id: "v_pending_123",
      userId: "user_db_gate_id",
      status: VerificationStatus.PENDING,
    });

    prisma.verification.update.mockRejectedValue(
      new Error("Record to update not found (P2025)")
    );

    await expect(
      submitVerificationAction({ govtIdUrl: "https://example.com/id.pdf" })
    ).rejects.toThrow("Record to update not found");
  });
});

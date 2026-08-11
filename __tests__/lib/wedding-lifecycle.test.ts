/**
 * __tests__/lib/wedding-lifecycle.test.ts
 *
 * Comprehensive unit & integration tests for Milestone M3 (Requirement R5):
 * 1. Zod URL transformation & empty string handling in validation schemas (verificationSchema, weddingSchema, optionalUrlSchema).
 * 2. End-to-end Wedding Lifecycle state transitions: DRAFT -> SUBMITTED -> Admin Review -> APPROVED / REJECTED -> PUBLISHED.
 * 3. KYC Verification Gate (SEC-001) preventing unverified hosts from publishing listings.
 * 4. Rejection workflow: Rejection rationale notes persistence, notification/email dispatch, and host re-upload resubmission flow.
 */

import { UserRole, UserStatus, VerificationStatus, WeddingStatus } from "@prisma/client";
import {
  optionalUrlSchema,
  preprocessUrl,
  verificationSchema,
  weddingSchema,
} from "@/lib/validation";

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

// Mock Rate Limit
jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, remaining: 5 }),
}));

// Mock Reputation & Badges
jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/services/badges", () => ({
  evaluateEntityBadges: jest.fn().mockResolvedValue(undefined),
}));

// Mock Auth
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: "notif_123" }),
    },
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

const { prisma } = jest.requireMock("@/lib/prisma");
const { requireAuth } = jest.requireMock("@/lib/auth");
const { sendVerificationApprovedEmail, sendVerificationRejectedEmail, sendVerificationSubmittedEmail } = jest.requireMock("@/lib/email");

// Import server actions under test
import {
  createWedding,
  editWedding,
  submitVerificationAction,
  reviewVerificationAction,
  approveVerificationAction,
  rejectVerificationAction,
} from "@/lib/actions";

describe("Part 1: Zod URL Transformation & Validation Schemas", () => {
  describe("preprocessUrl helper", () => {
    it("should transform empty string '' to null", () => {
      expect(preprocessUrl("")).toBeNull();
    });

    it("should transform whitespace string '   ' to null", () => {
      expect(preprocessUrl("   ")).toBeNull();
    });

    it("should retain valid URL strings unchanged", () => {
      const validUrl = "https://uploadthing.com/f/abc123.pdf";
      expect(preprocessUrl(validUrl)).toBe(validUrl);
    });

    it("should pass null and undefined through unchanged", () => {
      expect(preprocessUrl(null)).toBeNull();
      expect(preprocessUrl(undefined)).toBeUndefined();
    });
  });

  describe("optionalUrlSchema Zod transformation", () => {
    it("should parse empty string '' as null without throwing Zod URL error", () => {
      const result = optionalUrlSchema.safeParse("");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it("should parse null as null", () => {
      const result = optionalUrlSchema.safeParse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it("should parse undefined as undefined", () => {
      const result = optionalUrlSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it("should parse valid URL strings successfully", () => {
      const validUrl = "https://images.unsplash.com/photo-1519741497674-611481863552";
      const result = optionalUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it("should reject invalid non-empty string URLs", () => {
      const result = optionalUrlSchema.safeParse("not-a-valid-url");
      expect(result.success).toBe(false);
    });
  });

  describe("verificationSchema empty string URL handling", () => {
    it("should successfully parse verification payload containing empty strings for document URLs", () => {
      const payload = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        status: "PENDING",
        govtIdUrl: "",
        passportUrl: "",
        selfieUrl: "",
        panUrl: "",
        aadhaarUrl: "",
        bankVerificationUrl: "",
        gstUrl: "",
        businessRegUrl: "",
        linkedinUrl: "",
      };

      const result = verificationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.govtIdUrl).toBeNull();
        expect(result.data.passportUrl).toBeNull();
        expect(result.data.panUrl).toBeNull();
        expect(result.data.aadhaarUrl).toBeNull();
      }
    });

    it("should accept mix of valid URLs and empty string optional fields", () => {
      const payload = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        govtIdUrl: "https://uploadthing.com/f/govt_id.pdf",
        passportUrl: "",
        panUrl: "https://uploadthing.com/f/pan.pdf",
        aadhaarUrl: "",
      };

      const result = verificationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.govtIdUrl).toBe("https://uploadthing.com/f/govt_id.pdf");
        expect(result.data.passportUrl).toBeNull();
        expect(result.data.panUrl).toBe("https://uploadthing.com/f/pan.pdf");
        expect(result.data.aadhaarUrl).toBeNull();
      }
    });
  });

  describe("weddingSchema empty string mainImageUrl handling", () => {
    it("should preprocess empty string mainImageUrl to default valid image URL", () => {
      const payload = {
        hostCoupleId: "123e4567-e89b-12d3-a456-426614174000",
        slug: "royal-rajasthani-wedding",
        title: "Royal Rajasthani Celebration",
        description: "Experience an authentic royal wedding celebration in Udaipur with traditional ceremonies.",
        location: "Udaipur, Rajasthan",
        category: "Royal",
        date: new Date(),
        pricePerGuest: 15000,
        capacity: 100,
        mainImageUrl: "",
      };

      const result = weddingSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mainImageUrl).toMatch(/^https:\/\//);
      }
    });
  });
});

describe("Part 2: Wedding Lifecycle & Rejection Workflow", () => {
  const hostUserId = "123e4567-e89b-12d3-a456-426614174001";
  const hostCoupleProfileId = "123e4567-e89b-12d3-a456-426614174002";
  const adminUserId = "123e4567-e89b-12d3-a456-426614174003";
  const verificationId = "123e4567-e89b-12d3-a456-426614174004";
  const weddingId = "123e4567-e89b-12d3-a456-426614174005";

  const hostUserObj = {
    id: hostUserId,
    email: "host@weddingwithindia.com",
    name: "Host Couple",
    role: UserRole.COUPLE,
    status: UserStatus.ONBOARDING,
  };

  const adminUserObj = {
    id: adminUserId,
    email: "admin@weddingwithindia.com",
    name: "System Admin",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("SEC-001: KYC Verification Gating on Listing Publish", () => {
    it("should silently downgrade status from PUBLISHED to DRAFT if host Verification is not APPROVED", async () => {
      requireAuth.mockResolvedValue(hostUserObj);
      prisma.coupleProfile.upsert.mockResolvedValue({ id: hostCoupleProfileId, userId: hostUserId });
      prisma.verification.findUnique.mockResolvedValue({ status: VerificationStatus.PENDING });
      prisma.wedding.findUnique.mockResolvedValue(null);
      prisma.wedding.create.mockImplementation(({ data }: any) => Promise.resolve({ id: weddingId, ...data }));

      const payload = {
        title: "Grand Royal Wedding Ceremony",
        description: "Join us for an extravagant 3-day royal celebration in Jaipur.",
        location: "Jaipur, Rajasthan",
        category: "Royal",
        date: "2026-11-15",
        pricePerGuest: "12000",
        capacity: "150",
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        status: "PUBLISHED", // Unverified host attempts to publish directly
      };

      const result = await createWedding(payload);

      expect(result.success).toBe(true);
      expect(prisma.wedding.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: WeddingStatus.DRAFT, // Downgraded to DRAFT
        }),
      });
    });

    it("should allow PUBLISHED status when host Verification is APPROVED", async () => {
      requireAuth.mockResolvedValue(hostUserObj);
      prisma.coupleProfile.upsert.mockResolvedValue({ id: hostCoupleProfileId, userId: hostUserId });
      prisma.verification.findUnique.mockResolvedValue({ status: VerificationStatus.APPROVED });
      prisma.wedding.findUnique.mockResolvedValue(null);
      prisma.wedding.create.mockImplementation(({ data }: any) => Promise.resolve({ id: weddingId, ...data }));

      const payload = {
        title: "Grand Royal Wedding Ceremony",
        description: "Join us for an extravagant 3-day royal celebration in Jaipur.",
        location: "Jaipur, Rajasthan",
        category: "Royal",
        date: "2026-11-15",
        pricePerGuest: "12000",
        capacity: "150",
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        status: "PUBLISHED",
      };

      const result = await createWedding(payload);

      expect(result.success).toBe(true);
      expect(prisma.wedding.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: WeddingStatus.PUBLISHED,
        }),
      });
    });

    it("should downgrade status to DRAFT when an unverified host edits a wedding experience and requests PUBLISHED", async () => {
      requireAuth.mockResolvedValue(hostUserObj);
      prisma.coupleProfile.findUnique.mockResolvedValue({ id: hostCoupleProfileId, userId: hostUserId });
      prisma.wedding.findUnique.mockResolvedValue({ id: weddingId, hostCoupleId: hostCoupleProfileId, slug: "test-slug", status: WeddingStatus.DRAFT });
      prisma.verification.findUnique.mockResolvedValue({ status: VerificationStatus.PENDING });
      prisma.wedding.update.mockImplementation(({ data }: any) => Promise.resolve({ id: weddingId, ...data }));

      const payload = {
        title: "Updated Grand Royal Wedding",
        description: "Updated description for an extravagant 3-day royal celebration in Jaipur.",
        location: "Jaipur, Rajasthan",
        category: "Royal",
        date: "2026-11-15",
        pricePerGuest: "12000",
        capacity: "150",
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        status: "PUBLISHED",
      };

      const result = await editWedding(weddingId, payload);
      expect(result.success).toBe(true);
      expect(prisma.wedding.update).toHaveBeenCalledWith({
        where: { id: weddingId },
        data: expect.objectContaining({
          status: WeddingStatus.DRAFT,
        }),
      });
    });
  });

  describe("Verification Submission & Gating", () => {
    it("should throw VERIFICATION_NOT_REQUESTED if user tries to submit before admin requests verification", async () => {
      requireAuth.mockResolvedValue(hostUserObj);
      prisma.verification.findUnique.mockResolvedValue(null);

      await expect(
        submitVerificationAction({ panUrl: "https://uploadthing.com/f/pan.pdf" })
      ).rejects.toThrow("VERIFICATION_NOT_REQUESTED");
    });

    it("should update status to PENDING and sanitize empty string URLs on host submission", async () => {
      requireAuth.mockResolvedValue(hostUserObj);
      prisma.verification.findUnique.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.PENDING, // Previously requested by Admin
      });
      prisma.verification.update.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.PENDING,
        panUrl: "https://uploadthing.com/f/pan.pdf",
        govtIdUrl: null,
      });

      const result = await submitVerificationAction({
        panUrl: "https://uploadthing.com/f/pan.pdf",
        govtIdUrl: "", // empty string from form control
      });

      expect(result.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { userId: hostUserId },
        data: expect.objectContaining({
          status: VerificationStatus.PENDING,
          panUrl: "https://uploadthing.com/f/pan.pdf",
          govtIdUrl: null, // Sanitized
        }),
      });
      expect(sendVerificationSubmittedEmail).toHaveBeenCalled();
    });
  });

  describe("Admin Review & Rejection Workflow", () => {
    it("should record rejection notes in Verification.notes and send rejection email when rejected", async () => {
      requireAuth.mockResolvedValue(adminUserObj);
      const rejectionReason = "Pan card image is blurred and unreadable. Please provide a clear scan.";
      
      prisma.verification.findUnique.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        user: hostUserObj,
      });
      prisma.verification.update.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.REJECTED,
        notes: rejectionReason,
        user: hostUserObj,
      });
      prisma.user.findUnique.mockResolvedValue(hostUserObj);

      const result = await rejectVerificationAction(verificationId, rejectionReason);

      expect(result.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: verificationId },
        data: expect.objectContaining({
          status: VerificationStatus.REJECTED,
          notes: rejectionReason,
        }),
      });

      // User status downgraded to ONBOARDING
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: hostUserId },
        data: { status: "ONBOARDING" },
      });

      // Notification created
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: hostUserId,
          title: "Verification Request Declined",
          type: "ALERT",
        }),
      });

      // Email dispatched with notes
      expect(sendVerificationRejectedEmail).toHaveBeenCalledWith(
        hostUserObj.email,
        "Host Couple",
        rejectionReason
      );
    });

    it("should update status to APPROVED and activate user when approved by admin", async () => {
      requireAuth.mockResolvedValue(adminUserObj);

      prisma.verification.findUnique.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        user: hostUserObj,
      });
      prisma.verification.update.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.APPROVED,
        user: hostUserObj,
      });
      prisma.user.findUnique.mockResolvedValue(hostUserObj);

      const result = await approveVerificationAction(verificationId, "Verified successfully");

      expect(result.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: verificationId },
        data: expect.objectContaining({
          status: VerificationStatus.APPROVED,
        }),
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: hostUserId },
        data: { status: "ACTIVE" },
      });

      expect(sendVerificationApprovedEmail).toHaveBeenCalledWith(
        hostUserObj.email,
        "Host Couple",
        UserRole.COUPLE
      );
    });

    it("should update status to UNDER_REVIEW when reviewed as UNDER_REVIEW by admin using reviewVerificationAction", async () => {
      requireAuth.mockResolvedValue(adminUserObj);
      prisma.verification.findUnique.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        user: hostUserObj,
      });
      prisma.verification.update.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.UNDER_REVIEW,
        user: hostUserObj,
      });
      prisma.user.findUnique.mockResolvedValue(hostUserObj);

      const result = await reviewVerificationAction(verificationId, "UNDER_REVIEW", "Auditing credentials");

      expect(result.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: verificationId },
        data: expect.objectContaining({
          status: VerificationStatus.UNDER_REVIEW,
        }),
      });
    });
  });

  describe("Host Re-upload Resubmission Flow", () => {
    it("should transition status from REJECTED back to PENDING when host submits new documents", async () => {
      requireAuth.mockResolvedValue(hostUserObj);

      // Existing state is REJECTED with previous notes
      prisma.verification.findUnique.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.REJECTED,
        notes: "Pan card image was blurred",
      });

      prisma.verification.update.mockResolvedValue({
        id: verificationId,
        userId: hostUserId,
        status: VerificationStatus.PENDING,
        panUrl: "https://uploadthing.com/f/new_pan_clear.pdf",
      });

      const result = await submitVerificationAction({
        panUrl: "https://uploadthing.com/f/new_pan_clear.pdf",
        govtIdUrl: "",
      });

      expect(result.success).toBe(true);
      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { userId: hostUserId },
        data: expect.objectContaining({
          status: VerificationStatus.PENDING,
          panUrl: "https://uploadthing.com/f/new_pan_clear.pdf",
        }),
      });
    });
  });
});

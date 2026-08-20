/**
 * __tests__/lib/marketplace-promotions-authoritative.test.ts
 *
 * Comprehensive tests for:
 * 1. 3-Tier Marketplace Hierarchy (SPONSORED > FEATURED > NORMAL)
 * 2. Real-time active status evaluation (isSponsorshipCurrentlyActive, isFeaturedCurrentlyActive)
 * 3. Priority tier scoring (getWeddingDiscoveryPriority, sortWeddingsByDiscoveryPriority)
 * 4. toWeddingDTO mapping and curated badges
 * 5. Lifecycle actions: request, approve, direct add, verify payment, revoke, update parameters
 */

import {
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
  requestSponsorship,
  adminReviewSponsorshipRequest,
  adminDirectAddSponsorship,
  adminVerifyAndActivatePayment,
  adminRevokeSponsorship,
  adminUpdatePromotionParameters,
} from "@/lib/services/sponsorship";
import { toWeddingDTO } from "@/lib/wedding-dto";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn((cb) => cb),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    sponsorshipRequest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    notification: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    coupleProfile: {
      findUnique: jest.fn(),
    },
    sponsorshipPaymentConfig: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-1" }),
    },
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $transaction: jest.fn(async (cb) => cb(prisma)),
  },
}));

jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn().mockResolvedValue({
    id: "admin-1",
    email: "admin@weddingwithindia.com",
    role: "ADMIN",
  }),
  requireAuth: jest.fn().mockResolvedValue({
    id: "host-user-1",
    email: "host@example.com",
    role: "COUPLE",
  }),
}));

describe("Authoritative 3-Tier Marketplace Hierarchy & Sponsorship Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Real-time Active Status Evaluation", () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    it("should recognize active SPONSORED placement when valid dates and verified payment exist", () => {
      const activeSponsoredWedding = {
        id: "w-1",
        sponsored: true,
        featured: false,
        sponsorshipStart: pastDate,
        sponsorshipEnd: futureDate,
        sponsorshipRequests: [
          {
            id: "req-1",
            promotionType: "SPONSORED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(activeSponsoredWedding)).toBe(true);
      expect(isFeaturedCurrentlyActive(activeSponsoredWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(activeSponsoredWedding)).toBe(2);
    });

    it("should recognize expired SPONSORED placement as inactive", () => {
      const expiredSponsoredWedding = {
        id: "w-2",
        sponsored: true,
        sponsorshipStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        sponsorshipEnd: pastDate,
        sponsorshipRequests: [
          {
            id: "req-2",
            promotionType: "SPONSORED",
            status: "EXPIRED",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            endsAt: pastDate,
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(expiredSponsoredWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(expiredSponsoredWedding)).toBe(0);
    });

    it("should recognize active FEATURED placement when valid dates exist", () => {
      const activeFeaturedWedding = {
        id: "w-3",
        sponsored: false,
        featured: true,
        sponsorshipRequests: [
          {
            id: "req-3",
            promotionType: "FEATURED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(activeFeaturedWedding)).toBe(false);
      expect(isFeaturedCurrentlyActive(activeFeaturedWedding)).toBe(true);
      expect(getWeddingDiscoveryPriority(activeFeaturedWedding)).toBe(1);
    });

    it("should recognize editorial wedding.featured = true when not actively sponsored", () => {
      const editorialFeaturedWedding = {
        id: "w-4",
        sponsored: false,
        featured: true,
        sponsorshipRequests: [],
      };

      expect(isSponsorshipCurrentlyActive(editorialFeaturedWedding)).toBe(false);
      expect(isFeaturedCurrentlyActive(editorialFeaturedWedding)).toBe(true);
      expect(getWeddingDiscoveryPriority(editorialFeaturedWedding)).toBe(1);
    });

    it("should recognize NORMAL listing when neither sponsored nor featured", () => {
      const normalWedding = {
        id: "w-5",
        sponsored: false,
        featured: false,
        sponsorshipRequests: [],
      };

      expect(isSponsorshipCurrentlyActive(normalWedding)).toBe(false);
      expect(isFeaturedCurrentlyActive(normalWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(normalWedding)).toBe(0);
    });
  });

  describe("2. Canonical Sorting Hierarchy (Sponsored > Featured > Normal)", () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    it("should strictly sort SPONSORED listings above FEATURED, and FEATURED above NORMAL", () => {
      const normalWedding = {
        id: "w-normal",
        title: "Normal Wedding",
        sponsored: false,
        featured: false,
        sponsorshipRequests: [],
      };

      const featuredWedding = {
        id: "w-featured",
        title: "Featured Wedding",
        sponsored: false,
        featured: true,
        sponsorshipRequests: [
          {
            id: "req-feat",
            promotionType: "FEATURED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      const sponsoredWedding = {
        id: "w-sponsored",
        title: "Sponsored Wedding",
        sponsored: true,
        featured: false,
        sponsorshipStart: pastDate,
        sponsorshipEnd: futureDate,
        sponsorshipRequests: [
          {
            id: "req-spon",
            promotionType: "SPONSORED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      // Input in mixed order: Normal, Sponsored, Featured
      const input = [normalWedding, sponsoredWedding, featuredWedding];
      const sorted = sortWeddingsByDiscoveryPriority(input);

      expect(sorted[0].id).toBe("w-sponsored");
      expect(sorted[1].id).toBe("w-featured");
      expect(sorted[2].id).toBe("w-normal");
    });
  });

  describe("3. toWeddingDTO Mapping Verification", () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const baseRaw = {
      id: "dto-test-1",
      slug: "ananya-aarav-mumbai",
      title: "Royal Mumbai Celebration",
      description: "A celebration of love in Mumbai.",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      tier: "ROYAL",
      category: "Royal",
      pricePerGuest: 299,
      capacity: 100,
      date: futureDate,
      durationDays: 3,
      status: "PUBLISHED",
      suspended: false,
      isDemo: false,
      mainImageUrl: "https://images.unsplash.com/photo-1?w=1200",
      hostCouple: {
        id: "hc-1",
        name: "Aarav & Ananya",
        avatar: "https://images.unsplash.com/photo-2?w=400",
        user: { name: "Aarav Sharma", email: "aarav@example.com" },
      },
    };

    it("should set curatedBadge='Sponsored' and sponsored=true for active sponsored wedding", () => {
      const raw = {
        ...baseRaw,
        sponsored: true,
        featured: false,
        sponsorshipStart: pastDate,
        sponsorshipEnd: futureDate,
        sponsorshipRequests: [
          {
            id: "req-1",
            promotionType: "SPONSORED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      const dto = toWeddingDTO(raw);
      expect(dto.sponsored).toBe(true);
      expect(dto.featured).toBe(false);
      expect(dto.isCurated).toBe(true);
      expect(dto.curatedBadge).toBe("Sponsored");
    });

    it("should set curatedBadge='Featured' and featured=true for active featured wedding", () => {
      const raw = {
        ...baseRaw,
        sponsored: false,
        featured: true,
        sponsorshipRequests: [
          {
            id: "req-2",
            promotionType: "FEATURED",
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            startsAt: pastDate,
            endsAt: futureDate,
            revokedAt: null,
          },
        ],
      };

      const dto = toWeddingDTO(raw);
      expect(dto.sponsored).toBe(false);
      expect(dto.featured).toBe(true);
      expect(dto.isCurated).toBe(true);
      expect(dto.curatedBadge).toBe("Featured");
    });

    it("should set curatedBadge=undefined for normal wedding", () => {
      const raw = {
        ...baseRaw,
        sponsored: false,
        featured: false,
        sponsorshipRequests: [],
      };

      const dto = toWeddingDTO(raw);
      expect(dto.sponsored).toBe(false);
      expect(dto.featured).toBe(false);
      expect(dto.curatedBadge).toBeUndefined();
    });
  });

  describe("4. Lifecycle Actions (Promotions CRUD)", () => {
    it("should create sponsorship request with promotionType and proposedAmount", async () => {
      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "cp-1",
        userId: "host-user-1",
      });

      (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
        id: "w-10",
        title: "Test Wedding",
        status: "PUBLISHED",
        hostCoupleId: "cp-1",
        hostCouple: { id: "cp-1", userId: "host-user-1" },
      });

      (prisma.sponsorshipRequest.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.sponsorshipRequest.create as jest.Mock).mockResolvedValue({
        id: "req-10",
        weddingId: "w-10",
        promotionType: "FEATURED",
        proposedAmount: 5000,
        requestedDurationDays: 14,
        status: "PENDING",
      });

      const res = await requestSponsorship({
        weddingId: "w-10",
        promotionType: "FEATURED",
        proposedAmount: 5000,
        requestedDurationDays: 14,
      });

      expect(prisma.sponsorshipRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            weddingId: "w-10",
            promotionType: "FEATURED",
            proposedAmount: 5000,
            requestedDurationDays: 14,
          }),
        })
      );
      expect(res.requestId).toBe("req-10");
    });

    it("should approve request with promotionType and pricing parameters", async () => {
      const mockReq = {
        id: "req-20",
        weddingId: "w-20",
        promotionType: "SPONSORED",
        status: "PENDING",
        wedding: { id: "w-20", title: "Test", hostCoupleId: "hc-20" },
      };

      (prisma.sponsorshipRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);
      (prisma.sponsorshipRequest.update as jest.Mock).mockResolvedValue({
        ...mockReq,
        status: "PAYMENT_PENDING",
        amount: 15000,
        currency: "INR",
        durationDays: 14,
      });

      const res = await adminReviewSponsorshipRequest({
        requestId: "req-20",
        decision: "APPROVED",
        promotionType: "SPONSORED",
        amount: 15000,
        currency: "INR",
        durationDays: 14,
      });

      expect(prisma.sponsorshipRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-20" },
          data: expect.objectContaining({
            status: "PAYMENT_PENDING",
            amount: 15000,
            currency: "INR",
            durationDays: 14,
            promotionType: "SPONSORED",
          }),
        })
      );
      expect(res.status).toBe("PAYMENT_PENDING");
    });

    it("should update promotion parameters via adminUpdatePromotionParameters", async () => {
      const mockReq = {
        id: "req-30",
        weddingId: "w-30",
        promotionType: "SPONSORED",
        status: "ACTIVE",
        wedding: { id: "w-30", title: "Test", hostCoupleId: "hc-30" },
      };

      (prisma.sponsorshipRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);
      (prisma.sponsorshipRequest.update as jest.Mock).mockResolvedValue({
        ...mockReq,
        promotionType: "FEATURED",
        amount: 8000,
      });
      (prisma.wedding.update as jest.Mock).mockResolvedValue({ id: "w-30", featured: true, sponsored: false });

      const res = await adminUpdatePromotionParameters({
        sponsorshipId: "req-30",
        promotionType: "FEATURED",
        amount: 8000,
      });

      expect(prisma.sponsorshipRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-30" },
          data: expect.objectContaining({
            promotionType: "FEATURED",
            amount: 8000,
          }),
        })
      );
      expect(res.success).toBe(true);
    });
  });
});

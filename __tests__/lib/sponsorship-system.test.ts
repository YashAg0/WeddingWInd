import {
  isSponsorshipCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
  toMinorCurrencyUnits,
  sanitizePaymentUrl,
  requestSponsorship,
  submitHostPaymentProof,
  adminDirectAddSponsorship,
  adminVerifyAndActivatePayment,
  adminUpdateChecklist,
  getSponsorshipPaymentConfig,
  adminUpdatePaymentConfig,
  buildDefaultChecklist,
} from "@/lib/services/sponsorship";
import { prisma } from "@/lib/prisma";
import { UserRole, WeddingStatus, SponsorshipRequestStatus } from "@prisma/client";

// Mock auth module
let mockCurrentUser: any = null;

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(async () => {
    if (!mockCurrentUser) throw new Error("Unauthorized");
    return mockCurrentUser;
  }),
  requireRole: jest.fn(async (roles: string[]) => {
    if (!mockCurrentUser || !roles.includes(mockCurrentUser.role)) {
      throw new Error("Forbidden: Insufficient privileges");
    }
    return mockCurrentUser;
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/prisma", () => {
  const prismaMock: any = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    sponsorshipRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    sponsorshipPaymentConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    stripeWebhookEvent: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $transaction: jest.fn(async (fn: any) => fn(prismaMock)),
  };
  return { prisma: prismaMock };
});

const mockPrisma = prisma as any;

describe("WeddingWithIndia — Final God-Level Sponsored Placement, External Payments & Admin CRM Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.sponsorshipRequest.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
  });

  describe("1. Exact Money, Minor Currency Units & URL Sanitization", () => {
    it("converts major to minor currency units exactly without float errors", () => {
      expect(toMinorCurrencyUnits(299.0)).toBe(29900);
      expect(toMinorCurrencyUnits(299.99)).toBe(29999);
      expect(toMinorCurrencyUnits(0)).toBe(0);
      expect(toMinorCurrencyUnits(149.5)).toBe(14950);
      expect(toMinorCurrencyUnits(25000)).toBe(2500000);
    });

    it("sanitizes payment URLs to prevent javascript: or data: injection", () => {
      expect(sanitizePaymentUrl("https://paypal.me/weddingwithindia")).toBe("https://paypal.me/weddingwithindia");
      expect(sanitizePaymentUrl("upi://pay?pa=namaste@upi")).toBe("upi://pay?pa=namaste@upi");
      expect(sanitizePaymentUrl("javascript:alert(1)")).toBeNull();
      expect(sanitizePaymentUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
      expect(sanitizePaymentUrl("")).toBeNull();
      expect(sanitizePaymentUrl(null)).toBeNull();
    });
  });

  describe("2. Discovery Priority & Cache Invariance (wedding.sponsored as Cache Field)", () => {
    it("case 15: Stale wedding.sponsored=true with EXPIRED sponsorship requests MUST NOT rank sponsored", () => {
      const now = new Date();
      const staleExpiredWedding = {
        id: "w_stale_1",
        sponsored: true,
        featured: false,
        sponsorshipRequests: [
          {
            id: "sr_exp_1",
            status: SponsorshipRequestStatus.EXPIRED,
            startsAt: new Date(now.getTime() - 86400000 * 10),
            endsAt: new Date(now.getTime() - 86400000 * 2),
            paymentRequired: true,
            paymentStatus: "PAYMENT_VERIFIED",
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(staleExpiredWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(staleExpiredWedding)).toBe(0);
    });

    it("case 13: Stale wedding.sponsored=true with REVOKED sponsorship request MUST NOT rank sponsored", () => {
      const now = new Date();
      const staleRevokedWedding = {
        id: "w_stale_2",
        sponsored: true,
        featured: true,
        sponsorshipRequests: [
          {
            id: "sr_rev_1",
            status: SponsorshipRequestStatus.REVOKED,
            startsAt: new Date(now.getTime() - 86400000),
            endsAt: new Date(now.getTime() + 86400000 * 5),
            paymentRequired: true,
            paymentStatus: "PAYMENT_VERIFIED",
            revokedAt: new Date(),
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(staleRevokedWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(staleRevokedWedding)).toBe(1);
    });

    it("case 14: Stale wedding.sponsored=true with PAYMENT_PENDING or PAYMENT_SUBMITTED MUST NOT rank sponsored", () => {
      const now = new Date();
      const unpaidWedding = {
        id: "w_stale_3",
        sponsored: true,
        featured: false,
        sponsorshipRequests: [
          {
            id: "sr_unpaid_1",
            status: SponsorshipRequestStatus.PAYMENT_PENDING,
            startsAt: new Date(now.getTime() - 1000),
            endsAt: new Date(now.getTime() + 86400000 * 7),
            paymentRequired: true,
            paymentStatus: "PAYMENT_SUBMITTED",
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(unpaidWedding)).toBe(false);
      expect(getWeddingDiscoveryPriority(unpaidWedding)).toBe(0);
    });

    it("case 16: Stale wedding.sponsored=false with ACTIVE valid sponsorship request MUST rank as ACTIVE SPONSORED (Tier 2)", () => {
      const now = new Date();
      const activeAuthoritativeWedding = {
        id: "w_auth_1",
        sponsored: false,
        featured: false,
        sponsorshipRequests: [
          {
            id: "sr_active_valid",
            status: SponsorshipRequestStatus.ACTIVE,
            startsAt: new Date(now.getTime() - 86400000),
            endsAt: new Date(now.getTime() + 86400000 * 6),
            paymentRequired: true,
            paymentStatus: "PAYMENT_VERIFIED",
            revokedAt: null,
          },
        ],
      };

      expect(isSponsorshipCurrentlyActive(activeAuthoritativeWedding)).toBe(true);
      expect(getWeddingDiscoveryPriority(activeAuthoritativeWedding)).toBe(2);
    });

    it("discovery sort orders Tier 2 (Sponsored) > Tier 1 (Featured) > Tier 0 (Normal)", () => {
      const now = new Date();
      const weddings = [
        { id: "w_normal", sponsored: false, featured: false, pricePerGuest: 100 },
        { id: "w_featured", sponsored: false, featured: true, pricePerGuest: 150 },
        {
          id: "w_sponsored",
          sponsored: true,
          sponsorshipRequests: [
            {
              status: SponsorshipRequestStatus.ACTIVE,
              paymentRequired: true,
              paymentStatus: "PAYMENT_VERIFIED",
              startsAt: new Date(now.getTime() - 86400000),
              endsAt: new Date(now.getTime() + 86400000 * 5),
            },
          ],
          pricePerGuest: 500,
        },
      ];

      const sorted = sortWeddingsByDiscoveryPriority(weddings, "price_asc");
      expect(sorted[0].id).toBe("w_sponsored");
      expect(sorted[1].id).toBe("w_featured");
      expect(sorted[2].id).toBe("w_normal");
    });
  });

  describe("3. Host Request & External Payment Workflow (Path A)", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "host_user_1",
        email: "host1@example.com",
        role: UserRole.COUPLE,
      };
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_profile_1", userId: "host_user_1" });
    });

    it("allows host to request sponsorship on an owned published wedding", async () => {
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "wedding_1",
        title: "Royal Jaipur Celebration",
        hostCoupleId: "couple_profile_1",
        status: WeddingStatus.PUBLISHED,
        sponsored: false,
      });

      mockPrisma.sponsorshipRequest.create.mockResolvedValue({
        id: "sreq_1",
        weddingId: "wedding_1",
        coupleId: "couple_profile_1",
        status: SponsorshipRequestStatus.PENDING,
      });

      const res = await requestSponsorship({
        weddingId: "wedding_1",
        message: "We want to sponsor our wedding",
        requestedDurationDays: 14,
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.sponsorshipRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            weddingId: "wedding_1",
            coupleId: "couple_profile_1",
            source: "HOST_REQUEST",
            status: SponsorshipRequestStatus.PENDING,
            requestedDurationDays: 14,
          }),
        })
      );
    });

    it("rejects host sponsorship request if caller does not own the wedding (IDOR Prevention)", async () => {
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "wedding_other",
        title: "Other Couple Wedding",
        hostCoupleId: "other_couple_profile",
        status: WeddingStatus.PUBLISHED,
      });

      await expect(requestSponsorship({ weddingId: "wedding_other" })).rejects.toThrow(
        "Forbidden: You do not own this wedding."
      );
    });

    it("host submits UTR reference and transitions paymentStatus to PAYMENT_SUBMITTED without activating", async () => {
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sreq_approved",
        weddingId: "wedding_1",
        status: SponsorshipRequestStatus.PAYMENT_PENDING,
        paymentStatus: "PAYMENT_REQUESTED",
        amount: 15000,
        currency: "INR",
        wedding: {
          id: "wedding_1",
          title: "Royal Jaipur Celebration",
          hostCoupleId: "couple_profile_1",
        },
      });

      mockPrisma.sponsorshipRequest.update.mockResolvedValue({
        id: "sreq_approved",
        paymentStatus: "PAYMENT_SUBMITTED",
      });

      const res = await submitHostPaymentProof({
        sponsorshipId: "sreq_approved",
        transactionReference: "UPI-UTR-423981293812",
        paymentProofUrl: "https://proofs.weddingwithindia.com/rec_1.png",
        paymentNotes: "Paid via GPay to namaste@okhdfcbank",
      });

      expect(res.success).toBe(true);
      expect(res.paymentStatus).toBe("PAYMENT_SUBMITTED");

      // Verify sponsorship was NOT activated directly
      expect(mockPrisma.sponsorshipRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentStatus: "PAYMENT_SUBMITTED",
            paymentReference: "UPI-UTR-423981293812",
          }),
        })
      );
      expect(mockPrisma.wedding.update).not.toHaveBeenCalled();
    });
  });

  describe("4. Admin Manual Verification & Activation", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "admin_user_1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      };
    });

    it("admin verifies host UTR payment and activates placement with PostgreSQL advisory lock", async () => {
      const now = new Date();
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sreq_submitted",
        weddingId: "wedding_1",
        status: SponsorshipRequestStatus.PAYMENT_PENDING,
        paymentStatus: "PAYMENT_SUBMITTED",
        amount: 15000,
        currency: "INR",
        durationDays: 14,
        paymentReference: "UPI-UTR-423981293812",
        paymentMethod: "UPI",
        wedding: {
          id: "wedding_1",
          title: "Royal Jaipur Celebration",
          hostCoupleId: "couple_1",
        },
      });

      mockPrisma.sponsorshipRequest.update.mockResolvedValue({
        id: "sreq_submitted",
        status: SponsorshipRequestStatus.ACTIVE,
        paymentStatus: "PAYMENT_VERIFIED",
      });

      const res = await adminVerifyAndActivatePayment({
        sponsorshipId: "sreq_submitted",
        transactionReference: "UPI-UTR-423981293812",
        paymentMethod: "UPI",
        verifiedAmount: 15000,
        currency: "INR",
        notes: "Bank ledger confirmed receipt",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(mockPrisma.sponsorshipRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "sreq_submitted" },
          data: expect.objectContaining({
            status: SponsorshipRequestStatus.ACTIVE,
            paymentStatus: "PAYMENT_VERIFIED",
            paymentVerifiedBy: "admin@weddingwithindia.com",
          }),
        })
      );
      expect(mockPrisma.wedding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "wedding_1" },
          data: expect.objectContaining({
            sponsored: true,
          }),
        })
      );
    });

    it("admin rejects activation if an active overlapping sponsorship exists for the wedding", async () => {
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sreq_second",
        weddingId: "wedding_1",
        status: SponsorshipRequestStatus.PAYMENT_PENDING,
        durationDays: 7,
        wedding: { id: "wedding_1" },
      });

      // Mock conflicting existing active sponsorship
      mockPrisma.sponsorshipRequest.findFirst.mockResolvedValue({
        id: "sreq_already_active",
        status: SponsorshipRequestStatus.ACTIVE,
        endsAt: new Date(Date.now() + 86400000 * 5),
      });

      await expect(
        adminVerifyAndActivatePayment({
          sponsorshipId: "sreq_second",
          transactionReference: "UTR-12345",
        })
      ).rejects.toThrow("CONFLICT_OVERLAPPING_SPONSORSHIP");
    });
  });

  describe("5. Admin Direct Outreach & CRM Placements (Path B)", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "admin_user_1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      };
    });

    it("admin directly creates and activates an outreach placement from WhatsApp", async () => {
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "wedding_outreach_1",
        title: "Udaipur Lake Palace Wedding",
        hostCoupleId: "couple_lake",
        status: WeddingStatus.PUBLISHED,
      });

      mockPrisma.sponsorshipRequest.create.mockResolvedValue({
        id: "sreq_direct_1",
        weddingId: "wedding_outreach_1",
        source: "ADMIN_OUTREACH",
        contactMethod: "WHATSAPP",
        status: SponsorshipRequestStatus.ACTIVE,
        paymentStatus: "PAYMENT_VERIFIED",
      });

      const res = await adminDirectAddSponsorship({
        weddingId: "wedding_outreach_1",
        source: "ADMIN_OUTREACH",
        contactMethod: "WHATSAPP",
        contactNotes: "Negotiated ₹25,000 for 30-day wedding season priority",
        amount: 25000,
        currency: "INR",
        durationDays: 30,
        paymentMethod: "UPI",
        paymentStatus: "PAYMENT_VERIFIED",
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe(SponsorshipRequestStatus.ACTIVE);
      expect(mockPrisma.wedding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "wedding_outreach_1" },
          data: expect.objectContaining({
            sponsored: true,
          }),
        })
      );
    });
  });

  describe("6. Server-Backed 10-Step Progress Checklist", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "admin_user_1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      };
    });

    it("builds a default 10-step checklist with completed keys", () => {
      const checklist = buildDefaultChecklist(["HOST_CONTACTED", "PRICE_AGREED"], "admin@weddingwithindia.com");
      expect(checklist).toHaveLength(10);
      const hostContacted = checklist.find((i) => i.key === "HOST_CONTACTED");
      expect(hostContacted?.completed).toBe(true);
      expect(hostContacted?.completedBy).toBe("admin@weddingwithindia.com");
      const paymentVerified = checklist.find((i) => i.key === "PAYMENT_VERIFIED");
      expect(paymentVerified?.completed).toBe(false);
    });

    it("admin updates individual checklist item progress with persistent timestamp", async () => {
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sreq_check_1",
        weddingId: "w_1",
        checklist: buildDefaultChecklist([], "admin@weddingwithindia.com"),
      });

      mockPrisma.sponsorshipRequest.update.mockResolvedValue({
        id: "sreq_check_1",
      });

      const res = await adminUpdateChecklist("sreq_check_1", "TERMS_COMMUNICATED", true);
      expect(res.success).toBe(true);
      const item = res.checklist.find((i) => i.key === "TERMS_COMMUNICATED");
      expect(item?.completed).toBe(true);
      expect(item?.completedBy).toBe("admin@weddingwithindia.com");
      expect(item?.completedAt).toBeDefined();
    });
  });

  describe("7. Payment Configuration Management", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "admin_user_1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      };
    });

    it("retrieves payment config with unconfigured default state when not configured in DB", async () => {
      mockPrisma.sponsorshipPaymentConfig.findUnique.mockResolvedValue(null);
      const config = await getSponsorshipPaymentConfig();
      expect(config.upiId).toBeNull();
      expect(config.paypalPaymentLink).toBeNull();
      expect(config.upiName).toBe("WeddingWithIndia");
    });

    it("admin updates payment config with URL sanitization", async () => {
      mockPrisma.sponsorshipPaymentConfig.upsert.mockResolvedValue({
        id: "default",
        upiId: "custom@icici",
        paypalPaymentLink: "https://paypal.me/custom",
      });

      const res = await adminUpdatePaymentConfig({
        upiId: "custom@icici",
        paypalPaymentLink: "https://paypal.me/custom",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.sponsorshipPaymentConfig.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            upiId: "custom@icici",
            paypalPaymentLink: "https://paypal.me/custom",
          }),
        })
      );
    });
  });
});

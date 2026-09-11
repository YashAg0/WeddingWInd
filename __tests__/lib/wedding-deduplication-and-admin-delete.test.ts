import { deduplicateWeddings } from "@/lib/wedding-dto";
import { featuredWeddings } from "@/lib/data";
import { UserRole, WeddingStatus } from "@prisma/client";

// Mock dependencies
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  getDbUser: jest.fn(),
  isAdmin: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    coupleProfile: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    wedding: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    sponsorshipRequest: {
      deleteMany: jest.fn(),
    },
    recentlyViewed: {
      deleteMany: jest.fn(),
    },
    wishlist: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb({
      sponsorshipRequest: { deleteMany: jest.fn() },
      recentlyViewed: { deleteMany: jest.fn() },
      wishlist: { deleteMany: jest.fn() },
      eventContact: { deleteMany: jest.fn() },
      weddingAnnouncement: { deleteMany: jest.fn() },
      weddingItineraryItem: { deleteMany: jest.fn() },
      weddingQualityBadge: { deleteMany: jest.fn() },
      coordinatorProfile: { updateMany: jest.fn() },
      hostApplication: { updateMany: jest.fn() },
      weddingEvent: { deleteMany: jest.fn() },
      weddingTradition: { deleteMany: jest.fn() },
      weddingGallery: { deleteMany: jest.fn() },
      wedding: { delete: jest.fn() },
    })),
  },
  withDbRetry: jest.fn((fn: any) => fn()),
}));

describe("Wedding Deduplication & Admin Deletion Suite", () => {
  describe("1. In-Memory Canonical Deduplication (deduplicateWeddings)", () => {
    it("preserves all 21 demo weddings without dropping any unique showcase celebrations", () => {
      const deduped = deduplicateWeddings(featuredWeddings);
      expect(deduped.length).toBe(featuredWeddings.length);
      expect(deduped.length).toBe(21);
    });

    it("filters out duplicate non-demo listings created by accidental double-submission for the same host", () => {
      const testListings = [
        {
          id: "w-demo-1",
          slug: "grand-maharaja-wedding",
          title: "Rajasthan Royal Heritage Celebration",
          isDemo: true,
          hostCoupleId: "cp-demo-1",
        },
        {
          id: "w-user-1",
          slug: "rahul-and-ananya-delhi",
          title: "Rahul & Ananya Wedding",
          isDemo: false,
          hostCoupleId: "cp-user-123",
          date: "2026-11-15T00:00:00.000Z",
        },
        // Duplicate listing created by second submission of the same celebration
        {
          id: "w-user-2",
          slug: "rahul-and-ananya-delhi-742",
          title: "Rahul & Ananya Wedding",
          isDemo: false,
          hostCoupleId: "cp-user-123",
          date: "2026-11-15T00:00:00.000Z",
        },
        // Duplicate listing created by third submission
        {
          id: "w-user-3",
          slug: "rahul-and-ananya-delhi-891",
          title: "Rahul & Ananya Wedding",
          isDemo: false,
          hostCoupleId: "cp-user-123",
          date: "2026-11-15T00:00:00.000Z",
        },
        // Legitimate distinct wedding hosted by a different couple
        {
          id: "w-user-4",
          slug: "arjun-and-meera-jaipur",
          title: "Arjun & Meera Celebration",
          isDemo: false,
          hostCoupleId: "cp-user-456",
          date: "2026-12-05T00:00:00.000Z",
        },
      ];

      const deduped = deduplicateWeddings(testListings);
      expect(deduped.length).toBe(3);
      expect(deduped.map((w) => w.id)).toEqual(["w-demo-1", "w-user-1", "w-user-4"]);
    });

    it("deduplicates identical IDs even if metadata varies slightly", () => {
      const testListings = [
        { id: "w-1", title: "Wedding A", isDemo: false },
        { id: "w-1", title: "Wedding A (copy)", isDemo: false },
        { id: "w-2", title: "Wedding B", isDemo: false },
      ];
      const deduped = deduplicateWeddings(testListings);
      expect(deduped.length).toBe(2);
      expect(deduped.map((w) => w.id)).toEqual(["w-1", "w-2"]);
    });
  });

  describe("2. createWedding Idempotency & In-Place Update Guard", () => {
    const { requireAuth } = require("@/lib/auth");
    const { prisma } = require("@/lib/prisma");

    const mockCoupleId = "11111111-1111-4111-8111-111111111111";
    const mockWeddingId = "22222222-2222-4222-8222-222222222222";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("updates existing celebration in place when an existing listing for the couple matches", async () => {
      const { createWedding } = await import("@/lib/actions");

      requireAuth.mockResolvedValue({
        id: "33333333-3333-4333-8333-333333333333",
        email: "couple@example.com",
        role: UserRole.COUPLE,
      });

      prisma.coupleProfile.upsert.mockResolvedValue({
        id: mockCoupleId,
        userId: "33333333-3333-4333-8333-333333333333",
      });

      prisma.verification.findUnique.mockResolvedValue({
        status: "APPROVED",
      });

      const existingRecord = {
        id: mockWeddingId,
        slug: "rohit-simran-celebration",
        title: "Rohit & Simran Celebration",
        hostCoupleId: mockCoupleId,
        isDemo: false,
        pricePerGuest: 1000,
        capacity: 50,
        requiredGuests: 0,
        date: new Date("2026-11-20"),
        status: WeddingStatus.PUBLISHED,
      };

      prisma.wedding.findFirst.mockResolvedValue(existingRecord);
      prisma.wedding.update.mockImplementation(({ data }: any) => Promise.resolve({ ...existingRecord, ...data }));

      const result = await createWedding({
        title: "Rohit & Simran Celebration",
        location: "Udaipur, Rajasthan",
        category: "Royal",
        pricePerGuest: "1200",
        capacity: "60",
        description: "Updated story for our royal wedding celebration in Udaipur.",
        mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
        status: "PUBLISHED",
      });

      expect(result.success).toBe(true);
      expect(prisma.wedding.update).toHaveBeenCalled();
      expect(prisma.wedding.create).not.toHaveBeenCalled();
    });

    it("creates a brand new wedding when no existing celebration matches for the couple", async () => {
      const { createWedding } = await import("@/lib/actions");

      requireAuth.mockResolvedValue({
        id: "44444444-4444-4444-8444-444444444444",
        email: "newcouple@example.com",
        role: UserRole.COUPLE,
      });

      prisma.coupleProfile.upsert.mockResolvedValue({
        id: mockCoupleId,
        userId: "44444444-4444-4444-8444-444444444444",
      });

      prisma.verification.findUnique.mockResolvedValue({
        status: "APPROVED",
      });

      prisma.wedding.findFirst.mockResolvedValue(null);
      prisma.wedding.findUnique.mockResolvedValue(null); // for slug check
      prisma.wedding.create.mockImplementation(({ data }: any) => Promise.resolve({ id: mockWeddingId, ...data }));

      const result = await createWedding({
        title: "Karan & Pooja Royal Wedding",
        location: "Jaipur, Rajasthan",
        category: "Royal",
        pricePerGuest: "950",
        capacity: "40",
        description: "Brand new story for our royal wedding celebration in Jaipur.",
        mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
        status: "PUBLISHED",
      });

      expect(result.success).toBe(true);
      expect(prisma.wedding.create).toHaveBeenCalled();
    });
  });

  describe("3. Admin Deletion Security & Foreign-Key Resilience (adminDeleteWeddingAction)", () => {
    const { requireRole } = require("@/lib/auth");
    const { prisma } = require("@/lib/prisma");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("rejects non-admin users attempting to delete a listed wedding", async () => {
      const { adminDeleteWeddingAction } = await import("@/lib/actions/admin");

      requireRole.mockRejectedValue(new Error("FORBIDDEN: You do not have permissions to access this route."));

      await expect(adminDeleteWeddingAction("any-wedding-id")).rejects.toThrow("FORBIDDEN");
    });

    it("soft-deletes wedding when active bookings or safety cases exist to preserve financial integrity", async () => {
      const { adminDeleteWeddingAction } = await import("@/lib/actions/admin");

      requireRole.mockResolvedValue({
        id: "admin-user-1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      });

      prisma.wedding.findUnique.mockResolvedValue({
        id: "wedding-with-bookings",
        title: "Celebration with Paid Guests",
        slug: "celebration-with-paid-guests",
        bookings: [{ id: "booking-1", status: "CONFIRMED" }],
        safetyCases: [],
      });

      prisma.wedding.update.mockResolvedValue({ id: "wedding-with-bookings", status: WeddingStatus.DRAFT });

      const res = await adminDeleteWeddingAction("wedding-with-bookings");

      expect(res.success).toBe(true);
      expect(prisma.wedding.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "wedding-with-bookings" },
          data: expect.objectContaining({
            status: WeddingStatus.DRAFT,
            suspended: true,
            deletedAt: expect.any(Date),
          }),
        })
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("cleans up child relations in transaction and hard deletes when zero bookings exist", async () => {
      const { adminDeleteWeddingAction } = await import("@/lib/actions/admin");

      requireRole.mockResolvedValue({
        id: "admin-user-1",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      });

      prisma.wedding.findUnique.mockResolvedValue({
        id: "wedding-no-bookings",
        title: "Accidental Duplicate Celebration",
        slug: "accidental-duplicate-celebration",
        bookings: [],
        safetyCases: [],
      });

      const res = await adminDeleteWeddingAction("wedding-no-bookings");

      expect(res.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});

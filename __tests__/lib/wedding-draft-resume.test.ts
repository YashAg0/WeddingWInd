import { UserRole, VerificationStatus } from "@prisma/client";
import {
  saveLocalWeddingDraft,
  getLocalWeddingDraft,
  clearLocalWeddingDraft,
  setAutoSubmitIntent,
  hasAutoSubmitIntent,
  HostDraftPayload,
  DRAFT_STORAGE_KEY,
  INTENT_STORAGE_KEY,
} from "@/lib/storage/wedding-draft";

// Mock next/cache revalidatePath
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
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  hostApplication: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  hostApplicationDay: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn().mockResolvedValue({ id: "day-1", dayNumber: 1 }),
  },
  hostApplicationEvent: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn().mockResolvedValue({ id: "event-1" }),
  },
  hostApplicationAuditLog: {
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => {
    if (typeof cb === "function") return cb(mockPrisma);
    return cb;
  }),
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const { requireAuth } = require("@/lib/auth");
const { saveHostApplicationDraftAction, submitHostApplicationAction } = require("@/lib/actions/host-application");

describe("Wedding Draft Storage & Zero-Loss Sign-In Resumption Suite", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {};

    // Mock localStorage in test environment
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, val: string) => {
          mockStorage[key] = val;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  describe("1. Client-Side Local Draft Persistence Engine", () => {
    const sampleDraft: HostDraftPayload = {
      hostName: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91 98765 43210",
      preferredContactMethod: "WHATSAPP",
      brideName: "Ananya",
      groomName: "Aarav",
      coupleNames: "Ananya & Aarav Celebration",
      city: "Udaipur",
      state: "Rajasthan",
      venueName: "Jagmandir Island Palace",
      weddingDate: "2026-11-20",
      durationDays: 3,
      tradition: "Hindu",
      weddingScale: "GRAND",
      expectedTotalGuests: 400,
      expectedInternationalGuests: 25,
      requestedTier: "ROYAL",
      story: "A magical royal wedding on the waters of Lake Pichola.",
      days: [
        {
          dayNumber: 1,
          date: "2026-11-20",
          title: "Mehndi & Sangeet",
          description: "Vibrant musical night with live folk artists.",
          expectedInternationalGuests: 25,
          events: [
            {
              name: "Sangeet Extravaganza",
              startTime: "18:00",
              endTime: "23:00",
              location: "Palace Courtyard",
            },
          ],
        },
      ],
      savedAt: Date.now(),
    };

    it("saves and retrieves draft snapshot without data loss", () => {
      saveLocalWeddingDraft(sampleDraft);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        DRAFT_STORAGE_KEY,
        expect.stringContaining("Ananya & Aarav Celebration")
      );

      const retrieved = getLocalWeddingDraft();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.coupleNames).toBe("Ananya & Aarav Celebration");
      expect(retrieved?.city).toBe("Udaipur");
      expect(retrieved?.requestedTier).toBe("ROYAL");
      expect(retrieved?.days.length).toBe(1);
      expect(retrieved?.days[0].events?.length).toBe(1);
    });

    it("sets and checks auto-submit intent flag across redirects", () => {
      expect(hasAutoSubmitIntent()).toBe(false);
      setAutoSubmitIntent(true);
      expect(hasAutoSubmitIntent()).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(INTENT_STORAGE_KEY, "true");

      setAutoSubmitIntent(false);
      expect(hasAutoSubmitIntent()).toBe(false);
    });

    it("clears local draft and intent flag completely upon successful submission", () => {
      saveLocalWeddingDraft(sampleDraft);
      setAutoSubmitIntent(true);

      clearLocalWeddingDraft();

      expect(localStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(INTENT_STORAGE_KEY);
      expect(getLocalWeddingDraft()).toBeNull();
      expect(hasAutoSubmitIntent()).toBe(false);
    });
  });

  describe("2. Server Action Resumption & Role Upgrades", () => {
    let mockUser: any;

    beforeEach(() => {
      mockUser = {
        id: "user-newly-signed-in-789",
        email: "authenticated.host@example.com",
        name: "Aarav Sharma",
        role: UserRole.TRAVELER, // User begins with default role TRAVELER
        status: "ACTIVE",
      };

      requireAuth.mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.findMany.mockResolvedValue([{ id: "admin-1" }]);
    });

    it("saves draft and normalizes email without throwing on draft email discrepancy", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-prof-1", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(null);
      mockPrisma.hostApplication.create.mockResolvedValue({
        id: "app-created-1",
        userId: mockUser.id,
        lastSavedAt: new Date(),
      });

      const res = await saveHostApplicationDraftAction({
        hostName: "Aarav Sharma",
        email: "unauthenticated-guest@gmail.com", // Differs from authenticated user email
        coupleNames: "Ananya & Aarav Celebration",
        city: "Udaipur",
        weddingDate: "2026-11-20",
        durationDays: 3,
        requestedTier: "ROYAL",
        expectedTotalGuests: 400,
        expectedInternationalGuests: 25,
        weddingScale: "GRAND",
      });

      expect(res.success).toBe(true);
      expect(res.applicationId).toBe("app-created-1");
    });

    it("atomically submits application, upgrades user role to COUPLE, and creates verification record", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-prof-1", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue({ id: "app-draft-1" });
      mockPrisma.hostApplication.update.mockResolvedValue({
        id: "app-draft-1",
        status: "SUBMITTED",
        submittedAt: new Date(),
      });
      mockPrisma.verification.upsert.mockResolvedValue({
        id: "verif-1",
        status: VerificationStatus.PENDING,
      });

      const res = await submitHostApplicationAction({
        hostName: "Aarav Sharma",
        coupleNames: "Ananya & Aarav Celebration",
        city: "Udaipur",
        weddingDate: "2026-11-20",
        durationDays: 3,
        tradition: "Hindu",
        requestedTier: "ROYAL",
        expectedTotalGuests: 400,
        expectedInternationalGuests: 25,
        weddingScale: "GRAND",
        days: [
          {
            dayNumber: 1,
            title: "Day 1 Ceremony",
            expectedInternationalGuests: 25,
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe("SUBMITTED");

      // Verify user role upgrade was executed in transaction
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { role: UserRole.COUPLE },
      });

      // Verify Verification status was set to PENDING
      expect(mockPrisma.verification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          create: expect.objectContaining({ status: VerificationStatus.PENDING }),
        })
      );
    });
  });
});

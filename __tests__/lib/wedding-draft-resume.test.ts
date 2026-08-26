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
const {
  saveHostApplicationDraftAction,
  submitHostApplicationAction,
  getCurrentHostApplicationAction,
} = require("@/lib/actions/host-application");

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

    it("rejects unauthenticated submission attempts at the server boundary", async () => {
      requireAuth.mockRejectedValueOnce(new Error("UNAUTHORIZED: Authentication required"));

      const res = await submitHostApplicationAction({
        hostName: "Aarav Sharma",
        coupleNames: "Ananya & Aarav Celebration",
        city: "Udaipur",
        weddingDate: "2026-11-20",
        durationDays: 3,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("UNAUTHORIZED");
    });

    it("derives user identity authoritatively from authenticated session", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-prof-1", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue({ id: "app-draft-1" });
      mockPrisma.hostApplication.update.mockResolvedValue({
        id: "app-draft-1",
        status: "SUBMITTED",
        submittedAt: new Date(),
      });
      mockPrisma.verification.upsert.mockResolvedValue({ id: "v1" });

      await submitHostApplicationAction({
        hostName: "Aarav Sharma",
        email: "spoofed.client.email@hack.com", // Client attempts to provide different email
        coupleNames: "Ananya & Aarav Celebration",
        city: "Udaipur",
        weddingDate: "2026-11-20",
        durationDays: 3,
      });

      // Verification and application must strictly use authenticated user's ID and email
      expect(mockPrisma.verification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        })
      );
      expect(mockPrisma.hostApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            email: mockUser.email,
          }),
        })
      );
    });

    it("guarantees idempotency on duplicate submission clicks or multiple resumes", async () => {
      const existingApp = { id: "existing-app-1", userId: mockUser.id, status: "DRAFT" };
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-prof-1", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(existingApp);
      mockPrisma.hostApplication.update.mockResolvedValue({
        ...existingApp,
        status: "SUBMITTED",
      });
      mockPrisma.verification.upsert.mockResolvedValue({ id: "v1" });

      const payload = {
        applicationId: "existing-app-1",
        hostName: "Aarav Sharma",
        coupleNames: "Ananya & Aarav Celebration",
        city: "Udaipur",
        weddingDate: "2026-11-20",
        durationDays: 3,
      };

      // Submit first time
      const res1 = await submitHostApplicationAction(payload);
      expect(res1.success).toBe(true);

      // Submit second time (duplicate click)
      const res2 = await submitHostApplicationAction(payload);
      expect(res2.success).toBe(true);

      // Database should update the existing application in place in a single atomic transaction, never create duplicate rows
      expect(mockPrisma.hostApplication.create).not.toHaveBeenCalled();
      expect(mockPrisma.hostApplication.update).toHaveBeenCalledTimes(2); // 1 single atomic update per submission
    });

    it("ensures all comprehensive form fields survive draft persistence and database commit", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-prof-1", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(null);
      mockPrisma.hostApplication.create.mockResolvedValue({
        id: "full-app-1",
        userId: mockUser.id,
        lastSavedAt: new Date(),
      });

      const fullDraft: HostDraftPayload = {
        hostName: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 9876543210",
        preferredContactMethod: "PHONE",
        brideName: "Priya",
        groomName: "Rahul",
        coupleNames: "Priya & Rahul Royal Wedding",
        city: "Jaipur",
        state: "Rajasthan",
        venueName: "Rambagh Palace",
        weddingDate: "2026-12-25",
        durationDays: 4,
        tradition: "Rajasthani Traditional",
        customTradition: "Royal Marwari",
        weddingScale: "GRAND",
        expectedTotalGuests: 800,
        expectedInternationalGuests: 50,
        requestedTier: "SIGNATURE_ROYAL",
        story: "A royal multi-day celebration welcoming travelers into our heritage.",
        days: [
          {
            dayNumber: 1,
            date: "2026-12-25",
            title: "Royal Welcome & Mehndi",
            description: "Traditional folk music and henna ceremonies.",
            expectedInternationalGuests: 50,
            guestExperience: "Floral greeting and turbans",
            foodExperience: "Authentic Rajasthani thali",
            dressCode: "Festive Indian traditional",
            specialActivities: "Puppet show and folk dancers",
            events: [
              {
                name: "Mehndi Ceremony",
                startTime: "16:00",
                endTime: "20:00",
                location: "Palace Gardens",
                description: "Henna artist stations and welcome snacks",
              },
            ],
          },
          {
            dayNumber: 2,
            date: "2026-12-26",
            title: "Sangeet Night",
            description: "High energy musical and dance night.",
            expectedInternationalGuests: 50,
            guestExperience: "Interactive dance performances",
            foodExperience: "Live counter gourmet feast",
            dressCode: "Indo-Western or Glitzy Indian",
            specialActivities: "Choreographed family performances",
            events: [
              {
                name: "Grand Sangeet",
                startTime: "19:00",
                endTime: "00:00",
                location: "Grand Ballroom",
                description: "Performances, DJ, and dinner",
              },
            ],
          },
        ],
        savedAt: Date.now(),
      };

      // 1. Client persistence test
      saveLocalWeddingDraft(fullDraft);
      const restored = getLocalWeddingDraft();
      expect(restored).toEqual(fullDraft);

      // 2. Server Action execution test
      const res = await saveHostApplicationDraftAction(restored!);
      expect(res.success).toBe(true);

      // 3. Verify Prisma was called with complete structure
      expect(mockPrisma.hostApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            hostName: "Priya Sharma",
            coupleNames: "Priya & Rahul Royal Wedding",
            city: "Jaipur",
            state: "Rajasthan",
            venueName: "Rambagh Palace",
            durationDays: 4,
            tradition: "Rajasthani Traditional",
            weddingScale: "GRAND",
            expectedTotalGuests: 800,
            expectedInternationalGuests: 50,
            requestedTier: "SIGNATURE_ROYAL",
            story: "A royal multi-day celebration welcoming travelers into our heritage.",
          }),
        })
      );

      // Verify Day-by-day and events were upserted
      expect(mockPrisma.hostApplicationDay.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.hostApplicationEvent.create).toHaveBeenCalledTimes(2);
    });

    it("ensures submitHostApplicationAction returns clean JSON-serializable strings for timestamps and status", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-123", userId: mockUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(null);
      mockPrisma.hostApplication.create.mockResolvedValue({
        id: "app-serial-123",
        lastSavedAt: new Date("2026-08-26T12:00:00Z"),
        status: "SUBMITTED",
      });
      mockPrisma.verification.upsert.mockResolvedValue({ id: "verif-1", status: "PENDING" });

      const result = await submitHostApplicationAction({
        hostName: "Aditi Rao",
        email: "aditi@example.com",
        coupleNames: "Aditi & Siddharth Celebration",
        city: "Jaipur",
        weddingDate: "2026-12-15",
        durationDays: 3,
      });

      // Result must be plain object with serializable strings
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("applicationId", "app-serial-123");
      expect(result).toHaveProperty("status", "SUBMITTED");

      const jsonStr = JSON.stringify(result);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.success).toBe(true);
      expect(parsed.applicationId).toBe("app-serial-123");
    });

    it("catches database pool timeout and returns structured error without crashing Server Action boundary", async () => {
      mockPrisma.coupleProfile.findUnique.mockRejectedValueOnce(
        new Error("P2024: Timed out fetching a new connection from the connection pool")
      );

      const result = await submitHostApplicationAction({
        hostName: "Rohan Kapoor",
        email: "rohan@example.com",
        coupleNames: "Rohan & Tara",
        city: "Goa",
        weddingDate: "2026-11-10",
        durationDays: 3,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Timed out fetching a new connection");
      expect(result.errorCode).toBe("DRAFT_SAVE_ERROR");
    });

    it("ensures getCurrentHostApplicationAction returns ISO strings for all dates", async () => {
      mockPrisma.hostApplication.findFirst.mockResolvedValueOnce({
        id: "app-existing-1",
        coupleProfileId: "couple-prof-1",
        userId: mockUser.id,
        hostName: "Pooja Sharma",
        email: "pooja@example.com",
        phone: "+919876543210",
        preferredContactMethod: "WHATSAPP",
        brideName: "Pooja",
        groomName: "Kunal",
        coupleNames: "Pooja & Kunal Celebration",
        city: "Udaipur",
        state: "Rajasthan",
        venueName: "Lake Palace",
        weddingDate: new Date("2026-12-01T00:00:00.000Z"),
        durationDays: 3,
        tradition: "Hindu",
        weddingScale: "GRAND",
        expectedTotalGuests: 500,
        expectedInternationalGuests: 40,
        requestedTier: "SIGNATURE_ROYAL",
        verifiedTier: null,
        verifiedDurationDays: null,
        story: "Love story",
        status: "SUBMITTED",
        adminNotesHostFacing: null,
        reviewedBy: null,
        createdAt: new Date("2026-08-20T10:00:00.000Z"),
        updatedAt: new Date("2026-08-22T14:30:00.000Z"),
        lastSavedAt: new Date("2026-08-22T14:30:00.000Z"),
        days: [],
        documentRequests: [],
        documents: [],
        auditLogs: [],
      });

      mockPrisma.verification.findUnique.mockResolvedValueOnce({
        id: "verif-1",
        status: "PENDING",
        notes: "Pending review",
      });

      const res = await getCurrentHostApplicationAction();
      expect(res.exists).toBe(true);
      expect(res.hasActiveApplication).toBe(true);
      expect(res.application).not.toBeNull();
      expect(typeof res.application?.createdAt).toBe("string");
      expect(typeof res.application?.updatedAt).toBe("string");
      expect(typeof res.application?.lastSavedAt).toBe("string");
      expect(res.application?.createdAt).toBe("2026-08-20T10:00:00.000Z");
    });
  });
});

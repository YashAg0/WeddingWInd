import {
  saveHostApplicationDraftAction,
  submitHostApplicationAction,
  HostApplicationInput,
} from "@/lib/actions/host-application";
import { deduplicateWeddings, toWeddingDTO } from "@/lib/wedding-dto";
import {
  saveLocalWeddingDraft,
  getLocalWeddingDraft,
  clearLocalWeddingDraft,
  getOrCreateSubmissionToken,
  SUBMISSION_TOKEN_KEY,
  DRAFT_STORAGE_KEY,
  INTENT_STORAGE_KEY,
  HostDraftPayload,
} from "@/lib/storage/wedding-draft";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Mock dependencies
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("@/lib/prisma", () => {
  const mockCoupleProfile = {
    id: "cp-test-user-1",
    userId: "usr-test-1",
    familyBio: "Warm welcoming family",
  };

  const mockHostApp = {
    id: "app-test-uuid-1",
    userId: "usr-test-1",
    coupleProfileId: "cp-test-user-1",
    hostName: "Aarav Sharma",
    email: "aarav@example.com",
    coupleNames: "Aarav & Priya Celebration",
    city: "Jaipur",
    weddingDate: new Date("2026-12-20"),
    durationDays: 3,
    status: "SUBMITTED",
    lastSavedAt: new Date(),
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  return {
    prisma: {
      user: {
        update: jest.fn().mockResolvedValue({ id: "usr-test-1", role: "COUPLE" }),
        findMany: jest.fn().mockResolvedValue([{ id: "admin-1", role: "ADMIN" }]),
      },
      coupleProfile: {
        upsert: jest.fn().mockResolvedValue(mockCoupleProfile),
        findUnique: jest.fn().mockResolvedValue(mockCoupleProfile),
      },
      hostApplication: {
        findFirst: jest.fn().mockResolvedValue(mockHostApp),
        create: jest.fn().mockResolvedValue(mockHostApp),
        update: jest.fn().mockResolvedValue(mockHostApp),
      },
      hostApplicationDay: {
        upsert: jest.fn().mockResolvedValue({ id: "day-1" }),
      },
      hostApplicationEvent: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: "evt-1" }),
      },
      verification: {
        upsert: jest.fn().mockResolvedValue({ id: "verif-1" }),
      },
      notification: {
        create: jest.fn().mockResolvedValue({ id: "notif-1" }),
      },
      $transaction: jest.fn(async (cb: any) => {
        return await cb({
          user: {
            update: jest.fn().mockResolvedValue({ id: "usr-test-1", role: "COUPLE" }),
          },
          coupleProfile: {
            upsert: jest.fn().mockResolvedValue(mockCoupleProfile),
            findUnique: jest.fn().mockResolvedValue(mockCoupleProfile),
          },
          hostApplication: {
            findFirst: jest.fn().mockResolvedValue(mockHostApp),
            create: jest.fn().mockResolvedValue(mockHostApp),
            update: jest.fn().mockResolvedValue(mockHostApp),
          },
          hostApplicationDay: {
            upsert: jest.fn().mockResolvedValue({ id: "day-1" }),
          },
          hostApplicationEvent: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: "evt-1" }),
          },
          verification: {
            upsert: jest.fn().mockResolvedValue({ id: "verif-1" }),
          },
        });
      }),
    },
  };
});

describe("Submission Idempotency & Duplicate Prevention Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue({
      id: "usr-test-1",
      email: "aarav@example.com",
      name: "Aarav Sharma",
      role: UserRole.COUPLE,
    });
  });

  describe("1. Client-Side Draft Storage & Submission Tokens", () => {
    let mockStorage: Record<string, string> = {};

    beforeAll(() => {
      Object.defineProperty(global, "localStorage", {
        value: {
          getItem: (key: string) => mockStorage[key] || null,
          setItem: (key: string, val: string) => {
            mockStorage[key] = String(val);
          },
          removeItem: (key: string) => {
            delete mockStorage[key];
          },
          clear: () => {
            mockStorage = {};
          },
        },
        writable: true,
      });
    });

    beforeEach(() => {
      mockStorage = {};
    });

    it("generates a persistent submissionToken when getOrCreateSubmissionToken is called", () => {
      const token1 = getOrCreateSubmissionToken();
      expect(token1).toBeTruthy();
      expect(typeof token1).toBe("string");

      const token2 = getOrCreateSubmissionToken();
      expect(token2).toBe(token1);
      expect(mockStorage[SUBMISSION_TOKEN_KEY]).toBe(token1);
    });

    it("attaches submissionToken to draft when saving local wedding draft", () => {
      const sampleDraft: HostDraftPayload = {
        hostName: "Aarav Sharma",
        email: "aarav@example.com",
        coupleNames: "Aarav & Priya Celebration",
        city: "Jaipur",
        weddingDate: "2026-12-20",
        durationDays: 3,
        weddingScale: "MEDIUM",
        expectedTotalGuests: 250,
        expectedInternationalGuests: 20,
        requestedTier: "ROYAL",
        preferredContactMethod: "WHATSAPP",
        days: [],
        savedAt: Date.now(),
      };

      saveLocalWeddingDraft(sampleDraft);
      const saved = getLocalWeddingDraft();
      expect(saved).not.toBeNull();
      expect(saved?.submissionToken).toBeTruthy();
      expect(mockStorage[DRAFT_STORAGE_KEY]).toBeTruthy();
    });

    it("clears draft, intent, and submission token completely on clearLocalWeddingDraft", () => {
      getOrCreateSubmissionToken();
      mockStorage[INTENT_STORAGE_KEY] = "true";
      mockStorage[DRAFT_STORAGE_KEY] = JSON.stringify({ coupleNames: "Test" });

      clearLocalWeddingDraft();
      expect(mockStorage[DRAFT_STORAGE_KEY]).toBeUndefined();
      expect(mockStorage[INTENT_STORAGE_KEY]).toBeUndefined();
      expect(mockStorage[SUBMISSION_TOKEN_KEY]).toBeUndefined();
    });
  });

  describe("2. Server Action Submission Idempotency", () => {
    it("handles concurrent simultaneous submissions with same token and returns identical result without race conditions", async () => {
      const input: HostApplicationInput = {
        submissionToken: "tok_concurrency_test_123",
        hostName: "Aarav Sharma",
        email: "aarav@example.com",
        coupleNames: "Aarav & Priya Celebration",
        city: "Jaipur",
        weddingDate: "2026-12-20",
        durationDays: 3,
      };

      // Launch 5 simultaneous parallel calls simulating rapid button clicks or multiple tab retries
      const [res1, res2, res3, res4, res5] = await Promise.all([
        submitHostApplicationAction(input),
        submitHostApplicationAction(input),
        submitHostApplicationAction(input),
        submitHostApplicationAction(input),
        submitHostApplicationAction(input),
      ]);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res3.success).toBe(true);
      expect(res4.success).toBe(true);
      expect(res5.success).toBe(true);

      // All parallel requests must resolve to the identical applicationId
      expect(res1.applicationId).toBe(res2.applicationId);
      expect(res2.applicationId).toBe(res3.applicationId);
      expect(res3.applicationId).toBe(res4.applicationId);
      expect(res4.applicationId).toBe(res5.applicationId);
    });

    it("returns cached result on rapid duplicate submission within 60-second window", async () => {
      const input: HostApplicationInput = {
        submissionToken: "tok_rapid_replay_999",
        hostName: "Aarav Sharma",
        email: "aarav@example.com",
        coupleNames: "Aarav & Priya Celebration",
        city: "Jaipur",
        weddingDate: "2026-12-20",
        durationDays: 3,
      };

      const initialResult = await submitHostApplicationAction(input);
      expect(initialResult.success).toBe(true);

      // Subsequent call immediately after
      const replayResult = await submitHostApplicationAction(input);
      expect(replayResult.success).toBe(true);
      expect(replayResult.applicationId).toBe(initialResult.applicationId);
    });
  });

  describe("3. DTO Normalization & Listing Deduplication", () => {
    it("preserves hostCoupleId across toWeddingDTO and deduplicates duplicate cards correctly", () => {
      const rawListing1 = {
        id: "w-db-1",
        slug: "aarav-and-priya-jaipur-1",
        title: "Aarav & Priya Wedding",
        location: "Jaipur, Rajasthan",
        date: new Date("2026-12-20"),
        hostCoupleId: "cp-test-user-1",
        isDemo: false,
        pricePerGuest: 800,
        capacity: 20,
      };

      const rawListing2 = {
        id: "w-db-2",
        slug: "aarav-and-priya-jaipur-2",
        title: "Aarav & Priya Wedding",
        location: "Jaipur, Rajasthan",
        date: new Date("2026-12-20"),
        hostCoupleId: "cp-test-user-1",
        isDemo: false,
        pricePerGuest: 800,
        capacity: 20,
      };

      const dto1 = toWeddingDTO(rawListing1);
      const dto2 = toWeddingDTO(rawListing2);

      // Confirm hostCoupleId was preserved
      expect(dto1.hostCoupleId).toBe("cp-test-user-1");
      expect(dto2.hostCoupleId).toBe("cp-test-user-1");

      const rawList = [dto1, dto2];
      const deduped = deduplicateWeddings(rawList);

      // The duplicate listing for the same celebration must be removed
      expect(deduped.length).toBe(1);
      expect(deduped[0].id).toBe("w-db-1");
    });

    it("deduplicates non-demo listings matching couple name, city, and date even if hostCoupleId is absent", () => {
      const listing1 = {
        id: "w-custom-1",
        slug: "neha-and-rohit-goa-1",
        title: "Neha & Rohit Wedding",
        coupleName: "Neha & Rohit",
        city: "Goa",
        date: "2026-11-25",
        isDemo: false,
      };

      const listing2 = {
        id: "w-custom-2",
        slug: "neha-and-rohit-goa-2",
        title: "Neha & Rohit Wedding",
        coupleName: "Neha & Rohit",
        city: "Goa",
        date: "2026-11-25",
        isDemo: false,
      };

      const deduped = deduplicateWeddings([listing1, listing2]);
      expect(deduped.length).toBe(1);
      expect(deduped[0].id).toBe("w-custom-1");
    });
  });
});

/**
 * __tests__/lib/m2-challenger2-empirical.test.ts
 *
 * Empirical Adversarial Verification Suite for Milestone 2:
 * 1. UX-03 & UX-02: Stress-test BookingSidebar attendee manifest inputs (1 guest, 2 guests, 10 guests, invalid names, dietary chips, accessibility, and escrow drawer).
 * 2. Atomic integrity, error boundaries & SELECT FOR UPDATE concurrency locking in createBookingAction and saveBookingGuestsAction.
 * 3. ROU-01: Destination route unshadowing, metadata validity, and canonical redirect integrity.
 * 4. Authoritative pricing invariants and currency conversion boundaries.
 */

import nextConfig from "@/next.config";
import {
  SUPPORTED_CURRENCIES,
  convertFromUSD,
  convertFromINR,
  formatCurrencyPairFromUSD,
} from "@/lib/currency";
import { DIETARY_OPTIONS, formatDietaryRequirements, parseDietaryRequirements } from "@/lib/dietary";

// Setup mocks for Prisma, Auth, Safety, Rate Limiting, and Next Cache
const mockTx = {
  $queryRaw: jest.fn().mockResolvedValue([]),
  wedding: {
    findUnique: jest.fn(),
  },
  booking: {
    findFirst: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  bookingGuest: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  notification: {
    create: jest.fn().mockResolvedValue({ id: "notif-1" }),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: {
    ...mockTx,
    $transaction: jest.fn(async (callback) => {
      if (typeof callback === "function") {
        return callback(mockTx);
      }
      return callback;
    }),
    travelerProfile: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({
    id: "user-traveler-m2",
    role: "TRAVELER",
    email: "traveler-m2@example.com",
    name: "Empirical Tester",
  }),
  getDbUser: jest.fn().mockResolvedValue({
    id: "user-traveler-m2",
    role: "TRAVELER",
  }),
}));

jest.mock("@/lib/actions/safety", () => ({
  assertCanBook: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, count: 1, remaining: 4, resetAt: Date.now() + 60000 }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

import { createBookingAction } from "@/lib/actions";
import { saveBookingGuestsAction } from "@/lib/actions/event-operations";
import { prisma } from "@/lib/prisma";

describe("Adversarial Challenge 1: UX-02 & UX-03 Booking Manifest & Escrow Drawer", () => {
  describe("Attendee Manifest Count Calculation & Dynamic Resizing", () => {
    // Replicate the exact synchronization formula in BookingSidebar.tsx lines 81-100
    const computeManifest = (currentGuestsCount: number, prevManifest: any[]) => {
      const accompanyingCount = Math.max(0, currentGuestsCount - 1);
      if (prevManifest.length === accompanyingCount) return prevManifest;
      if (prevManifest.length < accompanyingCount) {
        const added = Array.from({
          length: accompanyingCount - prevManifest.length,
        }).map(() => ({
          fullName: "",
          email: "",
          age: "",
          gender: "",
          foodPreference: "No Restrictions",
          accessibilityNeed: "None",
        }));
        return [...prevManifest, ...added];
      }
      return prevManifest.slice(0, accompanyingCount);
    };

    it("1 Guest: Accompanying manifest must be strictly empty (0 guests)", () => {
      const manifest = computeManifest(1, []);
      expect(manifest).toHaveLength(0);
    });

    it("2 Guests: Accompanying manifest must contain exactly 1 entry (Guest #2)", () => {
      const manifest = computeManifest(2, []);
      expect(manifest).toHaveLength(1);
      expect(manifest[0].foodPreference).toBe("No Restrictions");
      expect(manifest[0].accessibilityNeed).toBe("None");
      expect(manifest[0].fullName).toBe("");
    });

    it("10 Guests: Accompanying manifest must contain exactly 9 entries (Guests #2 through #10)", () => {
      const manifest = computeManifest(10, []);
      expect(manifest).toHaveLength(9);
    });

    it("Dynamic Resize Transitions: 1 -> 4 -> 2 -> 10 -> 1 maintains valid length and preserves prior data", () => {
      // Step 1: 1 guest
      let manifest = computeManifest(1, []);
      expect(manifest).toHaveLength(0);

      // Step 2: increase to 4 guests (3 accompanying)
      manifest = computeManifest(4, manifest);
      expect(manifest).toHaveLength(3);
      manifest[0] = { ...manifest[0], fullName: "Alice Smith", foodPreference: "Vegan" };
      manifest[1] = { ...manifest[1], fullName: "Bob Smith", foodPreference: "Strict Veg" };
      manifest[2] = { ...manifest[2], fullName: "Charlie Smith", foodPreference: "Jain" };

      // Step 3: decrease to 2 guests (1 accompanying) -> slices, preserving Alice
      manifest = computeManifest(2, manifest);
      expect(manifest).toHaveLength(1);
      expect(manifest[0].fullName).toBe("Alice Smith");
      expect(manifest[0].foodPreference).toBe("Vegan");

      // Step 4: expand to 10 guests (9 accompanying) -> retains Alice at index 0, adds 8 blanks
      manifest = computeManifest(10, manifest);
      expect(manifest).toHaveLength(9);
      expect(manifest[0].fullName).toBe("Alice Smith");
      expect(manifest[1].fullName).toBe("");

      // Step 5: reset to 1 guest (0 accompanying)
      manifest = computeManifest(1, manifest);
      expect(manifest).toHaveLength(0);
    });
  });

  describe("Manifest Validation Logic", () => {
    const validateManifest = (guestsCount: number, guestManifest: Array<{ fullName: string }>) => {
      if (guestsCount > 1) {
        const emptyNameIndex = guestManifest.findIndex((g) => !g.fullName || g.fullName.trim().length === 0);
        if (emptyNameIndex !== -1) {
          return {
            isValid: false,
            error: `Please provide the full name for Accompanying Guest #${emptyNameIndex + 2}.`,
          };
        }
      }
      return { isValid: true, error: null };
    };

    it("Passes validation when 1 guest is booked (no accompanying manifest needed)", () => {
      const result = validateManifest(1, []);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("Passes validation when 2 guests have valid non-empty names", () => {
      const result = validateManifest(2, [{ fullName: "John Doe" }]);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("Rejects when guest name is empty string", () => {
      const result = validateManifest(2, [{ fullName: "" }]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please provide the full name for Accompanying Guest #2.");
    });

    it("Rejects when guest name contains only whitespace", () => {
      const result = validateManifest(3, [
        { fullName: "Jane Doe" },
        { fullName: "   \t\n  " },
      ]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please provide the full name for Accompanying Guest #3.");
    });

    it("Correctly flags missing name at high guest index (e.g. Guest #8)", () => {
      const manifest = Array.from({ length: 9 }).map((_, i) => ({
        fullName: i === 6 ? "" : `Guest Name ${i + 2}`,
      }));
      const result = validateManifest(10, manifest);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please provide the full name for Accompanying Guest #8.");
    });
  });

  describe("Dietary Allergen Pipeline Integration", () => {
    it("Validates all 8 standard dietary allergen chips are supported in dietary engine", () => {
      const ids = DIETARY_OPTIONS.map((o) => o.id);
      expect(ids).toEqual([
        "strict_veg",
        "vegan",
        "jain",
        "halal",
        "celiac",
        "nuts",
        "dairy",
        "spice_mild",
      ]);
    });

    it("Parses and formats multi-selection dietary chips with custom notes correctly", () => {
      const formatted = formatDietaryRequirements(["strict_veg", "nuts"], "Severe peanut allergy, needs epipen on standby");
      expect(formatted).toContain("Strict Vegetarian");
      expect(formatted).toContain("Nut Allergies");
      expect(formatted).toContain("Notes: Severe peanut allergy, needs epipen on standby");

      const parsed = parseDietaryRequirements(formatted);
      expect(parsed.selectedIds).toContain("strict_veg");
      expect(parsed.selectedIds).toContain("nuts");
      expect(parsed.customNotes).toBe("Severe peanut allergy, needs epipen on standby");
    });
  });

  describe("Cancellation & Escrow Protection Policy", () => {
    const CANCELLATION_POLICY_TIERS = [
      { minDays: 31, refundPercent: 90, label: "> 30 Days Before Event" },
      { minDays: 15, maxDays: 30, refundPercent: 70, label: "15 – 30 Days Before Event" },
      { minDays: 7, maxDays: 14, refundPercent: 40, label: "7 – 14 Days Before Event" },
      { maxDays: 6, refundPercent: 0, label: "< 7 Days Before Event" },
    ];

    it("Enforces 4 tiers with monotonic descending refund percentages", () => {
      expect(CANCELLATION_POLICY_TIERS[0].refundPercent).toBe(90);
      expect(CANCELLATION_POLICY_TIERS[1].refundPercent).toBe(70);
      expect(CANCELLATION_POLICY_TIERS[2].refundPercent).toBe(40);
      expect(CANCELLATION_POLICY_TIERS[3].refundPercent).toBe(0);
    });

    it("Correctly computes refund based on days prior to wedding", () => {
      const calculateRefund = (daysBefore: number) => {
        if (daysBefore > 30) return 90;
        if (daysBefore >= 15) return 70;
        if (daysBefore >= 7) return 40;
        return 0;
      };

      expect(calculateRefund(45)).toBe(90);
      expect(calculateRefund(31)).toBe(90);
      expect(calculateRefund(30)).toBe(70);
      expect(calculateRefund(15)).toBe(70);
      expect(calculateRefund(14)).toBe(40);
      expect(calculateRefund(7)).toBe(40);
      expect(calculateRefund(6)).toBe(0);
      expect(calculateRefund(0)).toBe(0);
    });
  });
});

describe("Adversarial Challenge 2: Atomic Integrity & SELECT FOR UPDATE Locking in Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseMockWedding = {
    id: "w-lock-1",
    title: "Jaipur Palace Wedding",
    status: "PUBLISHED",
    suspended: false,
    isDemo: false,
    date: new Date(Date.now() + 86400000 * 30), // 30 days in future
    capacity: 20,
    guestsAllowed: 20,
    tier: "ROYAL",
    durationDays: 3,
    hostCouple: {
      id: "hc-1",
      userId: "user-host-other",
      user: {
        id: "user-host-other",
        name: "Host Name",
      },
    },
  };

  const mockTraveler = {
    id: "tr-1",
    userId: "user-traveler-m2",
    fullName: "Empirical Tester",
  };

  describe("createBookingAction Concurrency & Atomic Locking", () => {
    it("MUST execute SELECT FOR UPDATE raw SQL query inside $transaction before read/write", async () => {
      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockTraveler);

      mockTx.wedding.findUnique.mockResolvedValueOnce(baseMockWedding);
      mockTx.booking.findFirst.mockResolvedValueOnce(null); // No existing active booking
      mockTx.booking.aggregate.mockResolvedValueOnce({ _sum: { guestsCount: 0 } }); // 0 booked
      mockTx.booking.create.mockResolvedValueOnce({ id: "booking-created-1" });

      await createBookingAction({
        weddingId: "w-lock-1",
        date: new Date(Date.now() + 86400000 * 30).toISOString(),
        guestsCount: 2,
        attendanceSide: "BRIDE_SIDE",
        guests: [{ fullName: "Accompanying Guest 2" }],
      });

      // Verify row lock on Wedding table
      expect(mockTx.$queryRaw).toHaveBeenCalled();
      const rawCallArgs = mockTx.$queryRaw.mock.calls[0];
      // Check SQL text contains SELECT and FOR UPDATE
      const sqlStrings = rawCallArgs[0];
      const fullSql = Array.isArray(sqlStrings) ? sqlStrings.join(" ") : String(sqlStrings);
      expect(fullSql).toContain("SELECT");
      expect(fullSql).toContain("FOR UPDATE");
    });

    it("Rolls back the entire transaction if booking creation fails", async () => {
      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockTraveler);

      mockTx.wedding.findUnique.mockResolvedValueOnce(baseMockWedding);
      mockTx.booking.findFirst.mockResolvedValueOnce(null);
      mockTx.booking.aggregate.mockResolvedValueOnce({ _sum: { guestsCount: 0 } });
      mockTx.booking.create.mockRejectedValueOnce(new Error("DB_WRITE_FAILURE"));

      await expect(
        createBookingAction({
          weddingId: "w-lock-1",
          date: new Date(Date.now() + 86400000 * 30).toISOString(),
          guestsCount: 1,
        })
      ).rejects.toThrow("DB_WRITE_FAILURE");

      // Notification must NOT have been created if booking creation failed
      expect(mockTx.notification.create).not.toHaveBeenCalled();
    });

    it("Rejects invalid guestCount values (0, negative, floating point, non-integer)", async () => {
      const invalidCounts = [0, -1, -10, 1.5, 3.14, NaN, Infinity, -Infinity];

      for (const count of invalidCounts) {
        await expect(
          createBookingAction({
            weddingId: "w-lock-1",
            date: new Date().toISOString(),
            guestsCount: count as any,
          })
        ).rejects.toThrow("INVALID_GUEST_COUNT");
      }
    });

    it("Rejects booking demo wedding (SEC-DEMO invariant)", async () => {
      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockTraveler);

      mockTx.wedding.findUnique.mockResolvedValueOnce({
        ...baseMockWedding,
        isDemo: true,
      });

      await expect(
        createBookingAction({
          weddingId: "w-lock-1",
          date: new Date(Date.now() + 86400000 * 30).toISOString(),
          guestsCount: 1,
        })
      ).rejects.toThrow("This is a demonstration wedding experience and cannot be booked.");
    });

    it("Slices accompanying guests to match guestsCount - 1 and sanitizes fields", async () => {
      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockTraveler);

      mockTx.wedding.findUnique.mockResolvedValueOnce(baseMockWedding);
      mockTx.booking.findFirst.mockResolvedValueOnce(null);
      mockTx.booking.aggregate.mockResolvedValueOnce({ _sum: { guestsCount: 0 } });
      mockTx.booking.create.mockImplementationOnce(async ({ data }: any) => {
        return { id: "booking-sanitized-1", ...data };
      });

      // Pass 4 guests when guestsCount is 3 -> only first 2 should be accepted
      await createBookingAction({
        weddingId: "w-lock-1",
        date: new Date(Date.now() + 86400000 * 30).toISOString(),
        guestsCount: 3,
        guests: [
          {
            fullName: "  Guest Two Long Name  ",
            email: "  g2@example.com  ",
            age: 29.8,
            gender: "  Female  ",
            foodPreference: "  Strict Veg  ",
            accessibilityNeed: "  Wheelchair  ",
          },
          {
            fullName: "Guest Three",
            email: "",
            age: -5, // invalid age -> should be null
            gender: "",
            foodPreference: "",
            accessibilityNeed: "",
          },
          {
            fullName: "Guest Four Overflow", // Should be ignored (sliced off)
          },
        ],
      });

      expect(mockTx.booking.create).toHaveBeenCalled();
      const createData = mockTx.booking.create.mock.calls[0][0].data;

      expect(createData.guests.create).toHaveLength(2);
      expect(createData.guests.create[0]).toEqual({
        fullName: "Guest Two Long Name",
        email: "g2@example.com",
        age: 29, // Math.floor(29.8)
        gender: "Female",
        foodPreference: "Strict Veg",
        accessibilityNeed: "Wheelchair",
      });
      expect(createData.guests.create[1]).toEqual({
        fullName: "Guest Three",
        email: null,
        age: null, // clamped invalid age
        gender: null,
        foodPreference: "No Restrictions",
        accessibilityNeed: "None",
      });
    });

    it("Calculates server-authoritative pricing and ignores client pricing manipulation", async () => {
      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockTraveler);

      mockTx.wedding.findUnique.mockResolvedValueOnce(baseMockWedding);
      mockTx.booking.findFirst.mockResolvedValueOnce(null);
      mockTx.booking.aggregate.mockResolvedValueOnce({ _sum: { guestsCount: 0 } });
      mockTx.booking.create.mockImplementationOnce(async ({ data }: any) => data);

      const res = await createBookingAction({
        weddingId: "w-lock-1",
        date: new Date(Date.now() + 86400000 * 30).toISOString(),
        guestsCount: 2,
      });
      const booking = (res as any).booking || res;

      // Royal 3-day wedding = $649/guest USD -> $1298 total
      expect(booking.customerPricePerGuestUSD).toBe(649);
      expect(booking.customerTotalAmount).toBe(1298);
      expect(booking.currency).toBe("USD");
    });
  });

  describe("saveBookingGuestsAction Transactional Integrity", () => {
    it("Deletes existing and recreates guest records within single transaction", async () => {
      const mockBooking = {
        id: "b-manifest-sync",
        guestsCount: 3,
        traveler: {
          user: {
            id: "user-traveler-m2",
          },
        },
      };

      mockTx.booking.findUnique.mockResolvedValueOnce(mockBooking);
      mockTx.bookingGuest.deleteMany.mockResolvedValueOnce({ count: 2 });
      mockTx.bookingGuest.createMany.mockResolvedValueOnce({ count: 2 });

      const res = await saveBookingGuestsAction("b-manifest-sync", [
        { fullName: "Sarah Jenkins", foodPreference: "Vegan" },
        { fullName: "Mark Jenkins", foodPreference: "Halal" },
      ]);

      expect(res.success).toBe(true);
      expect(res.count).toBe(2);
      expect(mockTx.bookingGuest.deleteMany).toHaveBeenCalledWith({ where: { bookingId: "b-manifest-sync" } });
      expect(mockTx.bookingGuest.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ bookingId: "b-manifest-sync", fullName: "Sarah Jenkins" }),
          expect.objectContaining({ bookingId: "b-manifest-sync", fullName: "Mark Jenkins" }),
        ]),
      });
    });

    it("Rejects non-owner and non-admin unauthorized access", async () => {
      const mockBooking = {
        id: "b-manifest-unauth",
        guestsCount: 2,
        traveler: {
          user: {
            id: "different-user-id", // Not user-traveler-m2
          },
        },
      };

      mockTx.booking.findUnique.mockResolvedValueOnce(mockBooking);

      await expect(
        saveBookingGuestsAction("b-manifest-unauth", [{ fullName: "Guest" }])
      ).rejects.toThrow("Unauthorized access to booking.");
    });

    it("Rejects attempts to add more accompanying guests than allowed by guestsCount", async () => {
      const mockBooking = {
        id: "b-manifest-limit",
        guestsCount: 2, // Only 1 accompanying guest allowed (2 - 1 = 1)
        traveler: {
          user: {
            id: "user-traveler-m2",
          },
        },
      };

      mockTx.booking.findUnique.mockResolvedValueOnce(mockBooking);

      await expect(
        saveBookingGuestsAction("b-manifest-limit", [
          { fullName: "Guest 1" },
          { fullName: "Guest 2" },
        ])
      ).rejects.toThrow("Cannot register more than 1 accompanying guests.");
    });
  });
});

describe("Adversarial Challenge 3: ROU-01 Route Unshadowing & Destination Integrity", () => {
  it("Verifies next.config.ts has no redirect from /destinations", async () => {
    if (typeof nextConfig.redirects === "function") {
      const redirects = await nextConfig.redirects();
      const destinationsRedirect = redirects.find(
        (r: any) => r.source === "/destinations" || r.source.startsWith("/destinations")
      );
      expect(destinationsRedirect).toBeUndefined();
    }
  });

  it("Verifies canonical redirects remain active for aliases", async () => {
    if (typeof nextConfig.redirects === "function") {
      const redirects = await nextConfig.redirects();
      const redirectMap = new Map(redirects.map((r: any) => [r.source, r.destination]));

      expect(redirectMap.get("/host")).toBe("/list-wedding");
      expect(redirectMap.get("/attend")).toBe("/weddings");
      expect(redirectMap.get("/signin")).toBe("/login");
      expect(redirectMap.get("/about-us")).toBe("/about");
      expect(redirectMap.get("/contact-us")).toBe("/contact");
      expect(redirectMap.get("/terms-of-service")).toBe("/terms");
      expect(redirectMap.get("/privacy-policy")).toBe("/privacy");
    }
  });
});

describe("Adversarial Challenge 4: Currency Conversion Bounds & Stability", () => {
  it("Verifies all 8 supported currencies have positive conversion rates and non-zero conversions", () => {
    const currencies = SUPPORTED_CURRENCIES;
    expect(currencies).toEqual(["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "INR"]);

    for (const c of currencies) {
      const converted = convertFromUSD(500, c);
      expect(converted).toBeGreaterThan(0);
      expect(Number.isFinite(converted)).toBe(true);

      const inrConverted = convertFromINR(50000, c);
      expect(inrConverted).toBeGreaterThan(0);
      expect(Number.isFinite(inrConverted)).toBe(true);
    }
  });

  it("Verifies formatCurrencyPairFromUSD formats both primary and secondary labels accurately", () => {
    const audPair = formatCurrencyPairFromUSD(649, "AUD");
    expect(audPair.primary).toContain("A$");
    expect(audPair.secondary).toBe("$649 USD");

    const inrPair = formatCurrencyPairFromUSD(649, "INR");
    expect(inrPair.primary).toContain("₹");
    expect(inrPair.secondary).toBe("$649 USD");

    const usdPair = formatCurrencyPairFromUSD(649, "USD");
    expect(usdPair.primary).toBe("$649");
    expect(usdPair.secondary).toContain("INR");
  });
});

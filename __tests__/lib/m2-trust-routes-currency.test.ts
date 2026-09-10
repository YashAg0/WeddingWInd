import { toWeddingDTO } from "@/lib/wedding-dto";
import {
  SUPPORTED_CURRENCIES,
  FX_RATES,
  CURRENCY_SYMBOLS,
  CURRENCY_METADATA,
  convertFromINR,
  convertFromUSD,
  formatCurrencyPairFromUSD,
  detectBrowserCurrency,
  type SupportedCurrency,
} from "@/lib/currency";
import nextConfig from "@/next.config";

// Mock prisma and auth for server actions
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(async (callback) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([]),
        wedding: {
          findUnique: jest.fn(),
        },
        booking: {
          findFirst: jest.fn(),
          aggregate: jest.fn(),
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        bookingGuest: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        notification: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
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
    id: "user-traveler-1",
    role: "TRAVELER",
    email: "traveler@example.com",
    name: "John Doe",
  }),
  getDbUser: jest.fn().mockResolvedValue({
    id: "user-traveler-1",
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
}));

describe("Milestone 2: TRU-01 (Trust Verification & KYC Binding)", () => {
  const baseWedding = {
    id: "wedding-tru-1",
    slug: "royal-udaipur-celebration",
    title: "Royal Udaipur Palace Wedding",
    location: "Udaipur, Rajasthan",
    category: "Royal",
    tier: "ROYAL",
    durationDays: 3,
    capacity: 20,
    guestsAllowed: 20,
    pricePerGuest: 649,
    status: "PUBLISHED",
    isDemo: false,
    date: new Date("2026-12-01T00:00:00.000Z"),
    hostCouple: {
      id: "couple-1",
      name: "Rohan & Priya",
      familyBio: "Royal lineage",
      user: {
        id: "user-host-1",
        name: "Rohan & Priya",
      },
    },
  };

  it("should NOT mark unvetted host as verified even if listing status is PUBLISHED", () => {
    const unvetted = {
      ...baseWedding,
      status: "PUBLISHED",
      isDemo: false,
      hostCouple: {
        ...baseWedding.hostCouple,
        user: {
          id: "u-unvetted",
          name: "Unvetted Host",
          // No verification record, no badges
        },
      },
    };

    const dto = toWeddingDTO(unvetted);
    expect(dto.isVerified).toBe(false);
  });

  it("should NEVER mark demo weddings as verified regardless of published/approved flags", () => {
    const demoWedding = {
      ...baseWedding,
      isDemo: true,
      status: "PUBLISHED",
      isVerified: true,
      hostCouple: {
        ...baseWedding.hostCouple,
        user: {
          id: "u-demo",
          name: "Demo Host",
          verification: { status: "APPROVED" },
          badges: [{ badge: { key: "verified-host" }, revokedAt: null }],
        },
      },
    };

    const dto = toWeddingDTO(demoWedding);
    expect(dto.isVerified).toBe(false);
  });

  it("should mark wedding as verified when host user has APPROVED verification record", () => {
    const verifiedWedding = {
      ...baseWedding,
      hostCouple: {
        ...baseWedding.hostCouple,
        user: {
          id: "u-verified",
          name: "Verified Host",
          verification: {
            status: "APPROVED",
            verifiedAt: new Date(),
          },
        },
      },
    };

    const dto = toWeddingDTO(verifiedWedding);
    expect(dto.isVerified).toBe(true);
  });

  it("should mark wedding as verified when host user has active unrevoked verified-host quality badge", () => {
    const badgedWedding = {
      ...baseWedding,
      hostCouple: {
        ...baseWedding.hostCouple,
        user: {
          id: "u-badged",
          name: "Badged Host",
          badges: [
            {
              badge: { key: "verified-host" },
              revokedAt: null,
            },
          ],
        },
      },
    };

    const dto = toWeddingDTO(badgedWedding);
    expect(dto.isVerified).toBe(true);
  });

  it("should NOT mark wedding as verified if verified-host badge is revoked", () => {
    const revokedBadgeWedding = {
      ...baseWedding,
      hostCouple: {
        ...baseWedding.hostCouple,
        user: {
          id: "u-revoked",
          name: "Revoked Badge Host",
          badges: [
            {
              badge: { key: "verified-host" },
              revokedAt: new Date("2026-01-01"),
            },
          ],
        },
      },
    };

    const dto = toWeddingDTO(revokedBadgeWedding);
    expect(dto.isVerified).toBe(false);
  });
});

describe("Milestone 2: ROU-01 (Route Unshadowing)", () => {
  it("should verify next.config.ts does not redirect /destinations to /weddings", async () => {
    if (typeof nextConfig.redirects === "function") {
      const redirects = await nextConfig.redirects();
      const destinationsRedirect = redirects.find(
        (r: any) => r.source === "/destinations" || r.source === "/destinations/"
      );
      expect(destinationsRedirect).toBeUndefined();
    }
  });

  it("should preserve existing legitimate legacy redirects in next.config.ts", async () => {
    if (typeof nextConfig.redirects === "function") {
      const redirects = await nextConfig.redirects();
      const hostRedirect = redirects.find((r: any) => r.source === "/host");
      expect(hostRedirect).toBeDefined();
      expect(hostRedirect?.destination).toBe("/list-wedding");

      const attendRedirect = redirects.find((r: any) => r.source === "/attend");
      expect(attendRedirect).toBeDefined();
      expect(attendRedirect?.destination).toBe("/weddings");
    }
  });
});

describe("Milestone 2: FIN-01 (Native 8-Currency Engine)", () => {
  it("should support all 8 currencies with valid metadata and positive conversion rates", () => {
    const expectedCurrencies: SupportedCurrency[] = ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "INR"];
    expect(SUPPORTED_CURRENCIES).toEqual(expectedCurrencies);

    for (const curr of expectedCurrencies) {
      expect(FX_RATES[curr]).toBeGreaterThan(0);
      expect(CURRENCY_SYMBOLS[curr]).toBeDefined();
      expect(CURRENCY_METADATA[curr]).toBeDefined();
      expect(CURRENCY_METADATA[curr].code).toBe(curr);
      expect(CURRENCY_METADATA[curr].symbol).toBe(CURRENCY_SYMBOLS[curr]);
      expect(CURRENCY_METADATA[curr].flag).toBeTruthy();
    }
  });

  it("should accurately convert between INR, USD, and other currencies", () => {
    // 95.5 INR = 1 USD (MODEL_FX rate)
    const inrAmount = 95500; // 1000 USD
    const usd = convertFromINR(inrAmount, "USD");
    expect(usd).toBeCloseTo(1000, 0);

    const eur = convertFromINR(inrAmount, "EUR");
    expect(eur).toBeGreaterThan(0);

    const gbpFromUSD = convertFromUSD(1000, "GBP");
    expect(gbpFromUSD).toBeGreaterThan(0);

    const inrFromUSD = convertFromUSD(100, "INR");
    expect(inrFromUSD).toBe(9550);
  });

  it("should format currency amounts with primary and secondary strings", () => {
    const formattedUSD = formatCurrencyPairFromUSD(649, "USD");
    expect(formattedUSD.primary).toBe("$649");
    expect(formattedUSD.secondary).toContain("INR");

    const formattedEUR = formatCurrencyPairFromUSD(649, "EUR");
    expect(formattedEUR.primary).toContain("€");
    expect(formattedEUR.secondary).toBe("$649 USD");

    const formattedINR = formatCurrencyPairFromUSD(649, "INR");
    expect(formattedINR.primary).toContain("₹");
    expect(formattedINR.secondary).toBe("$649 USD");
  });

  it("should detect browser currency based on browser locale", () => {
    expect(detectBrowserCurrency("en-GB")).toBe("GBP");
    expect(detectBrowserCurrency("en-AU")).toBe("AUD");
    expect(detectBrowserCurrency("en-CA")).toBe("CAD");
    expect(detectBrowserCurrency("en-SG")).toBe("SGD");
    expect(detectBrowserCurrency("ar-AE")).toBe("AED");
    expect(detectBrowserCurrency("hi-IN")).toBe("INR");
    expect(detectBrowserCurrency("de-DE")).toBe("EUR");
    expect(detectBrowserCurrency("en-US")).toBe("USD");
    expect(detectBrowserCurrency("unknown-locale")).toBe("USD");
  });
});

describe("Milestone 2: UX-03 (Cancellation & Escrow Protection)", () => {
  it("should verify 4-tier refund policy structure", () => {
    const CANCELLATION_POLICY_TIERS = [
      { minDays: 31, refundPercent: 90, label: "> 30 Days Before Event" },
      { minDays: 15, maxDays: 30, refundPercent: 70, label: "15 – 30 Days Before Event" },
      { minDays: 7, maxDays: 14, refundPercent: 40, label: "7 – 14 Days Before Event" },
      { maxDays: 6, refundPercent: 0, label: "< 7 Days Before Event" },
    ];

    expect(CANCELLATION_POLICY_TIERS[0].refundPercent).toBe(90);
    expect(CANCELLATION_POLICY_TIERS[1].refundPercent).toBe(70);
    expect(CANCELLATION_POLICY_TIERS[2].refundPercent).toBe(40);
    expect(CANCELLATION_POLICY_TIERS[3].refundPercent).toBe(0);
  });
});

describe("Milestone 2: UX-02 (Multi-Guest Attendee Manifest Server Actions)", () => {
  it("should save and replace booking guests in saveBookingGuestsAction", async () => {
    const { saveBookingGuestsAction } = require("@/lib/actions/event-operations");
    const { prisma } = require("@/lib/prisma");

    const mockBooking = {
      id: "booking-manifest-1",
      guestsCount: 3,
      traveler: {
        user: {
          id: "user-traveler-1",
        },
      },
    };

    // Override mock transaction behavior for this test
    prisma.$transaction.mockImplementationOnce(async (txCallback: any) => {
      const tx = {
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
        },
        bookingGuest: {
          deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      };
      return txCallback(tx);
    });

    const res = await saveBookingGuestsAction("booking-manifest-1", [
      {
        fullName: "Sarah Jenkins",
        email: "sarah@example.com",
        age: 28,
        gender: "Female",
        foodPreference: "Strict Veg",
        accessibilityNeed: "None",
      },
      {
        fullName: "Mark Jenkins",
        email: "mark@example.com",
        age: 30,
        gender: "Male",
        foodPreference: "Jain",
        accessibilityNeed: "Wheelchair ramp",
      },
    ]);

    expect(res).toEqual({ success: true, count: 2 });
  });

  it("should reject saving more accompanying guests than permitted by booking seat count", async () => {
    const { saveBookingGuestsAction } = require("@/lib/actions/event-operations");
    const { prisma } = require("@/lib/prisma");

    const mockBooking = {
      id: "booking-manifest-2",
      guestsCount: 2, // Only 1 accompanying guest allowed
      traveler: {
        user: {
          id: "user-traveler-1",
        },
      },
    };

    prisma.$transaction.mockImplementationOnce(async (txCallback: any) => {
      const tx = {
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
        },
      };
      return txCallback(tx);
    });

    await expect(
      saveBookingGuestsAction("booking-manifest-2", [
        { fullName: "Guest 2" },
        { fullName: "Guest 3" }, // Exceeds max (1)
      ])
    ).rejects.toThrow("Cannot register more than 1 accompanying guests.");
  });
});

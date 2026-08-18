/**
 * __tests__/lib/runtime-resilience.test.ts
 *
 * Regression test suite verifying that no null/undefined/invalid date or legacy data
 * can cause runtime crashes or trigger "A Momentary Interruption" error boundary.
 */

import { toWeddingDTO, isSponsorshipActive } from "@/lib/wedding-dto";
import { normalizeWeddingTier, normalizeDurationDays, getCustomerPriceUSD } from "@/lib/services/pricing-engine";

describe("Runtime Resilience & Error Boundary Prevention", () => {
  describe("toWeddingDTO Legacy & Edge Case Immunity", () => {
    it("should safely normalize a wedding with missing/null dates without throwing RangeError", () => {
      const rawWedding = {
        id: "w-legacy-1",
        title: "Jaipur Heritage Wedding",
        location: "Jaipur, Rajasthan",
        sponsorshipStart: "INVALID_DATE_STRING",
        sponsorshipEnd: null,
        date: null,
        tier: null,
        durationDays: null,
        events: null,
        traditions: null,
        gallery: null,
        hostCouple: null,
      };

      expect(() => {
        const dto = toWeddingDTO(rawWedding);
        expect(dto.id).toBe("w-legacy-1");
        expect(dto.tier).toBe("STANDARD");
        expect(dto.durationDays).toBe(3);
        expect(dto.pricePerGuest).toBe(249);
        expect(dto.sponsorshipStart).toBeNull();
        expect(dto.sponsorshipEnd).toBeNull();
        expect(dto.sponsored).toBe(false);
        expect(dto.date).toBe("");
      }).not.toThrow();
    });

    it("should safely handle valid sponsorship dates", () => {
      const now = new Date();
      const future = new Date(Date.now() + 86400000 * 7);

      const rawWedding = {
        id: "w-sponsored-1",
        title: "Sponsored Royal Celebration",
        location: "Udaipur, Rajasthan",
        sponsored: true,
        sponsorshipStart: now.toISOString(),
        sponsorshipEnd: future.toISOString(),
        date: future,
        tier: "ROYAL",
        durationDays: 4,
      };

      const dto = toWeddingDTO(rawWedding);
      expect(dto.sponsored).toBe(true);
      expect(dto.sponsorshipStart).toBe(now.toISOString());
      expect(dto.sponsorshipEnd).toBe(future.toISOString());
      expect(dto.pricePerGuest).toBe(799); // Royal 4-day
    });

    it("should safely evaluate expired sponsorship without throwing", () => {
      const pastStart = new Date(Date.now() - 86400000 * 14);
      const pastEnd = new Date(Date.now() - 86400000 * 7);

      const rawWedding = {
        id: "w-expired-1",
        title: "Expired Sponsorship Wedding",
        location: "Goa",
        sponsored: true,
        sponsorshipStart: pastStart.toISOString(),
        sponsorshipEnd: pastEnd.toISOString(),
      };

      expect(isSponsorshipActive(rawWedding)).toBe(false);
      const dto = toWeddingDTO(rawWedding);
      expect(dto.sponsored).toBe(false);
    });
  });

  describe("Tier & Duration Normalizer Immunity", () => {
    it("should normalize arbitrary input strings without crashing", () => {
      expect(normalizeWeddingTier(null)).toBe("STANDARD");
      expect(normalizeWeddingTier(undefined)).toBe("STANDARD");
      expect(normalizeWeddingTier("")).toBe("STANDARD");
      expect(normalizeWeddingTier("unknown_tier_xyz")).toBe("STANDARD");
      expect(normalizeWeddingTier("signature royal")).toBe("SIGNATURE_ROYAL");
      expect(normalizeWeddingTier("SIGNATURE_ROYAL")).toBe("SIGNATURE_ROYAL");
      expect(normalizeWeddingTier("grand")).toBe("GRAND");

      expect(normalizeDurationDays(null)).toBe(1);
      expect(normalizeDurationDays(undefined)).toBe(1);
      expect(normalizeDurationDays("abc")).toBe(1);
      expect(normalizeDurationDays(-5)).toBe(1);
      expect(normalizeDurationDays(0)).toBe(1);
      expect(normalizeDurationDays(1)).toBe(1);
      expect(normalizeDurationDays(4)).toBe(4);
      expect(normalizeDurationDays(10)).toBe(5); // clamped to 5
    });
  });
});

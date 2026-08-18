/**
 * __tests__/lib/pricing-engine.test.ts
 *
 * Exhaustive unit tests for the authoritative WeddingWithIndia Central Pricing Engine.
 * Tests exact master numbers across all 25 customer prices, 25 host payouts, 5 agent payouts,
 * default host calculator states, group calculations, and internal financial economics.
 */

import {
  CUSTOMER_PRICE_MATRIX_USD,
  HOST_PAYOUT_MATRIX_INR,
  AGENT_PAYOUT_MATRIX_INR,
  WeddingTier,
  WeddingDurationDays,
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
  calculateBookingPricing,
  calculateHostPotentialEarnings,
  calculateAgentPotentialEarnings,
  normalizeWeddingTier,
  normalizeDurationDays,
} from "@/lib/services/pricing-engine";

describe("WeddingWithIndia Central Pricing Engine — Master Verification", () => {
  const tiers: WeddingTier[] = ["STANDARD", "ENHANCED", "GRAND", "ROYAL", "SIGNATURE_ROYAL"];
  const durations: WeddingDurationDays[] = [1, 2, 3, 4, 5];

  describe("1. Customer Pricing Matrix (USD) — All 25 Permutations", () => {
    const expectedCustomerPrices: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
      STANDARD: { 1: 149, 2: 199, 3: 249, 4: 299, 5: 349 },
      ENHANCED: { 1: 179, 2: 249, 3: 299, 4: 349, 5: 399 },
      GRAND: { 1: 229, 2: 329, 3: 449, 4: 549, 5: 649 },
      ROYAL: { 1: 299, 2: 449, 3: 649, 4: 799, 5: 949 },
      SIGNATURE_ROYAL: { 1: 399, 2: 799, 3: 999, 4: 999, 5: 1199 },
    };

    tiers.forEach((tier) => {
      durations.forEach((days) => {
        it(`matches customer price for ${tier} ${days} Day(s) = $${expectedCustomerPrices[tier][days]}`, () => {
          const expected = expectedCustomerPrices[tier][days];
          expect(getCustomerPriceUSD(tier, days)).toBe(expected);
          expect(CUSTOMER_PRICE_MATRIX_USD[tier][days]).toBe(expected);
        });
      });
    });
  });

  describe("2. Fixed Host Payout Matrix (INR) — All 25 Permutations", () => {
    const expectedHostPayouts: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
      STANDARD: { 1: 5101, 2: 7101, 3: 9101, 4: 11101, 5: 13101 },
      ENHANCED: { 1: 7101, 2: 10101, 3: 13101, 4: 16101, 5: 19101 },
      GRAND: { 1: 10101, 2: 15101, 3: 20101, 4: 27101, 5: 32101 },
      ROYAL: { 1: 15101, 2: 22101, 3: 32101, 4: 41101, 5: 51101 },
      SIGNATURE_ROYAL: { 1: 20101, 2: 30101, 3: 41101, 4: 51101, 5: 61101 },
    };

    tiers.forEach((tier) => {
      durations.forEach((days) => {
        it(`matches fixed host payout for ${tier} ${days} Day(s) = ₹${expectedHostPayouts[tier][days].toLocaleString("en-IN")}`, () => {
          const expected = expectedHostPayouts[tier][days];
          expect(getHostPayoutPerGuestINR(tier, days)).toBe(expected);
          expect(HOST_PAYOUT_MATRIX_INR[tier][days]).toBe(expected);
        });
      });
    });
  });

  describe("3. Fixed Agent Payout Matrix (INR) — All 5 Tiers", () => {
    const expectedAgentPayouts: Record<WeddingTier, number> = {
      STANDARD: 511,
      ENHANCED: 1011,
      GRAND: 1511,
      ROYAL: 2011,
      SIGNATURE_ROYAL: 2511,
    };

    tiers.forEach((tier) => {
      it(`matches fixed agent payout for ${tier} = ₹${expectedAgentPayouts[tier].toLocaleString("en-IN")}`, () => {
        const expected = expectedAgentPayouts[tier];
        expect(getAgentPayoutPerGuestINR(tier)).toBe(expected);
        expect(AGENT_PAYOUT_MATRIX_INR[tier]).toBe(expected);
      });
    });
  });

  describe("4. Host Calculator Default & Edge Cases", () => {
    it("calculates default headline state: Signature Royal, 4 Days, 20 Guests = ₹10,22,020", () => {
      const calc = calculateHostPotentialEarnings("SIGNATURE_ROYAL", 4, 20);
      expect(calc.payoutPerGuestINR).toBe(51101);
      expect(calc.totalPotentialEarningsINR).toBe(1022020);
      expect(calc.formattedTotalINR).toBe("₹10,22,020");
    });

    it("calculates Signature Royal, 5 Days, 20 Guests = ₹12,22,020", () => {
      const calc = calculateHostPotentialEarnings("SIGNATURE_ROYAL", 5, 20);
      expect(calc.payoutPerGuestINR).toBe(61101);
      expect(calc.totalPotentialEarningsINR).toBe(1222020);
      expect(calc.formattedTotalINR).toBe("₹12,22,020");
    });

    it("calculates Signature Royal, 4 Days, 30 Guests = ₹15,33,030", () => {
      const calc = calculateHostPotentialEarnings("SIGNATURE_ROYAL", 4, 30);
      expect(calc.payoutPerGuestINR).toBe(51101);
      expect(calc.totalPotentialEarningsINR).toBe(1533030);
      expect(calc.formattedTotalINR).toBe("₹15,33,030");
    });

    it("calculates Standard, 1 Day, 10 Guests = ₹51,010", () => {
      const calc = calculateHostPotentialEarnings("STANDARD", 1, 10);
      expect(calc.payoutPerGuestINR).toBe(5101);
      expect(calc.totalPotentialEarningsINR).toBe(51010);
      expect(calc.formattedTotalINR).toBe("₹51,010");
    });
  });

  describe("5. Agent Calculator Potential Earnings", () => {
    it("calculates Signature Royal, 20 Guests = ₹50,220", () => {
      const calc = calculateAgentPotentialEarnings("SIGNATURE_ROYAL", 20);
      expect(calc.payoutPerGuestINR).toBe(2511);
      expect(calc.totalPotentialEarningsINR).toBe(50220);
      expect(calc.formattedTotalINR).toBe("₹50,220");
    });

    it("calculates Standard, 10 Guests = ₹5,110", () => {
      const calc = calculateAgentPotentialEarnings("STANDARD", 10);
      expect(calc.payoutPerGuestINR).toBe(511);
      expect(calc.totalPotentialEarningsINR).toBe(5110);
      expect(calc.formattedTotalINR).toBe("₹5,110");
    });
  });

  describe("6. Group Booking & Multi-Guest Calculations", () => {
    it("calculates 6 guests for Signature Royal 4 Days: 6 × $999 = $5,994", () => {
      const booking = calculateBookingPricing({
        tier: "SIGNATURE_ROYAL",
        durationDays: 4,
        guestCount: 6,
        isAgentAttributed: true,
      });

      expect(booking.customerPricePerGuestUSD).toBe(999);
      expect(booking.customerTotalAmountUSD).toBe(5994);
      expect(booking.totalHostPayoutINR).toBe(51101 * 6); // ₹3,06,606
      expect(booking.totalAgentPayoutINR).toBe(2511 * 6); // ₹15,066
    });

    it("calculates 1 guest for Standard 1 Day with zero agent attribution", () => {
      const booking = calculateBookingPricing({
        tier: "STANDARD",
        durationDays: 1,
        guestCount: 1,
        isAgentAttributed: false,
      });

      expect(booking.customerPricePerGuestUSD).toBe(149);
      expect(booking.customerTotalAmountUSD).toBe(149);
      expect(booking.totalHostPayoutINR).toBe(5101);
      expect(booking.totalAgentPayoutINR).toBe(0);
    });
  });

  describe("7. Internal Planning Economics & Contribution Margins", () => {
    it("verifies internal financial planning model for Signature Royal 4 Days (1 guest)", () => {
      const booking = calculateBookingPricing({
        tier: "SIGNATURE_ROYAL",
        durationDays: 4,
        guestCount: 1,
        isAgentAttributed: true,
      });

      const { economics } = booking;
      // customerAmount = $999
      // paypalFee = 999 * 0.044 + 0.30 = 43.956 + 0.30 = $44.26
      expect(economics.paypalFeeUSD).toBe(44.26);
      expect(economics.netCustomerUSD).toBe(999 - 44.26); // $954.74

      // netAfterPayPalINR = round((954.74 * 95.50) / 1.03) = round(91177.67 / 1.03) = 88522
      expect(economics.netAfterPayPalINR).toBe(88522);

      // reserveINR = round(88522 * 0.05) = 4426
      expect(economics.reserveINR).toBe(4426);

      // wwiContributionBeforeReserve = 88522 - 51101 (host) - 2511 (agent) = 34910
      expect(economics.wwiContributionBeforeReserveINR).toBe(34910);

      // wwiContributionAfterReserve = 34910 - 4426 = 30484
      expect(economics.wwiContributionAfterReserveINR).toBe(30484);

      // Gross INR equivalent = 999 * 95.50 = 95404.5 -> Margin % = (26484 / 95404.5) * 100 = 27.8%
      expect(economics.contributionMarginPercent).toBeGreaterThan(25);
    });
  });

  describe("8. Normalization & Sanitization Safety", () => {
    it("normalizes case and legacy names safely", () => {
      expect(normalizeWeddingTier("standard")).toBe("STANDARD");
      expect(normalizeWeddingTier("Budget")).toBe("STANDARD");
      expect(normalizeWeddingTier("Premium")).toBe("ENHANCED");
      expect(normalizeWeddingTier("VIP")).toBe("ROYAL");
      expect(normalizeWeddingTier("Signature-Royal")).toBe("SIGNATURE_ROYAL");
      expect(normalizeWeddingTier("INVALID")).toBe("STANDARD");
      expect(normalizeWeddingTier(null)).toBe("STANDARD");
    });

    it("normalizes duration numbers safely into 1-5 integer bounds", () => {
      expect(normalizeDurationDays(0)).toBe(1);
      expect(normalizeDurationDays(1)).toBe(1);
      expect(normalizeDurationDays("3")).toBe(3);
      expect(normalizeDurationDays(5)).toBe(5);
      expect(normalizeDurationDays(9)).toBe(5);
      expect(normalizeDurationDays(null)).toBe(1);
    });
  });
});

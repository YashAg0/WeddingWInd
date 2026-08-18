/**
 * WeddingWithIndia — Authoritative Centralized Pricing & Financial Economics Engine
 *
 * Single Source of Truth for:
 * 1. Customer Pricing Matrix (USD per international guest)
 * 2. Host Payout Matrix (Fixed INR per international guest)
 * 3. Agent Payout Matrix (Fixed INR per international guest)
 * 4. Internal Planning Economics (PayPal costs, 5% internal reserve, WWI Contribution)
 *
 * CRITICAL INVARIANTS:
 * - Pricing is 100% independent of religion or culture.
 * - Pricing is determined strictly by Tier, Duration (1-5 days), Ceremonies, and Experience Intensity.
 * - Customer price is never modified by host or agent.
 * - Hosts and agents receive guaranteed fixed INR payouts, never percentages.
 * - Customer price is clean; no customer-facing payment gateway surcharges.
 */

export type WeddingTier =
  | "STANDARD"
  | "ENHANCED"
  | "GRAND"
  | "ROYAL"
  | "SIGNATURE_ROYAL";

export type WeddingDurationDays = 1 | 2 | 3 | 4 | 5;

export interface WeddingTierInfo {
  tier: WeddingTier;
  label: string;
  tagline: string;
  description: string;
  defaultCeremoniesCount: number;
  experienceIntensity: "TRADITIONAL" | "IMMERSIVE" | "GRAND_ROYAL" | "ULTRA_LUXURY";
}

export const WEDDING_TIER_CONFIG: Record<WeddingTier, WeddingTierInfo> = {
  STANDARD: {
    tier: "STANDARD",
    label: "Standard",
    tagline: "Authentic Cultural Entry Experience",
    description: "Access to main celebration rituals, feasts, traditional styling, and digital cultural guide.",
    defaultCeremoniesCount: 2,
    experienceIntensity: "TRADITIONAL",
  },
  ENHANCED: {
    tier: "ENHANCED",
    label: "Enhanced",
    tagline: "Multi-Ceremony Hands-on Celebration",
    description: "Access to pre-wedding festivities (Haldi/Mehndi), bespoke henna artist, and bilingual coordinator.",
    defaultCeremoniesCount: 3,
    experienceIntensity: "IMMERSIVE",
  },
  GRAND: {
    tier: "GRAND",
    label: "Grand",
    tagline: "Lavish Multi-Day Cultural Immersion",
    description: "Complete ceremonial access, festive attire styling, curated culinary feasts, and dedicated guest liaison.",
    defaultCeremoniesCount: 4,
    experienceIntensity: "GRAND_ROYAL",
  },
  ROYAL: {
    tier: "ROYAL",
    label: "Royal",
    tagline: "Palatial Heritage Wedding Experience",
    description: "Palace/heritage venue access, family lounge entry, traditional royal procession, and luxury local transport.",
    defaultCeremoniesCount: 5,
    experienceIntensity: "ULTRA_LUXURY",
  },
  SIGNATURE_ROYAL: {
    tier: "SIGNATURE_ROYAL",
    label: "Signature Royal",
    tagline: "Bespoke Royal Family Hospitality",
    description: "All-inclusive royal multi-day celebration hosted directly by the family with VIP hospitality and master concierge.",
    defaultCeremoniesCount: 6,
    experienceIntensity: "ULTRA_LUXURY",
  },
};

/**
 * 1. Customer Price Matrix (USD per guest)
 */
export const CUSTOMER_PRICE_MATRIX_USD: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
  STANDARD: {
    1: 149,
    2: 199,
    3: 249,
    4: 299,
    5: 349,
  },
  ENHANCED: {
    1: 179,
    2: 249,
    3: 299,
    4: 349,
    5: 399,
  },
  GRAND: {
    1: 229,
    2: 329,
    3: 449,
    4: 549,
    5: 649,
  },
  ROYAL: {
    1: 299,
    2: 449,
    3: 649,
    4: 799,
    5: 949,
  },
  SIGNATURE_ROYAL: {
    1: 399,
    2: 799,
    3: 999,
    4: 999,
    5: 1199,
  },
};

/**
 * 2. Fixed Host Payout Matrix (INR per eligible international guest)
 */
export const HOST_PAYOUT_MATRIX_INR: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
  STANDARD: {
    1: 5101,
    2: 7101,
    3: 9101,
    4: 11101,
    5: 13101,
  },
  ENHANCED: {
    1: 7101,
    2: 10101,
    3: 13101,
    4: 16101,
    5: 19101,
  },
  GRAND: {
    1: 10101,
    2: 15101,
    3: 20101,
    4: 27101,
    5: 32101,
  },
  ROYAL: {
    1: 15101,
    2: 22101,
    3: 32101,
    4: 41101,
    5: 51101,
  },
  SIGNATURE_ROYAL: {
    1: 20101,
    2: 30101,
    3: 41101,
    4: 51101,
    5: 61101,
  },
};

/**
 * 3. Fixed Agent Payout Matrix (INR per eligible international guest)
 */
export const AGENT_PAYOUT_MATRIX_INR: Record<WeddingTier, number> = {
  STANDARD: 511,
  ENHANCED: 1011,
  GRAND: 1511,
  ROYAL: 2011,
  SIGNATURE_ROYAL: 2511,
};

/**
 * Internal Financial Model Constants
 */
export const FINANCIAL_PLANNING_CONSTANTS = {
  PLANNING_FX_USD_INR: 95.50,
  PAYPAL_FEE_PERCENT: 0.044, // 4.40%
  PAYPAL_FIXED_FEE_USD: 0.30, // $0.30
  PAYPAL_FX_SPREAD_DIVISOR: 1.03, // 3.00% conversion spread
  INTERNAL_RESERVE_PERCENT: 0.05, // 5% internal reserve
  PRICING_VERSION: "v2026.1",
} as const;

/**
 * Normalizes input tier safely
 */
export function normalizeWeddingTier(tier?: string | null): WeddingTier {
  if (!tier) return "STANDARD";
  const upper = tier.toUpperCase().trim().replace(/[\s-]+/g, "_");
  if (upper in CUSTOMER_PRICE_MATRIX_USD) {
    return upper as WeddingTier;
  }
  if (upper === "BUDGET") return "STANDARD";
  if (upper === "PREMIUM") return "ENHANCED";
  if (upper === "VIP") return "ROYAL";
  return "STANDARD";
}

/**
 * Normalizes duration safely to integer between 1 and 5
 */
export function normalizeDurationDays(days?: number | string | null): WeddingDurationDays {
  const num = typeof days === "string" ? parseInt(days, 10) : Number(days);
  if (isNaN(num) || num <= 1) return 1;
  if (num === 2) return 2;
  if (num === 3) return 3;
  if (num === 4) return 4;
  return 5;
}

/**
 * Retrieves the authoritative customer price in USD per guest.
 */
export function getCustomerPriceUSD(tier: WeddingTier, durationDays: WeddingDurationDays): number {
  const validTier = normalizeWeddingTier(tier);
  const validDays = normalizeDurationDays(durationDays);
  return CUSTOMER_PRICE_MATRIX_USD[validTier][validDays];
}

/**
 * Retrieves the authoritative fixed host payout in INR per guest.
 */
export function getHostPayoutPerGuestINR(tier: WeddingTier, durationDays: WeddingDurationDays): number {
  const validTier = normalizeWeddingTier(tier);
  const validDays = normalizeDurationDays(durationDays);
  return HOST_PAYOUT_MATRIX_INR[validTier][validDays];
}

/**
 * Retrieves the authoritative fixed agent payout in INR per guest.
 */
export function getAgentPayoutPerGuestINR(tier: WeddingTier): number {
  const validTier = normalizeWeddingTier(tier);
  return AGENT_PAYOUT_MATRIX_INR[validTier];
}

export interface BookingFinancialSnapshot {
  tier: WeddingTier;
  tierLabel: string;
  durationDays: WeddingDurationDays;
  customerPricePerGuestUSD: number;
  guestCount: number;
  eligibleInternationalGuestCount: number;
  baseCustomerAmountUSD: number;
  customerTotalAmountUSD: number;
  hostPayoutPerGuestINR: number;
  totalHostPayoutINR: number;
  agentPayoutPerGuestINR: number;
  totalAgentPayoutINR: number;
  pricingVersion: string;
  // Internal Financial Economics (for server/admin analytics only)
  economics: {
    planningFxRate: number;
    paypalFeeUSD: number;
    netCustomerUSD: number;
    netAfterPayPalINR: number;
    reserveINR: number;
    wwiContributionBeforeReserveINR: number;
    wwiContributionAfterReserveINR: number;
    contributionMarginPercent: number;
  };
}

/**
 * Authoritative Server-Side Calculation for a Booking
 */
export function calculateBookingPricing(params: {
  tier: string | WeddingTier;
  durationDays: number | WeddingDurationDays;
  guestCount: number;
  isAgentAttributed?: boolean;
}): BookingFinancialSnapshot {
  const tier = normalizeWeddingTier(params.tier);
  const durationDays = normalizeDurationDays(params.durationDays);
  const guestCount = Math.max(1, Math.floor(params.guestCount || 1));
  const eligibleGuests = guestCount; // In WWI MVP, all booked international travelers are eligible guests

  const customerPricePerGuestUSD = getCustomerPriceUSD(tier, durationDays);
  const baseCustomerAmountUSD = customerPricePerGuestUSD * guestCount;
  const customerTotalAmountUSD = baseCustomerAmountUSD; // Clean price, zero customer surcharge

  const hostPayoutPerGuestINR = getHostPayoutPerGuestINR(tier, durationDays);
  const totalHostPayoutINR = hostPayoutPerGuestINR * eligibleGuests;

  const agentPayoutPerGuestINR = params.isAgentAttributed ? getAgentPayoutPerGuestINR(tier) : 0;
  const totalAgentPayoutINR = agentPayoutPerGuestINR * eligibleGuests;

  // Internal Planning Economics
  const {
    PLANNING_FX_USD_INR,
    PAYPAL_FEE_PERCENT,
    PAYPAL_FIXED_FEE_USD,
    PAYPAL_FX_SPREAD_DIVISOR,
    INTERNAL_RESERVE_PERCENT,
    PRICING_VERSION,
  } = FINANCIAL_PLANNING_CONSTANTS;

  const paypalFeeUSD = Number((customerTotalAmountUSD * PAYPAL_FEE_PERCENT + PAYPAL_FIXED_FEE_USD).toFixed(2));
  const netCustomerUSD = Math.max(0, customerTotalAmountUSD - paypalFeeUSD);
  const netAfterPayPalINR = Math.round((netCustomerUSD * PLANNING_FX_USD_INR) / PAYPAL_FX_SPREAD_DIVISOR);

  const reserveINR = Math.round(netAfterPayPalINR * INTERNAL_RESERVE_PERCENT);
  const wwiContributionBeforeReserveINR = netAfterPayPalINR - totalHostPayoutINR - totalAgentPayoutINR;
  const wwiContributionAfterReserveINR = wwiContributionBeforeReserveINR - reserveINR;

  const grossInrEquivalent = customerTotalAmountUSD * PLANNING_FX_USD_INR;
  const contributionMarginPercent = grossInrEquivalent > 0
    ? Number(((wwiContributionAfterReserveINR / grossInrEquivalent) * 100).toFixed(1))
    : 0;

  return {
    tier,
    tierLabel: WEDDING_TIER_CONFIG[tier].label,
    durationDays,
    customerPricePerGuestUSD,
    guestCount,
    eligibleInternationalGuestCount: eligibleGuests,
    baseCustomerAmountUSD,
    customerTotalAmountUSD,
    hostPayoutPerGuestINR,
    totalHostPayoutINR,
    agentPayoutPerGuestINR,
    totalAgentPayoutINR,
    pricingVersion: PRICING_VERSION,
    economics: {
      planningFxRate: PLANNING_FX_USD_INR,
      paypalFeeUSD,
      netCustomerUSD,
      netAfterPayPalINR,
      reserveINR,
      wwiContributionBeforeReserveINR,
      wwiContributionAfterReserveINR,
      contributionMarginPercent,
    },
  };
}

/**
 * Calculates Potential Host Earnings for Host Acquisition & Calculator UI
 */
export function calculateHostPotentialEarnings(
  tier: WeddingTier | string,
  durationDays: WeddingDurationDays | number,
  internationalGuestCount: number
): {
  tier: WeddingTier;
  tierLabel: string;
  durationDays: WeddingDurationDays;
  internationalGuestCount: number;
  payoutPerGuestINR: number;
  totalPotentialEarningsINR: number;
  formattedTotalINR: string;
  formattedPerGuestINR: string;
} {
  const validTier = normalizeWeddingTier(tier);
  const validDays = normalizeDurationDays(durationDays);
  const guests = Math.max(1, Math.min(100, Math.floor(internationalGuestCount || 1)));

  const payoutPerGuestINR = getHostPayoutPerGuestINR(validTier, validDays);
  const totalPotentialEarningsINR = payoutPerGuestINR * guests;

  return {
    tier: validTier,
    tierLabel: WEDDING_TIER_CONFIG[validTier].label,
    durationDays: validDays,
    internationalGuestCount: guests,
    payoutPerGuestINR,
    totalPotentialEarningsINR,
    formattedTotalINR: `₹${totalPotentialEarningsINR.toLocaleString("en-IN")}`,
    formattedPerGuestINR: `₹${payoutPerGuestINR.toLocaleString("en-IN")}`,
  };
}

/**
 * Calculates Potential Agent Earnings for Partner Portal UI
 */
export function calculateAgentPotentialEarnings(
  tier: WeddingTier | string,
  guestCount: number
): {
  tier: WeddingTier;
  tierLabel: string;
  guestCount: number;
  payoutPerGuestINR: number;
  totalPotentialEarningsINR: number;
  formattedTotalINR: string;
  formattedPerGuestINR: string;
} {
  const validTier = normalizeWeddingTier(tier);
  const guests = Math.max(1, Math.floor(guestCount || 1));

  const payoutPerGuestINR = getAgentPayoutPerGuestINR(validTier);
  const totalPotentialEarningsINR = payoutPerGuestINR * guests;

  return {
    tier: validTier,
    tierLabel: WEDDING_TIER_CONFIG[validTier].label,
    guestCount: guests,
    payoutPerGuestINR,
    totalPotentialEarningsINR,
    formattedTotalINR: `₹${totalPotentialEarningsINR.toLocaleString("en-IN")}`,
    formattedPerGuestINR: `₹${payoutPerGuestINR.toLocaleString("en-IN")}`,
  };
}

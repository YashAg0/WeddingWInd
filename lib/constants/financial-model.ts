/**
 * WeddingWithIndia — Financial Model & Business Constants
 * Integrates with and re-exports from the authoritative Central Pricing Engine (lib/services/pricing-engine.ts).
 */

import {
  WeddingTier,
  WeddingDurationDays,
  WEDDING_TIER_CONFIG,
  CUSTOMER_PRICE_MATRIX_USD,
  HOST_PAYOUT_MATRIX_INR,
  AGENT_PAYOUT_MATRIX_INR,
  FINANCIAL_PLANNING_CONSTANTS,
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
  calculateBookingPricing,
  calculateHostPotentialEarnings,
  calculateAgentPotentialEarnings,
} from "@/lib/services/pricing-engine";

export {
  WEDDING_TIER_CONFIG,
  CUSTOMER_PRICE_MATRIX_USD,
  HOST_PAYOUT_MATRIX_INR,
  AGENT_PAYOUT_MATRIX_INR,
  FINANCIAL_PLANNING_CONSTANTS,
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
  calculateBookingPricing,
  calculateHostPotentialEarnings,
  calculateAgentPotentialEarnings,
};
export type { WeddingTier, WeddingDurationDays };

export const FX_RATES = {
  USD: FINANCIAL_PLANNING_CONSTANTS.PLANNING_FX_USD_INR,
  EUR: 108.00,
} as const;

export interface PricingTier {
  id: string;
  name: string;
  tier: WeddingTier;
  priceINR: number;
  priceUSD: number;
  priceEUR: number;
  bookingMixPercent: number;
  description: string;
  features: string[];
  popular?: boolean;
}

/**
 * Modern 5-Tier Specification mapped to 3-day baseline for display references
 */
export const PRICING_TIERS: Record<WeddingTier, PricingTier> = {
  STANDARD: {
    id: "standard",
    name: "Standard",
    tier: "STANDARD",
    priceINR: HOST_PAYOUT_MATRIX_INR.STANDARD[3], // ₹9,101 (3-day host baseline)
    priceUSD: CUSTOMER_PRICE_MATRIX_USD.STANDARD[3], // $249
    priceEUR: Number((CUSTOMER_PRICE_MATRIX_USD.STANDARD[3] * 0.92).toFixed(2)),
    bookingMixPercent: 20,
    description: "Authentic entry experience into genuine Indian wedding rituals and feasts.",
    features: [
      "Full access to main wedding ceremony & celebratory feast",
      "Traditional welcome greeting & ceremonial dupatta/turban styling",
      "Digital cultural etiquette handbook & preparation guide",
      "Dedicated venue guest liaison support"
    ]
  },
  ENHANCED: {
    id: "enhanced",
    name: "Enhanced",
    tier: "ENHANCED",
    priceINR: HOST_PAYOUT_MATRIX_INR.ENHANCED[3], // ₹13,101
    priceUSD: CUSTOMER_PRICE_MATRIX_USD.ENHANCED[3], // $299
    priceEUR: Number((CUSTOMER_PRICE_MATRIX_USD.ENHANCED[3] * 0.92).toFixed(2)),
    bookingMixPercent: 35,
    popular: true,
    description: "Multi-event access with hands-on Haldi & Mehndi pre-wedding festivities.",
    features: [
      "Access to Mehndi / Haldi festivities + Main Wedding",
      "Professional Henna artist styling session included",
      "Traditional attire rental coordination",
      "All ceremonial feasts & refreshments included",
      "Personal bilingual local coordinator support"
    ]
  },
  GRAND: {
    id: "grand",
    name: "Grand",
    tier: "GRAND",
    priceINR: HOST_PAYOUT_MATRIX_INR.GRAND[3], // ₹20,101
    priceUSD: CUSTOMER_PRICE_MATRIX_USD.GRAND[3], // $449
    priceEUR: Number((CUSTOMER_PRICE_MATRIX_USD.GRAND[3] * 0.92).toFixed(2)),
    bookingMixPercent: 25,
    description: "Complete ceremonial immersion with festive attire styling and curated feasts.",
    features: [
      "Complete multi-day wedding and pre-wedding ceremonial access",
      "Festive attire styling and photography assistance",
      "Curated multi-course culinary banquets",
      "Dedicated guest liaison throughout the celebrations"
    ]
  },
  ROYAL: {
    id: "royal",
    name: "Royal",
    tier: "ROYAL",
    priceINR: HOST_PAYOUT_MATRIX_INR.ROYAL[3], // ₹32,101
    priceUSD: CUSTOMER_PRICE_MATRIX_USD.ROYAL[3], // $649
    priceEUR: Number((CUSTOMER_PRICE_MATRIX_USD.ROYAL[3] * 0.92).toFixed(2)),
    bookingMixPercent: 15,
    description: "Palatial heritage celebration with family lounge access and royal procession.",
    features: [
      "Palace / heritage venue access with family lounge entry",
      "Traditional royal Baraat procession participation",
      "Bespoke festive designer attire rental",
      "Private luxury local transportation in wedding city"
    ]
  },
  SIGNATURE_ROYAL: {
    id: "signature_royal",
    name: "Signature Royal",
    tier: "SIGNATURE_ROYAL",
    priceINR: HOST_PAYOUT_MATRIX_INR.SIGNATURE_ROYAL[4], // ₹51,101 (4-day default baseline)
    priceUSD: CUSTOMER_PRICE_MATRIX_USD.SIGNATURE_ROYAL[4], // $999
    priceEUR: Number((CUSTOMER_PRICE_MATRIX_USD.SIGNATURE_ROYAL[4] * 0.92).toFixed(2)),
    bookingMixPercent: 5,
    description: "Bespoke royal family hospitality with master concierge and exclusive invitations.",
    features: [
      "All-inclusive multi-day celebration hosted directly by the family",
      "Master concierge & personal VIP cultural liaison",
      "Exclusive post-wedding intimate family celebration invitation",
      "Luxury airport and venue transfers throughout"
    ]
  },
};

export const COORDINATOR_MODEL = {
  COMPENSATION_LABEL: "Paid per event day — rate confirmed during onboarding",
  PREFERRED_QUALIFICATION: "Experience managing college events, fests, or student activities preferred",
  DEPLOYMENT_NOTE: "Activated in cities with active wedding booking density",
};

/**
 * Formats currency adhering strictly to authoritative currency conventions
 */
export function formatCurrencyINR(amountINR: number): string {
  return `₹${Math.round(amountINR).toLocaleString("en-IN")}`;
}

export function formatCurrencyUSD(amountUSD: number): string {
  return `$${Math.round(amountUSD).toLocaleString("en-US")}`;
}

export function formatSecondaryCurrency(amountINR: number): string {
  const usd = amountINR / FX_RATES.USD;
  return `~$${Math.round(usd).toLocaleString("en-US")} USD`;
}

/**
 * Backward compatibility constants & calculators mapped to authoritative engine
 */
export const COMMISSION_MODEL = {
  PLATFORM_COMMISSION_PERCENT: 22,
  HOST_ALLOCATION_PERCENT: 78,
  AGENT_REFERRAL_PAYOUT_DEFAULT: 1000,
  HOST_REFERRAL_COMMISSION_PERCENT: 4,
} as const;

export const WEIGHTED_AVERAGE_BOOKING = {
  priceINR: 15500,
  priceUSD: 165,
} as const;

export const INVESTOR_PROJECTIONS = {
  YEAR_1: { weddings: 50, guests: 200, gmvINR: 3100000 },
  YEAR_2: { weddings: 250, guests: 1250, gmvINR: 19375000 },
  YEAR_3: { weddings: 1000, guests: 6000, gmvINR: 93000000 },
} as const;

export function calculateBookingFinancials(params: {
  pricePerGuestINR?: number;
  guestsCount?: number;
  tier?: WeddingTier;
  durationDays?: WeddingDurationDays;
}) {
  const t = params.tier || "STANDARD";
  const d = params.durationDays || 3;
  const g = params.guestsCount || 1;
  const pricing = calculateBookingPricing({ tier: t, durationDays: d, guestCount: g });

  return {
    customerTotalUSD: pricing.customerTotalAmountUSD,
    hostTotalINR: pricing.totalHostPayoutINR,
    agentTotalINR: pricing.totalAgentPayoutINR,
    tier: pricing.tier,
    durationDays: pricing.durationDays,
  };
}

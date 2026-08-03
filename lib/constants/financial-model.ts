/**
 * WeddingWithIndia - Locked Financial Model & Business Constants
 * Primary Currency: INR (USD & EUR for secondary display)
 * FX Conversion Rates: USD 1 = ₹95.50, EUR 1 = ₹108.00
 */

export const FX_RATES = {
  USD: 95.50,
  EUR: 108.00,
} as const;

export interface PricingTier {
  id: string;
  name: string;
  priceINR: number;
  priceUSD: number;
  priceEUR: number;
  bookingMixPercent: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  CULTURAL_GUEST: {
    id: "cultural-guest",
    name: "Cultural Guest",
    priceINR: 7499,
    priceUSD: 78.52,
    priceEUR: 69.44,
    bookingMixPercent: 20,
    description: "Entry experience into an authentic Indian wedding celebration.",
    features: [
      "Access to main wedding ceremony & reception",
      "Traditional welcome greeting & turban/dupatta styling",
      "Full access to wedding feast & non-alcoholic beverages",
      "Digital cultural guide & etiquette handbook",
      "Dedicated venue host assistance"
    ]
  },
  CELEBRATION_EXPERIENCE: {
    id: "celebration-experience",
    name: "Celebration Experience",
    priceINR: 11999,
    priceUSD: 125.64,
    priceEUR: 111.10,
    bookingMixPercent: 45,
    description: "Multi-event access with hands-on pre-wedding festivities.",
    popular: true,
    features: [
      "2-day access: Mehndi/Haldi ceremony + Main Wedding",
      "Professional Henna/Mehndi artist session included",
      "Traditional attire rental coordination",
      "All ceremonial meals & refreshments included",
      "Personal bilingual local coordinator support"
    ]
  },
  IMMERSIVE_WEDDING: {
    id: "immersive-wedding-experience",
    name: "Immersive Wedding Experience",
    priceINR: 17999,
    priceUSD: 188.47,
    priceEUR: 166.66,
    bookingMixPercent: 30,
    description: "Full 3-day complete wedding celebration with family events.",
    features: [
      "Full 3-day pass: Mehndi, Sangeet & Baraat Wedding Ceremony",
      "VIP seating at Sangeet & ceremony rituals",
      "Custom fitted traditional Indian outfit rental",
      "Local hotel transfers on event days",
      "Private pre-ceremony ritual briefing by cultural expert"
    ]
  },
  PREMIUM_HOSTED: {
    id: "premium-hosted-experience",
    name: "Premium Hosted Experience",
    priceINR: 29999,
    priceUSD: 314.13,
    priceEUR: 277.77,
    bookingMixPercent: 5,
    description: "All-inclusive royal experience hosted directly by the family.",
    features: [
      "Complete multi-day wedding access with family lounge entry",
      "Bespoke designer attire rental & professional styling",
      "Dedicated 24/7 personal liaison & translator",
      "Private luxury transportation throughout the wedding city",
      "Exclusive post-wedding family dinner invitation"
    ]
  }
};

export const WEIGHTED_AVERAGE_BOOKING = {
  priceINR: 13799,
  priceUSD: 144.49,
  priceEUR: 127.77
};

export const COMMISSION_MODEL = {
  PLATFORM_COMMISSION_PERCENT: 28,
  HOST_ALLOCATION_PERCENT: 72,
  AGENT_REFERRAL_COMMISSION_PERCENT: 7,
  HOST_REFERRAL_COMMISSION_PERCENT: 4,
  ADDON_ATTACHMENT_RATE_PERCENT: 40,
  ADDON_AVERAGE_VALUE_INR: 2200,
  ADDON_PLATFORM_COMMISSION_PERCENT: 20,
  AFFILIATE_INCOME_PER_BOOKING_INR: 110,
  VENDOR_ANNUAL_FEE_INR: 12000,
  AGENT_BOOKING_MIX_PERCENT: 35,
};

export const COORDINATOR_MODEL = {
  COMPENSATION_LABEL: "Paid per event day — rate confirmed during onboarding",
  PREFERRED_QUALIFICATION: "Experience managing college events, fests, or student activities preferred",
  DEPLOYMENT_NOTE: "Activated in cities with active wedding booking density",
};

export const INVESTOR_PROJECTIONS = {
  YEAR_1_BOOKINGS: 180,
  BREAK_EVEN_ANNUAL: 162,
  BREAK_EVEN_MONTHLY: 14,
  FIVE_YEAR_BOOKINGS_TRAJECTORY: [180, 600, 1500, 3000, 5200],
  FIVE_YEAR_TOTAL_REVENUE_INR_LABEL: "₹76.11M",
  FIVE_YEAR_PAT_INR_LABEL: "₹26.62M"
};

/**
 * Format currency utility adhering strictly to FX conversion rates
 */
export function formatCurrencyINR(amountINR: number): string {
  return `₹${amountINR.toLocaleString("en-IN")}`;
}

export function formatSecondaryCurrency(amountINR: number): string {
  const usd = (amountINR / FX_RATES.USD).toFixed(2);
  const eur = (amountINR / FX_RATES.EUR).toFixed(2);
  return `$${usd} / €${eur}`;
}

export interface FinancialBreakdown {
  coreValueINR: number;
  platformShare28INR: number;
  hostShare72INR: number;
  agentReferral7INR: number;
  hostReferral4INR: number;
  exactAgentReferral7INR: number;
  exactPlatformShare28INR: number;
  exactHostShare72INR: number;
}

export function calculateBookingFinancials(
  coreValueINR: number,
  isAgentAttributed: boolean = false,
  isHostReferralAttributed: boolean = false
): FinancialBreakdown {
  const platformShare28INR = Math.round((coreValueINR * COMMISSION_MODEL.PLATFORM_COMMISSION_PERCENT) / 100);
  const hostShare72INR = Math.round((coreValueINR * COMMISSION_MODEL.HOST_ALLOCATION_PERCENT) / 100);
  const agentReferral7INR = isAgentAttributed ? Math.round((coreValueINR * COMMISSION_MODEL.AGENT_REFERRAL_COMMISSION_PERCENT) / 100) : 0;
  const hostReferral4INR = isHostReferralAttributed ? Math.round((coreValueINR * COMMISSION_MODEL.HOST_REFERRAL_COMMISSION_PERCENT) / 100) : 0;

  return {
    coreValueINR,
    platformShare28INR,
    hostShare72INR,
    agentReferral7INR,
    hostReferral4INR,
    exactAgentReferral7INR: Number((coreValueINR * 0.07).toFixed(2)),
    exactPlatformShare28INR: Number((coreValueINR * 0.28).toFixed(2)),
    exactHostShare72INR: Number((coreValueINR * 0.72).toFixed(2)),
  };
}

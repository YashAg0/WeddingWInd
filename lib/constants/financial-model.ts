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
  BUDGET: {
    id: "budget",
    name: "Budget",
    priceINR: 9000,
    priceUSD: 94.24,
    priceEUR: 83.33,
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
  PREMIUM: {
    id: "premium",
    name: "Premium",
    priceINR: 16000,
    priceUSD: 167.54,
    priceEUR: 148.15,
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
  VIP: {
    id: "vip",
    name: "VIP",
    priceINR: 30000,
    priceUSD: 314.14,
    priceEUR: 277.78,
    bookingMixPercent: 35,
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
  priceINR: 15500,
  priceUSD: 162.30,
  priceEUR: 143.52
};

export const COMMISSION_MODEL = {
  PLATFORM_COMMISSION_PERCENT: 22,
  HOST_ALLOCATION_PERCENT: 78,
  AGENT_REFERRAL_PAYOUT_BUDGET: 500,
  AGENT_REFERRAL_PAYOUT_PREMIUM: 900,
  AGENT_REFERRAL_PAYOUT_VIP: 1800,
  AGENT_REFERRAL_PAYOUT_DEFAULT: 1000,
  HOST_REFERRAL_COMMISSION_PERCENT: 4,
  ADDON_ATTACHMENT_RATE_PERCENT: 40,
  ADDON_AVERAGE_VALUE_INR: 2000,
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
  YEAR_1_BOOKINGS: 50,
  BREAK_EVEN_ANNUAL: 162,
  BREAK_EVEN_MONTHLY: 14,
  FIVE_YEAR_BOOKINGS_TRAJECTORY: [50, 300, 700, 3000, 5200],
  FIVE_YEAR_TOTAL_REVENUE_INR_LABEL: "₹5.2 Crore",
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
  platformShare22INR: number;
  hostShare78INR: number;
  agentReferralINR: number;
  hostReferral4INR: number;
  exactAgentReferralINR: number;
  exactPlatformShare22INR: number;
  exactHostShare78INR: number;
}

export function calculateBookingFinancials(
  coreValueINR: number,
  isAgentAttributed: boolean = false,
  isHostReferralAttributed: boolean = false
): FinancialBreakdown {
  const platformShare22INR = Math.round((coreValueINR * COMMISSION_MODEL.PLATFORM_COMMISSION_PERCENT) / 100);
  const hostShare78INR = coreValueINR - platformShare22INR;
  
  let agentReferralINR = 0;
  if (isAgentAttributed) {
    if (coreValueINR <= 9000) {
      agentReferralINR = COMMISSION_MODEL.AGENT_REFERRAL_PAYOUT_BUDGET;
    } else if (coreValueINR <= 16000) {
      agentReferralINR = COMMISSION_MODEL.AGENT_REFERRAL_PAYOUT_PREMIUM;
    } else if (coreValueINR >= 30000) {
      agentReferralINR = COMMISSION_MODEL.AGENT_REFERRAL_PAYOUT_VIP;
    } else {
      agentReferralINR = COMMISSION_MODEL.AGENT_REFERRAL_PAYOUT_DEFAULT;
    }
  }

  const hostReferral4INR = isHostReferralAttributed ? Math.round((coreValueINR * COMMISSION_MODEL.HOST_REFERRAL_COMMISSION_PERCENT) / 100) : 0;

  return {
    coreValueINR,
    platformShare22INR,
    hostShare78INR,
    agentReferralINR,
    hostReferral4INR,
    exactAgentReferralINR: agentReferralINR,
    exactPlatformShare22INR: Number((coreValueINR * 0.22).toFixed(2)),
    exactHostShare78INR: Number((coreValueINR * 0.78).toFixed(2)),
  };
}

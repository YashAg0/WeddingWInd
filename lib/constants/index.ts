import { BUSINESS_METRICS } from "./business-metrics";
import {
  FX_RATES,
  PRICING_TIERS,
  WEIGHTED_AVERAGE_BOOKING,
  COMMISSION_MODEL,
  COORDINATOR_MODEL,
  INVESTOR_PROJECTIONS,
  formatCurrencyINR,
  formatSecondaryCurrency
} from "./financial-model";

import { LEGAL_CONFIG } from "./legal";

export {
  BUSINESS_METRICS,
  FX_RATES,
  PRICING_TIERS,
  WEIGHTED_AVERAGE_BOOKING,
  COMMISSION_MODEL,
  COORDINATOR_MODEL,
  INVESTOR_PROJECTIONS,
  formatCurrencyINR,
  formatSecondaryCurrency,
  LEGAL_CONFIG,
};

export const SYSTEM_ROLE_PERMISSIONS = {
  TRAVELER: ["booking:create", "booking:read", "wishlist:manage", "review:write"],
  COUPLE: ["wedding:create", "wedding:edit", "booking:approve", "booking:decline"],
  AGENT: ["referral:read", "commission:read"],
  ADMIN: ["*"]
};

export const PRICING_CONSTANTS = {
  MIN_PRICE_USD: BUSINESS_METRICS.MIN_PRICE_USD, // $149
  MAX_PRICE_USD: BUSINESS_METRICS.MAX_PRICE_USD, // $1,199
  MIN_PRICE: 149,
  MAX_PRICE: 1199,
  DEFAULT_CURRENCY: "USD",
  DEFAULT_PAYOUT_CURRENCY: "INR",
};

export const COMMISSION_CONSTANTS = {
  AGENT_REFERRAL_AVERAGE_INR: 1511, // Grand tier baseline
  HOST_REFERRAL_PERCENT: 4,
};

export const PAGINATION_CONSTANTS = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50
};

export const SUPPORTED_TRADITIONS = [
  "Hindu Vedic Pheras",
  "Sikh Anand Karaj",
  "Muslim Nikah",
  "Christian Holy Matrimony",
  "Parsi Lagan",
  "Jain Wedding Rituals",
  "South Indian Mangal Phera",
  "Bengali Subho Drishti"
];

export const APP_COUNTRY_CODES = [
  { name: "India", code: "IN" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" }
];

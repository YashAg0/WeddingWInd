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

export {
  BUSINESS_METRICS,
  FX_RATES,
  PRICING_TIERS,
  WEIGHTED_AVERAGE_BOOKING,
  COMMISSION_MODEL,
  COORDINATOR_MODEL,
  INVESTOR_PROJECTIONS,
  formatCurrencyINR,
  formatSecondaryCurrency
};

export const SYSTEM_ROLE_PERMISSIONS = {
  TRAVELER: ["booking:create", "booking:read", "wishlist:manage", "review:write"],
  COUPLE: ["wedding:create", "wedding:edit", "booking:approve", "booking:decline"],
  AGENT: ["referral:read", "commission:read"],
  ADMIN: ["*"]
};

export const PRICING_CONSTANTS = {
  MIN_PRICE: BUSINESS_METRICS.MIN_PRICE, // ₹7,499
  MAX_PRICE: BUSINESS_METRICS.MAX_PRICE, // ₹29,999
  DEFAULT_CURRENCY: BUSINESS_METRICS.DEFAULT_CURRENCY, // INR
  PLATFORM_FEES_PERCENT: BUSINESS_METRICS.PLATFORM_FEE_PERCENT, // 28%
  HOST_ALLOCATION_PERCENT: BUSINESS_METRICS.HOST_ALLOCATION_PERCENT // 72%
};

export const COMMISSION_CONSTANTS = {
  AGENT_REFERRAL_PERCENT: BUSINESS_METRICS.AGENT_COMMISSION_PERCENT, // 7%
  HOST_REFERRAL_PERCENT: BUSINESS_METRICS.HOST_REFERRAL_PERCENT // 4%
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

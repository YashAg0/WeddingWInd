import { BUSINESS_METRICS } from "./business-metrics";

export { BUSINESS_METRICS };

export const SYSTEM_ROLE_PERMISSIONS = {
  TRAVELER: ["booking:create", "booking:read", "wishlist:manage", "review:write"],
  COUPLE: ["wedding:create", "wedding:edit", "booking:approve", "booking:decline"],
  AGENT: ["referral:read", "commission:read"],
  ADMIN: ["*"]
};

export const PRICING_CONSTANTS = {
  MIN_PRICE: BUSINESS_METRICS.MIN_PRICE,
  MAX_PRICE: BUSINESS_METRICS.MAX_PRICE,
  DEFAULT_CURRENCY: BUSINESS_METRICS.DEFAULT_CURRENCY,
  PLATFORM_FEES_PERCENT: BUSINESS_METRICS.PLATFORM_FEE_PERCENT // 15% platform host fee
};

export const COMMISSION_CONSTANTS = {
  AGENT_REFERRAL_PERCENT: BUSINESS_METRICS.AGENT_COMMISSION_PERCENT // 5% payout to referring travel agents
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

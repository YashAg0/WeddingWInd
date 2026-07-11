/**
 * Global system constants for Wedding With India backend.
 */

export const SYSTEM_ROLE_PERMISSIONS = {
  TRAVELER: ["booking:create", "booking:read", "wishlist:manage", "review:write"],
  COUPLE: ["wedding:create", "wedding:edit", "booking:approve", "booking:decline"],
  AGENT: ["referral:read", "commission:read"],
  ADMIN: ["*"]
};

export const PRICING_CONSTANTS = {
  MIN_PRICE: 100,
  MAX_PRICE: 20000,
  DEFAULT_CURRENCY: "USD",
  PLATFORM_FEES_PERCENT: 15.0 // 15% platform host fee
};

export const COMMISSION_CONSTANTS = {
  AGENT_REFERRAL_PERCENT: 5.0 // 5% payout to referring travel agents
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

/**
 * WeddingWithIndia - Centralized Single Source of Truth for Business Metrics & Key Performance Indicators.
 * All metrics across marketing pages, headers, footers, dashboards, and metadata MUST be imported from here.
 */

import { PRICING_TIERS } from "./financial-model";

export const BUSINESS_METRICS = {
  WEDDINGS_HOSTED: "Awaiting first verified celebration",
  WEDDINGS_HOSTED_NUM: 0,
  GLOBAL_GUESTS: "Awaiting first verified guest",
  GLOBAL_GUESTS_NUM: 0,
  COUNTRIES_REPRESENTED: "Awaiting launch",
  COUNTRIES_REPRESENTED_NUM: 0,
  AVERAGE_RATING: "No verified reviews yet",
  AVERAGE_RATING_NUM: 0,
  AVERAGE_RATING_LABEL: "Awaiting reviews",
  SATISFACTION_RATE: "Awaiting launch",
  SATISFACTION_RATE_NUM: 0,
  DEFAULT_CUSTOMER_CURRENCY: "USD",
  DEFAULT_PAYOUT_CURRENCY: "INR",
  MIN_PRICE_USD: PRICING_TIERS.STANDARD.priceUSD, // $149
  MAX_PRICE_USD: PRICING_TIERS.SIGNATURE_ROYAL.priceUSD, // $1,199
  MIN_HOST_PAYOUT_INR: 5101,
  MAX_HOST_PAYOUT_INR: 61101,
  WOULD_RECOMMEND_PERCENT: 0,
  GUESTS_ATTENDED: "0",
} as const;

export type BusinessMetrics = typeof BUSINESS_METRICS;

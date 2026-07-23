/**
 * WeddingWithIndia - Centralized Single Source of Truth for Business Metrics & Key Performance Indicators.
 * All metrics across marketing pages, headers, footers, dashboards, and metadata MUST be imported from here.
 */

export const BUSINESS_METRICS = {
  WEDDINGS_HOSTED: "1,400+",
  WEDDINGS_HOSTED_NUM: 1400,
  GLOBAL_GUESTS: "12,000+",
  GLOBAL_GUESTS_NUM: 12000,
  COUNTRIES_REPRESENTED: "80+",
  COUNTRIES_REPRESENTED_NUM: 80,
  AVERAGE_RATING: "4.96",
  AVERAGE_RATING_NUM: 4.96,
  AVERAGE_RATING_LABEL: "4.96/5",
  SATISFACTION_RATE: "98%",
  SATISFACTION_RATE_NUM: 98,
  PLATFORM_FEE_PERCENT: 15.0,
  AGENT_COMMISSION_PERCENT: 5.0,
  DEFAULT_CURRENCY: "USD",
  MIN_PRICE: 100,
  MAX_PRICE: 20000,
} as const;

export type BusinessMetrics = typeof BUSINESS_METRICS;

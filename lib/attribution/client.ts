/**
 * lib/attribution/client.ts
 *
 * Client-safe attribution helper (Safe for browser / Client Component bundles).
 * Browser-safe URL query parser for client-side referral parameters.
 */

import type { AttributionData } from "./types";

export type { AttributionData };

/**
 * Extracts a referral code or campaign parameters from a client URL search string.
 */
export function extractReferralParamsFromUrl(searchParams: URLSearchParams): Partial<AttributionData> | null {
  const referralCode = searchParams.get("ref") || searchParams.get("referral");
  if (!referralCode) return null;

  return {
    referralCode,
    source: searchParams.get("utm_source") || undefined,
    medium: searchParams.get("utm_medium") || undefined,
    campaign: searchParams.get("utm_campaign") || undefined,
  };
}

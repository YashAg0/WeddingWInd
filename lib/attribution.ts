import { cookies } from "next/headers";

export interface AttributionData {
  referralCode: string;
  visitorId: string;
  sessionId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  landingPage?: string;
  firstTouchAt: string;
  lastTouchAt: string;
}

const COOKIE_NAME = "wwi_ref";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Reads the current attribution data from the first-party secure cookie.
 */
export async function getAttributionCookie(): Promise<AttributionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as AttributionData;
  } catch {
    return null;
  }
}

/**
 * Sets or updates the attribution cookie, respecting first-touch persistence.
 */
export async function setAttributionCookie(incoming: Partial<AttributionData> & { referralCode: string }) {
  const cookieStore = await cookies();
  const existing = await getAttributionCookie();
  
  const now = new Date().toISOString();
  const crypto = require('crypto');
  const visitorId = existing?.visitorId || incoming.visitorId || crypto.randomBytes(8).toString('hex');

  let merged: AttributionData;

  if (existing && existing.referralCode) {
    // FIRST-TOUCH Persistence: Do NOT overwrite the referral code if already set.
    // However, update the last touch timestamp and optional session data.
    merged = {
      ...existing,
      lastTouchAt: now,
      sessionId: incoming.sessionId || existing.sessionId,
    };
  } else {
    // New visitor click
    merged = {
      referralCode: incoming.referralCode,
      visitorId,
      sessionId: incoming.sessionId,
      source: incoming.source || undefined,
      medium: incoming.medium || undefined,
      campaign: incoming.campaign || undefined,
      landingPage: incoming.landingPage || undefined,
      firstTouchAt: now,
      lastTouchAt: now,
    };
  }

  cookieStore.set(COOKIE_NAME, JSON.stringify(merged), {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return merged;
}

/**
 * Clears the attribution cookie after conversion/onboarding.
 */
export async function clearAttributionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * lib/attribution/types.ts
 *
 * Shared Attribution Types (Safe for both Server and Client environments)
 */

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

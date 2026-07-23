/**
 * Contact Moderation & Disintermediation Prevention Service.
 * Enforces WeddingWithIndia strict marketplace safety rules:
 * - NO direct phone numbers
 * - NO WhatsApp sharing
 * - NO email exchange
 * - NO personal social links
 * - NO contact exchange before a booking is PAID / CONFIRMED
 */

import { BookingStatus } from "@prisma/client";

export interface ContactDetectionResult {
  hasProhibitedContact: boolean;
  detectedTypes: string[];
  sanitizedText?: string;
  reason?: string;
}

// Regular Expression Patterns for Contact Data Detection
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+(?:\s*\[\s*at\s*\]\s*|\s*\(\s*at\s*\)\s*|\s+AT\s+|\s*@\s*)[A-Za-z0-9.-]+(?:\s*\[\s*dot\s*\]\s*|\s*\(\s*dot\s*\)\s*|\s+DOT\s+|\s*\.\s*)(?:com|org|net|edu|gov|io|co|in|uk|us|dev)\b/i;

const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/;

const SPAL_PHONE_REGEX = /(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)/i;

const SOCIAL_WHATSAPP_REGEX = /(?:wa\.me|whatsapp|wsp|t\.me|telegram|insta|instagram|facebook|fb\.com|twitter|x\.com|linkedin|snapchat|tiktok|discord|dm\s+me|message\s+me\s+on)/i;

const CONFIRMED_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
  BookingStatus.CHECKED_IN,
  BookingStatus.ATTENDED,
  BookingStatus.COMPLETED,
];

/**
 * Checks whether a booking status permits sharing official contact details for logistics.
 */
export function isContactSharingAllowedForBooking(status?: BookingStatus | null): boolean {
  if (!status) return false;
  return CONFIRMED_BOOKING_STATUSES.includes(status);
}

/**
 * Evaluates message text for prohibited off-platform contact information.
 */
export function detectProhibitedContactInfo(text: string): ContactDetectionResult {
  if (!text) return { hasProhibitedContact: false, detectedTypes: [] };

  const detectedTypes: string[] = [];

  if (EMAIL_REGEX.test(text)) {
    detectedTypes.push("EMAIL_ADDRESS");
  }

  if (PHONE_REGEX.test(text) || SPAL_PHONE_REGEX.test(text)) {
    detectedTypes.push("PHONE_NUMBER");
  }

  if (SOCIAL_WHATSAPP_REGEX.test(text)) {
    detectedTypes.push("SOCIAL_OR_WHATSAPP");
  }

  if (detectedTypes.length > 0) {
    return {
      hasProhibitedContact: true,
      detectedTypes,
      reason:
        "For your safety and protection, sharing direct phone numbers, email addresses, WhatsApp, or social links before a confirmed booking is strictly prohibited. All communication must occur within WeddingWithIndia.",
    };
  }

  return { hasProhibitedContact: false, detectedTypes: [] };
}

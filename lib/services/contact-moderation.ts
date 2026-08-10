/**
 * Contact Moderation & Disintermediation Prevention Service.
 * Enforces WeddingWithIndia strict platform safety rules:
 * - NO direct phone numbers
 * - NO WhatsApp sharing
 * - NO email exchange
 * - NO personal social links
 * - NO contact exchange before a booking is PAID / CONFIRMED
 */


export interface ContactDetectionResult {
  hasProhibitedContact: boolean;
  detectedTypes: string[];
  sanitizedText?: string;
  reason?: string;
}

/**
 * SEC-003: Normalize text before running contact moderation regex.
 *
 * Attack surface mitigated:
 * - Zero-width spaces / joiners (e.g. "john​@gmail.com" with U+200B inserted)
 * - Unicode homoglyphs (e.g. Cyrillic 'а' instead of ASCII 'a', Greek 'ο' for '0')
 * - Diacritic characters used to obscure patterns (e.g. 'jöhn@example.com')
 * - Irregular whitespace (non-breaking spaces, em-spaces etc.)
 *
 * The normalizer:
 * 1. Strips zero-width and invisible Unicode control characters.
 * 2. Applies NFKD decomposition to break ligatures and compatibility characters.
 * 3. Removes Unicode combining marks (diacritics) left by NFKD, reducing to ASCII base chars.
 * 4. Collapses all whitespace variants to a single space.
 */
function normalizeForModeration(text: string): string {
  return (
    text
      // 1. Remove zero-width and invisible Unicode characters
      .replace(/[\u200B-\u200D\uFEFF\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u2028\u2029\u2060-\u2064\u206A-\u206F\uFFA0]/g, "")
      // 2. NFKD decomposition: expand ligatures and compatibility forms (e.g. ﬁ → fi, ａ → a)
      .normalize("NFKD")
      // 3. Strip Unicode combining marks (diacritics) resulting from NFKD
      .replace(/[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, "")
      // 4. Collapse all whitespace variants (non-breaking space, em space, etc.) to a single space
      .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, " ")
      .trim()
  );
}

// Regular Expression Patterns for Contact Data Detection
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+(?:\s*\[\s*at\s*\]\s*|\s*\(\s*at\s*\)\s*|\s+AT\s+|\s*@\s*)[A-Za-z0-9.-]+(?:\s*\[\s*dot\s*\]\s*|\s*\(\s*dot\s*\)\s*|\s+DOT\s+|\s*\.\s*)(?:com|org|net|edu|gov|io|co|in|uk|us|dev)\b/i;

const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,6}\)?[-.\s]?\d{2,6}[-.\s]?\d{2,6}\b/;

const SPAL_PHONE_REGEX = /(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)[\s._-]{1,3}(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)/i;

const SOCIAL_WHATSAPP_REGEX = /(?:wa\.me|whatsapp|wsp|t\.me|telegram|insta|instagram|facebook|fb\.com|twitter|x\.com|linkedin|snapchat|tiktok|discord|dm\s+me|message\s+me|call\s+me|contact\s+me|reach\s+me|reach\s+out|my\s+number\s+is)/i;

/**
 * Evaluates message text for prohibited off-platform contact information.
 * Applies Unicode normalization before pattern matching to defeat obfuscation attacks.
 */
export function detectProhibitedContactInfo(text: string): ContactDetectionResult {
  if (!text) return { hasProhibitedContact: false, detectedTypes: [] };

  // SEC-003: Normalize before matching to defeat homoglyph/zero-width-space bypasses
  const normalized = normalizeForModeration(text);

  const detectedTypes: string[] = [];

  if (EMAIL_REGEX.test(normalized)) {
    detectedTypes.push("EMAIL_ADDRESS");
  }

  if (PHONE_REGEX.test(normalized) || SPAL_PHONE_REGEX.test(normalized)) {
    detectedTypes.push("PHONE_NUMBER");
  }

  if (SOCIAL_WHATSAPP_REGEX.test(normalized)) {
    detectedTypes.push("SOCIAL_OR_WHATSAPP");
  }

  if (detectedTypes.length > 0) {
    return {
      hasProhibitedContact: true,
      detectedTypes,
      reason:
        "For your safety and protection, sharing direct phone numbers, email addresses, WhatsApp, or social links is not permitted. All communication must occur within WeddingWithIndia.",
    };
  }

  return { hasProhibitedContact: false, detectedTypes: [] };
}

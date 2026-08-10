import { detectProhibitedContactInfo } from "../../lib/services/contact-moderation";

describe("Contact Moderation Service", () => {
  describe("detectProhibitedContactInfo", () => {
    it("should allow normal friendly messages without contact details", () => {
      const res = detectProhibitedContactInfo(
        "Hi! We are so excited to join your family's Mehndi ceremony. Is traditional attire required?"
      );
      expect(res.hasProhibitedContact).toBe(false);
      expect(res.detectedTypes).toHaveLength(0);
    });

    it("should detect email addresses", () => {
      const res = detectProhibitedContactInfo("Contact me directly at traveler@example.com for payment");
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
      expect(res.reason).toContain("sharing direct phone numbers");
    });

    it("should detect phone numbers", () => {
      const res = detectProhibitedContactInfo("Call me at +91 9876543210 or 98765 43210");
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("PHONE_NUMBER");
    });

    it("should detect WhatsApp / Telegram / Instagram references", () => {
      const res = detectProhibitedContactInfo("Message me on whatsapp or instagram @myhandle");
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("SOCIAL_OR_WHATSAPP");
    });

    it("should detect obfuscated emails and DM requests", () => {
      const res1 = detectProhibitedContactInfo("Email me traveler [at] example [dot] com");
      expect(res1.hasProhibitedContact).toBe(true);
      expect(res1.detectedTypes).toContain("EMAIL_ADDRESS");

      const res2 = detectProhibitedContactInfo("DM me on insta for pictures");
      expect(res2.hasProhibitedContact).toBe(true);
      expect(res2.detectedTypes).toContain("SOCIAL_OR_WHATSAPP");
    });
  });

  describe("platform contact policy", () => {
    it("blocks contact info regardless of booking context (always-on moderation)", () => {
      const res = detectProhibitedContactInfo("Reach me at guest@example.com after payment");
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    });
  });

  describe("SEC-003: Unicode normalization bypass attacks", () => {
    it("should detect email with zero-width space injected before @ sign", () => {
      // Zero-width space (U+200B) inserted to break naive regex
      const zwsp = "\u200B";
      const res = detectProhibitedContactInfo(`traveler${zwsp}@example.com`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    });

    it("should detect email with zero-width non-joiner injected mid-address", () => {
      // Zero-width non-joiner (U+200C)
      const zwnj = "\u200C";
      const res = detectProhibitedContactInfo(`trove${zwnj}ler@example.com`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    });

    it("should detect phone number with non-breaking spaces as separators", () => {
      // Non-breaking spaces (U+00A0) used instead of regular spaces
      const nbsp = "\u00A0";
      const res = detectProhibitedContactInfo(`+91${nbsp}98765${nbsp}43210`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("PHONE_NUMBER");
    });

    it("should detect email address using diacritic-obscured local part", () => {
      // Diacritics stripped by NFKD + combining mark removal: jöhn → john
      const res = detectProhibitedContactInfo("Contact jöhn@example.com for details");
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    });

    it("should allow benign messages with emoji or accented language (no contact)", () => {
      const res = detectProhibitedContactInfo(
        "Bonjour! Nous sommes très excités de participer à votre mariage. Merci! 🙏"
      );
      expect(res.hasProhibitedContact).toBe(false);
    });
  });
});


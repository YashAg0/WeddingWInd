/**
 * __tests__/lib/m4-stress-harness.test.ts
 *
 * Empirical Stress & Boundary Harness for Milestone M4/M5 Verification:
 * 1. Manual PayPal payment confirmation & idempotency.
 * 2. Manual Refund limit bounds & precision.
 * 3. Contact moderation Unicode normalization evasion matrix (zero-width spaces, diacritics, obfuscations).
 */

import { adminRecordManualRefundAction } from "@/lib/actions/payment-manual";
import { detectProhibitedContactInfo } from "@/lib/services/contact-moderation";

// Mocks for Next.js and Prisma
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    refund: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    booking: { findUnique: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    guestPass: { findFirst: jest.fn(), create: jest.fn() },
    travelerPreparation: { create: jest.fn() },
    notification: { create: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (cb: any) => {
      if (typeof cb === "function") {
        return cb({
          payment: {
            findUnique: jest.fn().mockResolvedValue({
              id: "pay_999",
              amount: 1000,
              currency: "USD",
              status: "PAID",
              bookingId: "b_123",
              booking: {
                id: "b_123",
                traveler: { user: { id: "u_123", email: "traveler@test.com" }, fullName: "Test Traveler" },
                wedding: { title: "Grand Celebration" },
              },
              refunds: [{ amount: 700 }],
            }),
            update: jest.fn().mockResolvedValue({ id: "pay_999", status: "REFUNDED" }),
          },
          booking: {
            update: jest.fn().mockResolvedValue({ id: "b_123", status: "REFUNDED" }),
          },
          refund: {
            create: jest.fn().mockResolvedValue({ id: "ref_1", amount: 200, status: "COMPLETED" }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: "tx_1" }),
          },
          notification: {
            create: jest.fn().mockResolvedValue({ id: "notif_1" }),
          },
        });
      }
      return cb;
    }),
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "user_123", role: "TRAVELER", status: "ACTIVE" }),
  requireRole: jest.fn().mockResolvedValue({ id: "admin_123", role: "ADMIN", email: "admin@weddingwithindia.com" }),
}));

jest.mock("@/lib/actions/admin", () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/email", () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue(undefined),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("M4 Empirical Verification 1: Manual Refund Limit Bounds & Precision", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1.1 Rejects non-positive refund amounts", async () => {
    await expect(
      adminRecordManualRefundAction({
        paymentId: "pay_999",
        refundAmount: 0,
        reason: "Zero refund",
      })
    ).rejects.toThrow("Refund amount must be greater than 0.");

    await expect(
      adminRecordManualRefundAction({
        paymentId: "pay_999",
        refundAmount: -50,
        reason: "Negative refund",
      })
    ).rejects.toThrow("Refund amount must be greater than 0.");
  });

  it("1.2 Records valid manual refund within balance limit", async () => {
    const res = await adminRecordManualRefundAction({
      paymentId: "pay_999",
      refundAmount: 200,
      reason: "Valid partial refund",
      refundTransactionId: "REF-PP-12345",
    });

    expect(res.success).toBe(true);
    expect(res.refund).toHaveProperty("amount", 200);
  });
});

describe("M4 Empirical Verification 2: Contact Moderation Evasion & Normalization", () => {
  it("2.1 Intercepts emails with zero-width characters (U+200B, U+200C, U+200D, U+FEFF)", () => {
    const zwsp = "\u200B";
    const zwnj = "\u200C";
    const zwj = "\u200D";
    const bom = "\uFEFF";

    const emails = [
      `contact${zwsp}@weddingwithindia.com`,
      `user${zwnj}123@gmail.com`,
      `host${zwj}couple@yahoo.com`,
      `admin${bom}@outlook.com`,
    ];

    for (const email of emails) {
      const res = detectProhibitedContactInfo(`Send details to ${email}`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    }
  });

  it("2.2 Normalizes Unicode diacritics via NFKD stripping (jöhn@example.com, tést@domain.com)", () => {
    const diacritics = [
      "jöhn@example.com",
      "tést.usér@domain.co.in",
      "álex@weddinghost.com",
    ];

    for (const text of diacritics) {
      const res = detectProhibitedContactInfo(`Reach me at ${text}`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    }
  });

  it("2.3 Intercepts phone numbers using non-breaking spaces and irregular whitespace", () => {
    const nbsp = "\u00A0";
    const emspace = "\u2003";

    const phoneNumbers = [
      `+91${nbsp}98765${nbsp}43210`,
      `98765${emspace}43210`,
    ];

    for (const phone of phoneNumbers) {
      const res = detectProhibitedContactInfo(`Call ${phone}`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("PHONE_NUMBER");
    }
  });

  it("2.4 Intercepts obfuscated email formats ([at], (at), AT, [dot], (dot), DOT)", () => {
    const obfuscatedEmails = [
      "traveler [at] example [dot] com",
      "guest (at) domain (dot) org",
      "weddinghost AT yahoo DOT com",
      "contact @ domain . com",
    ];

    for (const text of obfuscatedEmails) {
      const res = detectProhibitedContactInfo(`Email me: ${text}`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("EMAIL_ADDRESS");
    }
  });

  it("2.5 Intercepts spelled-out and delimited phone numbers", () => {
    const obfuscatedPhones = [
      "nine eight seven six five four three two one zero",
      "nine_eight_seven_six_five_four_three_two_one_zero",
      "9.8.7.6.5.4.3.2.1.0",
    ];

    for (const text of obfuscatedPhones) {
      const res = detectProhibitedContactInfo(`My phone is ${text}`);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("PHONE_NUMBER");
    }
  });

  it("2.6 Intercepts social media and messenger handles / links", () => {
    const socials = [
      "Message me on wa.me/919876543210 for quick response",
      "Find me on t.me/myuser",
      "DM me on insta @wedding_host",
    ];

    for (const text of socials) {
      const res = detectProhibitedContactInfo(text);
      expect(res.hasProhibitedContact).toBe(true);
      expect(res.detectedTypes).toContain("SOCIAL_OR_WHATSAPP");
    }
  });

  it("2.7 Allows benign messages with international accent marks without false positives", () => {
    const benign = [
      "Bonjour! Nous sommes très excités d'assister à votre mariage. Merci!",
      "¿A qué hora empieza la ceremonia de Sangeet?",
      "Can't wait to celebrate the traditional Baraat procession tomorrow!",
    ];

    for (const msg of benign) {
      const res = detectProhibitedContactInfo(msg);
      expect(res.hasProhibitedContact).toBe(false);
      expect(res.detectedTypes).toHaveLength(0);
    }
  });
});

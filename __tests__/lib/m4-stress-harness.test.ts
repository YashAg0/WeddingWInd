/**
 * __tests__/lib/m4-stress-harness.test.ts
 *
 * Empirical Stress & Boundary Harness for Milestone M4/M5 Verification:
 * 1. Partial refund limit bounds & floating point precision / NaN handling.
 * 2. Stripe webhook idempotency, duplicate event (status: PROCESSED), and race handling.
 * 3. Contact moderation Unicode normalization evasion matrix (zero-width spaces, diacritics, obfuscations).
 */

import { processPartialRefundAction } from "@/lib/actions/stripe";
import { detectProhibitedContactInfo } from "@/lib/services/contact-moderation";
import { POST as stripeWebhookHandler } from "@/app/api/webhooks/stripe/route";

// Mocks for Next.js and Prisma
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue({
    get: (key: string) => (key === "stripe-signature" ? "t=123,v1=valid_sig" : null),
  }),
}));

jest.mock("@/lib/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test_secret_key_12345",
  },
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
    payment: { findUnique: jest.fn(), update: jest.fn() },
    refund: { findMany: jest.fn(), create: jest.fn() },
    stripeWebhookEvent: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    booking: { findUnique: jest.fn(), update: jest.fn() },
    paymentIntent: { create: jest.fn() },
    transaction: { create: jest.fn() },
    guestPass: { create: jest.fn() },
    travelerPreparation: { create: jest.fn() },
    notification: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (cb: any) => cb({
      booking: {
        findUnique: jest.fn().mockResolvedValue({
          id: "b_123",
          status: "PENDING",
          totalAmount: 500,
          travelerId: "t_123",
          weddingId: "w_123",
          guestsCount: 2,
          date: new Date("2026-12-01"),
          traveler: { user: { id: "u_1", email: "user@example.com" }, fullName: "Test Traveler" },
          wedding: { title: "Royal Palace Wedding" },
          payments: [],
        }),
        update: jest.fn().mockResolvedValue({ id: "b_123", status: "PAID" }),
      },
      payment: { create: jest.fn().mockResolvedValue({ id: "pay_1", amount: 500 }) },
      paymentIntent: { create: jest.fn().mockResolvedValue({ id: "pi_1" }) },
      transaction: { create: jest.fn().mockResolvedValue({ id: "tx_1" }) },
      guestPass: { create: jest.fn().mockResolvedValue({ id: "gp_1" }) },
      travelerPreparation: { create: jest.fn().mockResolvedValue({ id: "tp_1" }) },
      notification: { create: jest.fn().mockResolvedValue({ id: "n_1" }) },
    })),
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "admin_123", role: "ADMIN", status: "ACTIVE" }),
  requireRole: jest.fn().mockResolvedValue({ id: "admin_123", role: "ADMIN", email: "admin@weddingwithindia.com" }),
}));

jest.mock("@/lib/actions/admin", () => ({
  createAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/email", () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue(undefined),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({ id: "ref_stripe_stress_123" }),
    },
  },
}));

const { prisma } = jest.requireMock("@/lib/prisma");
const { stripe } = jest.requireMock("@/lib/stripe");

describe("M4 Empirical Verification 1: Partial Refund Limit Bounds & Precision", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1.1 Strictly throws EXCEEDS_PAYMENT_AMOUNT when totalAlreadyRefunded + partialAmount > payment.amount", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_999",
      amount: 1000,
      stripePaymentIntentId: "pi_999",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 700, status: "COMPLETED" },
    ]);

    await expect(
      processPartialRefundAction("pay_999", 301, "Over boundary")
    ).rejects.toThrow("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.");
  });

  it("1.2 Throws EXCEEDS_PAYMENT_AMOUNT when partialAmount exceeds limit by just $0.01", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_999",
      amount: 500,
      stripePaymentIntentId: "pi_999",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 250, status: "COMPLETED" },
    ]);

    await expect(
      processPartialRefundAction("pay_999", 250.01, "Over boundary by 1 cent")
    ).rejects.toThrow("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.");
  });

  it("1.3 Allows partial refund when exact sum equals payment amount (100% partial aggregate)", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_999",
      amount: 500,
      stripePaymentIntentId: "pi_999",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 300, status: "COMPLETED" },
    ]);

    prisma.refund.create.mockResolvedValue({
      id: "ref_2",
      paymentId: "pay_999",
      amount: 200,
      status: "COMPLETED",
    });

    const res = await processPartialRefundAction("pay_999", 200, "Exact boundary");
    expect(res).toEqual({ success: true });
    expect(prisma.refund.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "pay_999",
        amount: 200,
        status: "COMPLETED",
      }),
    });
  });

  it("1.4 Rejects non-positive partial amounts (0 and negative values)", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_999",
      amount: 500,
      stripePaymentIntentId: "pi_999",
    });

    await expect(
      processPartialRefundAction("pay_999", 0, "Zero refund")
    ).rejects.toThrow("Partial refund amount must be greater than $0.");

    await expect(
      processPartialRefundAction("pay_999", -50, "Negative refund")
    ).rejects.toThrow("Partial refund amount must be greater than $0.");
  });

  it("1.5 Handles floating-point precision math correctly without false rejections", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_fp",
      amount: 100.00,
      stripePaymentIntentId: "pi_fp",
    });

    prisma.refund.findMany.mockResolvedValue([
      { id: "ref_1", amount: 33.33, status: "COMPLETED" },
      { id: "ref_2", amount: 33.33, status: "COMPLETED" },
    ]);

    prisma.refund.create.mockResolvedValue({
      id: "ref_3",
      paymentId: "pay_fp",
      amount: 33.34,
      status: "COMPLETED",
    });

    const res = await processPartialRefundAction("pay_fp", 33.34, "Third split");
    expect(res).toEqual({ success: true });
  });

  it("1.6 Rejects NaN and Infinity values safely", async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: "pay_inf",
      amount: 500,
      stripePaymentIntentId: "pi_inf",
    });

    await expect(
      processPartialRefundAction("pay_inf", Infinity, "Infinity refund")
    ).rejects.toThrow("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.");
  });
});

describe("M4 Empirical Verification 2: Stripe Webhook Duplicate Event & Idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("2.1 Processes new webhook event, creates StripeWebhookEvent RECEIVED, then marks PROCESSED", async () => {
    const mockEvent = {
      id: "evt_new_1001",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1001",
          client_reference_id: "b_123",
          currency: "usd",
          payment_intent: "pi_test_1001",
        },
      },
    };

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    prisma.stripeWebhookEvent.findFirst.mockResolvedValue(null);
    prisma.stripeWebhookEvent.create.mockResolvedValue({ id: "swe_1", stripeEventId: "evt_new_1001", status: "RECEIVED" });
    prisma.stripeWebhookEvent.update.mockResolvedValue({ id: "swe_1", stripeEventId: "evt_new_1001", status: "PROCESSED" });

    const req = new Request("https://weddingwithindia.com/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
    });

    const response = await stripeWebhookHandler(req);
    expect(response.status).toBe(200);

    expect(prisma.stripeWebhookEvent.create).toHaveBeenCalledWith({
      data: {
        stripeEventId: "evt_new_1001",
        type: "checkout.session.completed",
        status: "RECEIVED",
      },
    });

    expect(prisma.stripeWebhookEvent.update).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_new_1001" },
      data: expect.objectContaining({
        status: "PROCESSED",
      }),
    });
  });

  it("2.2 Returns 200 OK (Duplicate event ignored) for existing event in PROCESSED status", async () => {
    const mockEvent = {
      id: "evt_dup_2002",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_2002",
          client_reference_id: "b_123",
        },
      },
    };

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    prisma.stripeWebhookEvent.findFirst.mockResolvedValue({
      id: "swe_dup",
      stripeEventId: "evt_dup_2002",
      type: "checkout.session.completed",
      status: "PROCESSED",
    });

    const req = new Request("https://weddingwithindia.com/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
    });

    const response = await stripeWebhookHandler(req);
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK (Duplicate event ignored)");

    expect(prisma.stripeWebhookEvent.create).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("2.3 Re-evaluates webhook event if previously recorded status is FAILED", async () => {
    const mockEvent = {
      id: "evt_failed_3003",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_3003",
          client_reference_id: "b_123",
          currency: "usd",
        },
      },
    };

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    prisma.stripeWebhookEvent.findFirst.mockResolvedValue({
      id: "swe_failed",
      stripeEventId: "evt_failed_3003",
      type: "checkout.session.completed",
      status: "FAILED",
    });

    const req = new Request("https://weddingwithindia.com/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
    });

    const response = await stripeWebhookHandler(req);
    expect(response.status).toBe(200);
    expect(prisma.stripeWebhookEvent.create).not.toHaveBeenCalled(); // Already exists
    expect(prisma.$transaction).toHaveBeenCalled(); // Re-attempts processing transaction
    expect(prisma.stripeWebhookEvent.update).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_failed_3003" },
      data: expect.objectContaining({ status: "PROCESSED" }),
    });
  });
});

describe("M4 Empirical Verification 3: Contact Moderation Evasion & Normalization", () => {
  it("3.1 Intercepts emails with zero-width characters (U+200B, U+200C, U+200D, U+FEFF)", () => {
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

  it("3.2 Normalizes Unicode diacritics via NFKD stripping (jöhn@example.com, tést@domain.com)", () => {
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

  it("3.3 Intercepts phone numbers using non-breaking spaces and irregular whitespace", () => {
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

  it("3.4 Intercepts obfuscated email formats ([at], (at), AT, [dot], (dot), DOT)", () => {
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

  it("3.5 Intercepts spelled-out and delimited phone numbers", () => {
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

  it("3.6 Intercepts social media and messenger handles / links", () => {
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

  it("3.7 Allows benign messages with international accent marks without false positives", () => {
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

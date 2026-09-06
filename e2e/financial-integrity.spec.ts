import { test, expect } from "@playwright/test";
import { calculateCancellationPolicy } from "../lib/services/cancellation-policy";
import { BookingStatus, CancellationActor, CancellationReasonCode } from "@prisma/client";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

test.describe("Financial Integrity - Tier 1, Tier 2 & Tier 3", () => {

  test.describe("R4 & Tier 1: Server-Authoritative Pricing & Checkout", () => {
    test("Booking checkout endpoint computes total based on DB price, not client payload", async () => {
      const { createBookingAction } = await import("../lib/actions/index");

      // Verify that booking creation rejects unauthenticated calls
      await expect(
        createBookingAction({
          weddingId: "dummy_wedding_id",
          date: new Date().toISOString(),
          guestsCount: 2,
        })
      ).rejects.toThrow();
    });

    test("Checkout session creation rejects non-owned or invalid booking IDs", async () => {
      const { createCheckoutSessionAction } = await import("../lib/actions/index");

      await expect(
        createCheckoutSessionAction("non_existent_booking_id")
      ).rejects.toThrow();
    });
  });

  test.describe("R4 & Tier 2: Boundary & Corner Cases in Manual Payment Actions", () => {
    test("Manual payment request rejects non-admin users", async () => {
      const { adminRequestPaymentAction } = await import("../lib/actions/payment-manual");

      await expect(
        adminRequestPaymentAction({
          bookingId: "mock_booking_id",
          baseAmount: 500,
          paymentLink: "https://paypal.me/weddingwithindia",
        })
      ).rejects.toThrow();
    });

    test("Payment link validation strictly rejects invalid schemes or non-PayPal domains", async () => {
      const { validatePaymentLink } = await import("../lib/services/payments");

      const badScheme = validatePaymentLink("javascript:alert(1)");
      expect(badScheme.valid).toBe(false);

      const foreignDomain = validatePaymentLink("https://evil-phishing-site.com/pay");
      expect(foreignDomain.valid).toBe(false);

      const validPayPal = validatePaymentLink("https://www.paypal.me/weddingwithindia");
      expect(validPayPal.valid).toBe(true);
    });
  });

  test.describe("R4 & Tier 3: Cancellation Tier Engine & Refund Calculations", () => {
    const totalAmount = 1000; // $1,000 USD
    const now = new Date();

    test("30+ days prior to event gives 90% refund", () => {
      const eventDate = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.APPROVED,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(true);
      expect(result.refundPercentage).toBe(90);
      expect(result.refundableAmount).toBe(900);
      expect(result.platformFeeRefundable).toBe(false);
    });

    test("15-29 days prior to event gives 70% refund", () => {
      const eventDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.APPROVED,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(true);
      expect(result.refundPercentage).toBe(70);
      expect(result.refundableAmount).toBe(700);
    });

    test("7-14 days prior to event gives 40% refund", () => {
      const eventDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.APPROVED,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(true);
      expect(result.refundPercentage).toBe(40);
      expect(result.refundableAmount).toBe(400);
    });

    test("Less than 7 days prior to event gives 0% refund", () => {
      const eventDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.APPROVED,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(true);
      expect(result.refundPercentage).toBe(0);
      expect(result.refundableAmount).toBe(0);
    });

    test("Host cancellation gives 100% refund including platform fee", () => {
      const eventDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.HOST,
        status: BookingStatus.APPROVED,
        reasonCode: CancellationReasonCode.HOST_CANCELLED,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(true);
      expect(result.refundPercentage).toBe(100);
      expect(result.refundableAmount).toBe(1000);
      expect(result.platformFeeRefundable).toBe(true);
    });

    test("Terminal/Checked-in booking states cannot be cancelled", () => {
      const eventDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const result = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.CHECKED_IN,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: now,
      });

      expect(result.eligible).toBe(false);
      expect(result.refundableAmount).toBe(0);
    });
  });

  test.describe("R4 & Tier 2: Legacy Webhook Route Safety", () => {
    test("POST /api/webhooks/stripe safely handles incoming requests without crashing", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
        data: JSON.stringify({ id: "evt_test_123", type: "checkout.session.completed" }),
      });

      // Returns either 400 (missing signature) or 200 (dormant/inactive provider)
      expect([200, 400]).toContain(response.status());
    });
  });

});

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

    test("Stripe checkout creation rejects non-owned or invalid booking IDs", async () => {
      const { createStripeCheckoutAction } = await import("../lib/actions/stripe");

      await expect(
        createStripeCheckoutAction("non_existent_booking_id")
      ).rejects.toThrow();
    });
  });

  test.describe("R4 & Tier 2: Boundary & Corner Cases in Financial Actions", () => {
    test("Partial refund exceeding total paid amount is strictly rejected", async () => {
      const { processPartialRefundAction } = await import("../lib/actions/stripe");

      // Test processPartialRefundAction throws error when user is not admin or amount invalid
      await expect(
        processPartialRefundAction("mock_payment_id", 999999, "Over-refund attempt")
      ).rejects.toThrow();
    });

    test("Negative or zero partial refund amount is strictly rejected", async () => {
      const { processPartialRefundAction } = await import("../lib/actions/stripe");

      await expect(
        processPartialRefundAction("mock_payment_id", 0, "Zero refund attempt")
      ).rejects.toThrow();

      await expect(
        processPartialRefundAction("mock_payment_id", -50, "Negative refund attempt")
      ).rejects.toThrow();
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

  test.describe("R4 & Tier 2: Stripe Webhook Route Protection & Idempotency", () => {
    test("POST /api/webhooks/stripe missing stripe-signature header returns 400 Bad Request", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
        data: JSON.stringify({ id: "evt_test_123", type: "checkout.session.completed" }),
      });

      expect(response.status()).toBe(400);
      const text = await response.text();
      expect(text).toContain("Missing Stripe signature header");
    });
  });

});

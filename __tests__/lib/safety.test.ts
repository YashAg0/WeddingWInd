/**
 * __tests__/lib/safety.test.ts
 *
 * Unit tests for Cancellation Policy Engine and safety rules.
 * Run: npx jest __tests__/lib/safety.test.ts
 */

import { calculateCancellationPolicy } from "@/lib/services/cancellation-policy";
import { BookingStatus, CancellationActor, CancellationReasonCode } from "@prisma/client";

describe("Cancellation Policy Engine", () => {
  const eventDate = new Date("2026-10-01T00:00:00.000Z");
  const totalAmount = 1500.50; // $1500.50 USD

  describe("Traveler cancellation day thresholds", () => {
    it("should return 90% refund for 31 days prior", () => {
      const cancellationDate = new Date("2026-08-31T00:00:00.000Z"); // exactly 31 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(90);
      expect(policy.refundableAmount).toBe(1350.45); // 90% of 1500.50 = 1350.45
      expect(policy.platformFeeRefundable).toBe(false);
    });

    it("should return 90% refund for 30 days prior", () => {
      const cancellationDate = new Date("2026-09-01T00:00:00.000Z"); // exactly 30 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(90);
      expect(policy.refundableAmount).toBe(1350.45);
    });

    it("should return 70% refund for 29 days prior", () => {
      const cancellationDate = new Date("2026-09-02T00:00:00.000Z"); // 29 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(70);
      expect(policy.refundableAmount).toBe(1050.35); // 70% of 1500.50 = 1050.35
    });

    it("should return 70% refund for 15 days prior", () => {
      const cancellationDate = new Date("2026-09-16T00:00:00.000Z"); // 15 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(70);
      expect(policy.refundableAmount).toBe(1050.35);
    });

    it("should return 40% refund for 14 days prior", () => {
      const cancellationDate = new Date("2026-09-17T00:00:00.000Z"); // 14 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(40);
      expect(policy.refundableAmount).toBe(600.20); // 40% of 1500.50 = 600.20
    });

    it("should return 40% refund for 7 days prior", () => {
      const cancellationDate = new Date("2026-09-24T00:00:00.000Z"); // 7 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(40);
      expect(policy.refundableAmount).toBe(600.20);
    });

    it("should return 0% refund for 6 days prior", () => {
      const cancellationDate = new Date("2026-09-25T00:00:00.000Z"); // 6 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(0);
      expect(policy.refundableAmount).toBe(0);
    });
  });

  describe("Host cancellations", () => {
    it("should return full 100% refund regardless of time and refund platform fee", () => {
      const cancellationDate = new Date("2026-09-29T00:00:00.000Z"); // 2 days before
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount,
        actor: CancellationActor.HOST,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.HOST_CANCELLED,
        cancellationDate,
      });

      expect(policy.eligible).toBe(true);
      expect(policy.refundPercentage).toBe(100);
      expect(policy.refundableAmount).toBe(totalAmount);
      expect(policy.platformFeeRefundable).toBe(true);
    });
  });

  describe("Currency minor-unit precision safety", () => {
    it("should handle floating-point values correctly without rounding anomalies", () => {
      const policy = calculateCancellationPolicy({
        eventDate,
        totalAmount: 100.07, // 10007 cents
        actor: CancellationActor.TRAVELER,
        status: BookingStatus.PAID,
        reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
        cancellationDate: new Date("2026-08-31T00:00:00.000Z"), // 31 days (90%)
      });

      // 90% of 10007 is 9006.3, rounded to 9006 cents = 90.06
      expect(policy.refundableAmount).toBe(90.06);
    });
  });
});

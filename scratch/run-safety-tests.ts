import assert from "assert";
import { calculateCancellationPolicy } from "../lib/services/cancellation-policy";
import { BookingStatus, CancellationActor, CancellationReasonCode } from "@prisma/client";

function runTests() {
  console.log("🚀 Running trust and safety unit tests...");

  const eventDate = new Date("2026-10-01T00:00:00.000Z");
  const totalAmount = 1500.50; // $1500.50 USD

  // 1. 31 days traveler cancellation (90% refund)
  {
    const cancellationDate = new Date("2026-08-31T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.eligible, true);
    assert.strictEqual(policy.refundPercentage, 90);
    assert.strictEqual(policy.refundableAmount, 1350.45);
    assert.strictEqual(policy.platformFeeRefundable, false);
    console.log("✅ Traveler cancellation 31 days prior (90%) - PASSED");
  }

  // 2. 30 days traveler cancellation (90% refund)
  {
    const cancellationDate = new Date("2026-09-01T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 90);
    assert.strictEqual(policy.refundableAmount, 1350.45);
    console.log("✅ Traveler cancellation 30 days prior (90%) - PASSED");
  }

  // 3. 29 days traveler cancellation (70% refund)
  {
    const cancellationDate = new Date("2026-09-02T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 70);
    assert.strictEqual(policy.refundableAmount, 1050.35);
    console.log("✅ Traveler cancellation 29 days prior (70%) - PASSED");
  }

  // 4. 15 days traveler cancellation (70% refund)
  {
    const cancellationDate = new Date("2026-09-16T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 70);
    assert.strictEqual(policy.refundableAmount, 1050.35);
    console.log("✅ Traveler cancellation 15 days prior (70%) - PASSED");
  }

  // 5. 14 days traveler cancellation (40% refund)
  {
    const cancellationDate = new Date("2026-09-17T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 40);
    assert.strictEqual(policy.refundableAmount, 600.20);
    console.log("✅ Traveler cancellation 14 days prior (40%) - PASSED");
  }

  // 6. 7 days traveler cancellation (40% refund)
  {
    const cancellationDate = new Date("2026-09-24T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 40);
    assert.strictEqual(policy.refundableAmount, 600.20);
    console.log("✅ Traveler cancellation 7 days prior (40%) - PASSED");
  }

  // 7. 6 days traveler cancellation (0% refund)
  {
    const cancellationDate = new Date("2026-09-25T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate,
    });
    assert.strictEqual(policy.refundPercentage, 0);
    assert.strictEqual(policy.refundableAmount, 0);
    console.log("✅ Traveler cancellation 6 days prior (0%) - PASSED");
  }

  // 8. Host cancellation (100% refund, refund platform fee)
  {
    const cancellationDate = new Date("2026-09-29T00:00:00.000Z");
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount,
      actor: CancellationActor.HOST,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.HOST_CANCELLED,
      cancellationDate,
    });
    assert.strictEqual(policy.eligible, true);
    assert.strictEqual(policy.refundPercentage, 100);
    assert.strictEqual(policy.refundableAmount, totalAmount);
    assert.strictEqual(policy.platformFeeRefundable, true);
    console.log("✅ Host cancellation refund policy (100%) - PASSED");
  }

  // 9. Floating point safety (Cent based minor-units)
  {
    const policy = calculateCancellationPolicy({
      eventDate,
      totalAmount: 100.07, // 10007 cents
      actor: CancellationActor.TRAVELER,
      status: BookingStatus.PAID,
      reasonCode: CancellationReasonCode.CHANGE_OF_PLANS,
      cancellationDate: new Date("2026-08-31T00:00:00.000Z"), // 31 days (90%)
    });
    assert.strictEqual(policy.refundableAmount, 90.06); // 9006 cents
    console.log("✅ Floating-point cent-based safety verification - PASSED");
  }

  console.log("🎉 All safety verification unit tests passed successfully!");
}

try {
  runTests();
  process.exit(0);
} catch (error) {
  console.error("❌ Test assertion failure:", error);
  process.exit(1);
}

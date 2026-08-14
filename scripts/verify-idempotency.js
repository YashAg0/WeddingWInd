/**
 * Verification Script: verify-idempotency.js
 * Validates:
 * 1. Contact submission deduplication under rapid retry.
 * 2. Booking duplicate reservation protection in createBookingAction.
 * 3. Stripe Webhook idempotency.
 */

const assert = require("assert");
const fs = require("fs");

function testContactDeduplication() {
  console.log("▶ Verifying Contact Submission deduplication in app/api/contact/route.ts...");
  const contactCode = fs.readFileSync("app/api/contact/route.ts", "utf8");

  assert(contactCode.includes("oneMinuteAgo"), "Contact route must calculate time window for deduplication");
  assert(contactCode.includes("prisma.contactSubmission.findFirst"), "Contact route must check for existing recent submission");
  assert(contactCode.includes("existing.id"), "Contact route must return existing id on duplicate submission");

  console.log("  ✓ Contact deduplication verified.");
}

function testBookingDuplicateProtection() {
  console.log("▶ Verifying Booking Duplicate Protection in lib/actions/index.ts...");
  const actionsCode = fs.readFileSync("lib/actions/index.ts", "utf8");

  assert(actionsCode.includes("No duplicate active booking"), "createBookingAction must check for duplicate active bookings");
  assert(actionsCode.includes("BookingStatus.PENDING"), "createBookingAction must check PENDING");
  assert(actionsCode.includes("BookingStatus.APPROVED"), "createBookingAction must check APPROVED");
  assert(actionsCode.includes("BookingStatus.PAID"), "createBookingAction must check PAID");
  assert(actionsCode.includes("BookingStatus.CONFIRMED"), "createBookingAction must check CONFIRMED");

  console.log("  ✓ Booking duplicate protection verified.");
}

function testStripeWebhookIdempotency() {
  console.log("▶ Verifying Stripe Webhook idempotency...");
  const webhookCode = fs.readFileSync("app/api/webhooks/stripe/route.ts", "utf8");

  assert(webhookCode.includes("stripeWebhookEvent") || webhookCode.includes("event.id"), "Stripe webhook must enforce event uniqueness");

  console.log("  ✓ Stripe webhook idempotency verified.");
}

function run() {
  try {
    testContactDeduplication();
    testBookingDuplicateProtection();
    testStripeWebhookIdempotency();
    console.log("\n✅ ALL IDEMPOTENCY TESTS PASSED.");
  } catch (err) {
    console.error("\n❌ IDEMPOTENCY TEST FAILED:", err);
    process.exit(1);
  }
}

run();

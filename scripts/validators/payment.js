/**
 * WeddingWithIndia — Payment Validator
 * Validates Stripe payment gateway configuration (Secret Key, Publishable Key, Webhook Secret).
 */

function validatePayment() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Payment Gateway Validator");
  console.log("==================================================\n");

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let isValid = true;

  if (secretKey && secretKey.startsWith("sk_")) {
    console.log("✅ Stripe Secret Key is valid and present.");
  } else {
    console.log("⚠️  Stripe Secret Key (STRIPE_SECRET_KEY) is missing or invalid.");
    isValid = false;
  }

  if (pubKey && pubKey.startsWith("pk_")) {
    console.log("✅ Stripe Publishable Key is valid and present.");
  } else {
    console.log("⚠️  Stripe Publishable Key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is missing or invalid.");
    isValid = false;
  }

  if (webhookSecret && webhookSecret.startsWith("whsec_")) {
    console.log("✅ Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET) is valid and present.");
  } else {
    console.log("⚠️  Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET) is missing or unconfigured.");
  }

  console.log("--------------------------------------------------");
  if (isValid) {
    console.log("✅ Stripe payment processing is ready!");
  } else {
    console.log("⚠️  Stripe integration is running in dev mock fallback mode.");
  }
  console.log("--------------------------------------------------\n");
  return isValid;
}

if (require.main === module) {
  validatePayment();
}

module.exports = { validatePayment };

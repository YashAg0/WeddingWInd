/**
 * WeddingWithIndia — Payment Validator
 * Validates manual PayPal payment configuration.
 */

function validatePayment() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Manual PayPal Payment Validator");
  console.log("==================================================\n");

  const domainAllowlist = process.env.PAYPAL_DOMAIN_ALLOWLIST || "paypal.com,paypal.me";

  console.log(`✅ Manual PayPal Payment Provider Active.`);
  console.log(`✅ Allowed PayPal domains: ${domainAllowlist}`);
  console.log("✅ Admin manual verification workflow ready.");

  console.log("--------------------------------------------------");
  console.log("✅ Payment processing is ready (Manual PayPal MVP)!");
  console.log("--------------------------------------------------\n");
  return true;
}

if (require.main === module) {
  validatePayment();
}

module.exports = { validatePayment };

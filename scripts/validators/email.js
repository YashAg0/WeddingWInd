/**
 * WeddingWithIndia — Email Validator
 * Validates transactional email configuration (Resend API Key / SMTP).
 */

function validateEmail() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Email Service Validator");
  console.log("==================================================\n");

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("placeholder")) {
    console.log("✅ Resend Transactional Email Service is fully configured!");
    console.log(`   API Key Prefix: ${apiKey.substring(0, 7)}***`);
    console.log("--------------------------------------------------\n");
    return true;
  } else {
    console.log("⚠️  RESEND_API_KEY is not configured.");
    console.log("   Transactional emails (booking confirmations, invitations, pass alerts) will be logged to console in dev mode.");
    console.log("   To enable real email delivery:");
    console.log("   Set RESEND_API_KEY in your .env file.");
    console.log("--------------------------------------------------\n");
    return true; // Non-fatal for dev
  }
}

if (require.main === module) {
  validateEmail();
}

module.exports = { validateEmail };

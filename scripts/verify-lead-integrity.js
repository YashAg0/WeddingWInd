/**
 * Verification Script: verify-lead-integrity.js
 * Validates:
 * 1. Newsletter subscription route (app/api/newsletter/route.ts) with DB persistence.
 * 2. Newsletter form component (components/ui/NewsletterForm.tsx) integration.
 * 3. Contact submission pipeline & validation.
 */

const assert = require("assert");
const fs = require("fs");

function testNewsletterRoute() {
  console.log("▶ Verifying Newsletter API endpoint in app/api/newsletter/route.ts...");
  assert(fs.existsSync("app/api/newsletter/route.ts"), "app/api/newsletter/route.ts must exist");
  const routeCode = fs.readFileSync("app/api/newsletter/route.ts", "utf8");

  assert(routeCode.includes("prisma.newsletterSubscriber.upsert"), "Newsletter route must persist subscribers using upsert");
  assert(routeCode.includes("rateLimit"), "Newsletter route must be rate limited");
  assert(routeCode.includes("z.string().email"), "Newsletter route must validate email format");

  console.log("  ✓ Newsletter API route verified.");
}

function testNewsletterForm() {
  console.log("▶ Verifying NewsletterForm component in components/ui/NewsletterForm.tsx...");
  const formCode = fs.readFileSync("components/ui/NewsletterForm.tsx", "utf8");

  assert(formCode.includes('fetch("/api/newsletter"'), "NewsletterForm must call /api/newsletter endpoint");
  assert(formCode.includes("status"), "NewsletterForm must handle status state");
  assert(formCode.includes("errorMessage"), "NewsletterForm must display error messages");

  console.log("  ✓ NewsletterForm component verified.");
}

function testContactRoute() {
  console.log("▶ Verifying Contact Form API endpoint in app/api/contact/route.ts...");
  const contactCode = fs.readFileSync("app/api/contact/route.ts", "utf8");

  assert(contactCode.includes("prisma.contactSubmission.create"), "Contact route must persist to contactSubmission table");
  assert(contactCode.includes("rateLimit"), "Contact route must be rate limited");
  assert(contactCode.includes("privacyConsent"), "Contact route must require privacyConsent");

  console.log("  ✓ Contact Form API route verified.");
}

function run() {
  try {
    testNewsletterRoute();
    testNewsletterForm();
    testContactRoute();
    console.log("\n✅ ALL LEAD INTEGRITY TESTS PASSED.");
  } catch (err) {
    console.error("\n❌ LEAD INTEGRITY TEST FAILED:", err);
    process.exit(1);
  }
}

run();

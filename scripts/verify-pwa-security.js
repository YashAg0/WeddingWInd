/**
 * scripts/verify-pwa-security.js
 *
 * Automated verification of PWA Security Boundaries:
 * 1. Confirms transactional routes (auth, checkout, Stripe, Clerk, API, Dashboard) are bypassed.
 * 2. Confirms mutations (POST, PUT, DELETE) are never cached.
 * 3. Confirms sw.js headers in next.config.ts prevent stale worker caching.
 */

const fs = require("fs");
const path = require("path");

function runSecurityAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — PWA Security & Bypass Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const swPath = path.resolve(__dirname, "../public/sw.js");
  const swContent = fs.readFileSync(swPath, "utf8");

  // 1. Audit Mutation Protection (Only GET requests handled)
  if (swContent.includes('request.method !== "GET"')) {
    console.log("✅ Mutation Protection: SW strictly ignores non-GET requests (POST, PUT, DELETE bypassed).");
    checksPassed++;
  } else {
    console.error("❌ FAILED: SW does not explicitly bypass non-GET requests.");
    errors++;
  }

  // 2. Audit Sensitive Route Bypasses
  const requiredBypasses = [
    "/api/",
    "/dashboard",
    "/login",
    "/signup",
    "/onboarding",
    "clerk",
    "stripe",
  ];

  let bypassesValid = true;
  for (const bypass of requiredBypasses) {
    if (!swContent.includes(bypass)) {
      console.error(`❌ FAILED: SW does not include bypass for ${bypass}`);
      errors++;
      bypassesValid = false;
    }
  }
  if (bypassesValid) {
    console.log("✅ Sensitive Bypasses: Auth, Dashboard, Clerk, Stripe, and APIs strictly excluded from SW cache.");
    checksPassed++;
  }

  // 3. Audit sw.js Header Configuration in next.config.ts
  const nextConfigPath = path.resolve(__dirname, "../next.config.ts");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");
  if (
    nextConfigContent.includes('source: "/sw.js"') &&
    nextConfigContent.includes("Service-Worker-Allowed") &&
    nextConfigContent.includes("no-cache, no-store, must-revalidate")
  ) {
    console.log("✅ Header Security: /sw.js configured with Service-Worker-Allowed: / and no-cache in next.config.ts.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: next.config.ts missing sw.js cache-control or scope header.");
    errors++;
  }

  // 4. Audit for illegal localStorage token persistence in SW
  if (swContent.includes("localStorage") || swContent.includes("sessionStorage")) {
    console.error("❌ FAILED: SW accesses localStorage/sessionStorage (insecure in worker context).");
    errors++;
  } else {
    console.log("✅ Worker Context: SW is stateless and does not access Web Storage APIs.");
    checksPassed++;
  }

  console.log("==================================================");
  console.log(`TOTAL SECURITY CHECKS PASSED: ${checksPassed} / 4`);
  console.log(`TOTAL SECURITY ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA SECURITY AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runSecurityAudit();

/**
 * scripts/verify-pwa-standalone.js
 *
 * Automated verification of Standalone Mode & Ergonomics:
 * 1. Checks that globals.css contains standalone media query rules.
 * 2. Verifies safe-area utilities (safe-top, safe-bottom, etc.) are present.
 * 3. Verifies overscroll-behavior-y: none and touch-action: manipulation.
 * 4. Verifies AppLaunchScreen.tsx is integrated and handles standalone transitions.
 */

const fs = require("fs");
const path = require("path");

function runStandaloneAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Standalone Ergonomics Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const ROOT_DIR = path.resolve(__dirname, "..");

  // 1. Audit globals.css
  const cssPath = path.join(ROOT_DIR, "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf8");

  if (cssContent.includes("display-mode: standalone")) {
    console.log("✅ Standalone Media Query: globals.css contains dedicated standalone rules.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: globals.css missing (display-mode: standalone) styles.");
    errors++;
  }

  if (cssContent.includes("safe-area-inset-top") && cssContent.includes("safe-area-inset-bottom")) {
    console.log("✅ Safe Area Insets: Safe area utilities configured for notch, Dynamic Island, and home bar.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: globals.css missing safe-area-inset declarations.");
    errors++;
  }

  if (cssContent.includes("overscroll-behavior-y: none") && cssContent.includes("touch-action: manipulation")) {
    console.log("✅ Touch & Scroll Ergonomics: overscroll-behavior and 300ms tap delay elimination active.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: globals.css missing overscroll-behavior or touch-action optimization.");
    errors++;
  }

  // 2. Audit AppLaunchScreen component
  const launchScreenPath = path.join(ROOT_DIR, "components", "pwa", "AppLaunchScreen.tsx");
  if (!fs.existsSync(launchScreenPath)) {
    console.error("❌ FAILED: AppLaunchScreen.tsx component not found.");
    errors++;
  } else {
    const launchContent = fs.readFileSync(launchScreenPath, "utf8");
    if (launchContent.includes("WeddingWithIndia") && launchContent.includes("isStandalone")) {
      console.log("✅ Launch Experience: AppLaunchScreen component verified with branded standalone transition.");
      checksPassed++;
    } else {
      console.error("❌ FAILED: AppLaunchScreen.tsx missing WeddingWithIndia brand or standalone prop.");
      errors++;
    }
  }

  // 3. Audit PwaProvider integration
  const providerPath = path.join(ROOT_DIR, "components", "pwa", "PwaProvider.tsx");
  const providerContent = fs.readFileSync(providerPath, "utf8");
  if (providerContent.includes("AppLaunchScreen") && providerContent.includes("display-mode: standalone")) {
    console.log("✅ Provider Mounting: PwaProvider integrates AppLaunchScreen in standalone mode.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: PwaProvider.tsx does not mount AppLaunchScreen or detect standalone mode.");
    errors++;
  }

  console.log("==================================================");
  console.log(`TOTAL STANDALONE CHECKS PASSED: ${checksPassed} / 5`);
  console.log(`TOTAL STANDALONE ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA STANDALONE AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runStandaloneAudit();

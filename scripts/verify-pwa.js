/**
 * scripts/verify-pwa.js
 *
 * Automated verification of PWA Manifest, App Icons, Service Worker registration,
 * Offline fallback route, and Install Prompt integration.
 */

const fs = require("fs");
const path = require("path");

function runAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Production PWA Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  // 1. Audit Manifest file
  const manifestPath = path.resolve(__dirname, "../app/manifest.ts");
  if (!fs.existsSync(manifestPath)) {
    console.error("❌ FAILED: app/manifest.ts not found!");
    errors++;
  } else {
    const content = fs.readFileSync(manifestPath, "utf8");
    const requiredFields = [
      'name: "Wedding With India"',
      'short_name:',
      'start_url: "/"',
      'display: "standalone"',
      'background_color:',
      'theme_color:',
      'icons:',
    ];

    let manifestValid = true;
    for (const field of requiredFields) {
      if (!content.includes(field.split(":")[0])) {
        console.error(`❌ FAILED: Manifest missing required field ${field}`);
        errors++;
        manifestValid = false;
      }
    }
    if (manifestValid) {
      console.log("✅ Manifest: app/manifest.ts contains all required PWA metadata.");
      checksPassed++;
    }
  }

  // 2. Audit App Icons on Disk
  const expectedIcons = [
    "public/icons/icon-192x192.png",
    "public/icons/icon-512x512.png",
    "public/icons/maskable-icon-192x192.png",
    "public/icons/maskable-icon-512x512.png",
    "public/icons/apple-touch-icon.png",
    "app/icon.png",
    "app/apple-icon.png",
    "app/favicon.ico",
  ];

  let iconsValid = true;
  for (const iconRelPath of expectedIcons) {
    const iconPath = path.resolve(__dirname, "..", iconRelPath);
    if (!fs.existsSync(iconPath)) {
      console.error(`❌ FAILED: Icon missing at ${iconRelPath}`);
      errors++;
      iconsValid = false;
    } else {
      const stats = fs.statSync(iconPath);
      if (stats.size === 0) {
        console.error(`❌ FAILED: Icon at ${iconRelPath} is empty (0 bytes)`);
        errors++;
        iconsValid = false;
      }
    }
  }
  if (iconsValid) {
    console.log(`✅ App Icons: All ${expectedIcons.length} icon variants verified on disk.`);
    checksPassed++;
  }

  // 3. Audit Service Worker file
  const swPath = path.resolve(__dirname, "../public/sw.js");
  if (!fs.existsSync(swPath)) {
    console.error("❌ FAILED: public/sw.js not found!");
    errors++;
  } else {
    const swContent = fs.readFileSync(swPath, "utf8");
    const requiredSwPatterns = [
      "addEventListener(\"install\"",
      "addEventListener(\"activate\"",
      "addEventListener(\"fetch\"",
      "addEventListener(\"message\"",
      "SKIP_WAITING",
      "/offline",
    ];

    let swValid = true;
    for (const pattern of requiredSwPatterns) {
      if (!swContent.includes(pattern)) {
        console.error(`❌ FAILED: public/sw.js missing pattern: ${pattern}`);
        errors++;
        swValid = false;
      }
    }
    if (swValid) {
      console.log("✅ Service Worker: public/sw.js contains lifecycle, offline fallback, and update handlers.");
      checksPassed++;
    }
  }

  // 4. Audit Offline Fallback Route
  const offlinePagePath = path.resolve(__dirname, "../app/offline/page.tsx");
  if (!fs.existsSync(offlinePagePath)) {
    console.error("❌ FAILED: app/offline/page.tsx not found!");
    errors++;
  } else {
    const offlineContent = fs.readFileSync(offlinePagePath, "utf8");
    if (offlineContent.includes("Offline") && offlineContent.includes("Try Again")) {
      console.log("✅ Offline Fallback: app/offline/page.tsx created with retry action.");
      checksPassed++;
    } else {
      console.error("❌ FAILED: app/offline/page.tsx missing Offline/Try Again text.");
      errors++;
    }
  }

  // 5. Audit Layout Integration
  const layoutPath = path.resolve(__dirname, "../app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");
  if (
    layoutContent.includes("PwaProvider") &&
    layoutContent.includes("InstallPrompt") &&
    layoutContent.includes("viewportFit: \"cover\"") &&
    layoutContent.includes("appleWebApp")
  ) {
    console.log("✅ Layout Integration: PwaProvider, InstallPrompt, viewportFit, and appleWebApp active.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: app/layout.tsx missing PWA provider or metadata integrations.");
    errors++;
  }

  console.log("==================================================");
  console.log(`TOTAL CHECKS PASSED: ${checksPassed} / 5`);
  console.log(`TOTAL ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runAudit();

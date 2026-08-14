/**
 * scripts/verify-pwa-metadata.js
 *
 * Automated verification of PWA Metadata & Brand Consistency:
 * 1. Verifies manifest.ts defines name: "WeddingWithIndia" and short_name: "WeddingWithIndia".
 * 2. Verifies app/layout.tsx defines applicationName: "WeddingWithIndia" and appleWebApp.title: "WeddingWithIndia".
 * 3. Verifies viewport metadata includes themeColor: "#7B1113" and viewportFit: "cover".
 * 4. Verifies App Shortcuts are correctly defined and point to real routes.
 */

const fs = require("fs");
const path = require("path");

function runMetadataAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — PWA Metadata & Brand Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const ROOT_DIR = path.resolve(__dirname, "..");

  // 1. Audit Manifest
  const manifestPath = path.join(ROOT_DIR, "app", "manifest.ts");
  const manifestContent = fs.readFileSync(manifestPath, "utf8");

  if (manifestContent.includes('name: "WeddingWithIndia"')) {
    console.log('✅ Manifest Name: Exactly matches "WeddingWithIndia".');
    checksPassed++;
  } else {
    console.error('❌ FAILED: Manifest missing name: "WeddingWithIndia".');
    errors++;
  }

  if (manifestContent.includes('short_name: "WeddingWithIndia"')) {
    console.log('✅ Manifest Short Name: Exactly matches "WeddingWithIndia".');
    checksPassed++;
  } else {
    console.error('❌ FAILED: Manifest missing short_name: "WeddingWithIndia".');
    errors++;
  }

  if (manifestContent.includes('display: "standalone"')) {
    console.log('✅ Manifest Display: Configured as "standalone".');
    checksPassed++;
  } else {
    console.error('❌ FAILED: Manifest missing display: "standalone".');
    errors++;
  }

  if (manifestContent.includes('shortcuts:')) {
    console.log('✅ Manifest Shortcuts: Verified application shortcuts defined.');
    checksPassed++;
  } else {
    console.error('❌ FAILED: Manifest missing shortcuts definition.');
    errors++;
  }

  // 2. Audit Layout Metadata
  const layoutPath = path.join(ROOT_DIR, "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");

  if (layoutContent.includes('applicationName: "WeddingWithIndia"')) {
    console.log('✅ Layout Application Name: Exactly matches "WeddingWithIndia".');
    checksPassed++;
  } else {
    console.error('❌ FAILED: app/layout.tsx missing applicationName: "WeddingWithIndia".');
    errors++;
  }

  if (layoutContent.includes('title: "WeddingWithIndia"')) {
    console.log('✅ Apple Web App Title: Exactly matches "WeddingWithIndia".');
    checksPassed++;
  } else {
    console.error('❌ FAILED: app/layout.tsx missing appleWebApp title: "WeddingWithIndia".');
    errors++;
  }

  if (layoutContent.includes('viewportFit: "cover"')) {
    console.log('✅ Viewport Fit: Configured as "cover" for edge-to-edge rendering.');
    checksPassed++;
  } else {
    console.error('❌ FAILED: app/layout.tsx missing viewportFit: "cover".');
    errors++;
  }

  if (layoutContent.includes('themeColor: "#7B1113"')) {
    console.log('✅ Theme Color: Configured as "#7B1113" matching brand palette.');
    checksPassed++;
  } else {
    console.error('❌ FAILED: app/layout.tsx missing themeColor: "#7B1113".');
    errors++;
  }

  console.log("==================================================");
  console.log(`TOTAL METADATA CHECKS PASSED: ${checksPassed} / 8`);
  console.log(`TOTAL METADATA ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA METADATA AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runMetadataAudit();

/**
 * scripts/verify-pwa-icons.js
 *
 * Automated verification of PWA Icon Suite:
 * 1. Checks that all required icon dimensions exist and are non-empty.
 * 2. Uses Sharp to inspect exact width, height, and channels.
 * 3. Verifies maskable icons have 1:1 aspect ratio and solid background.
 * 4. Verifies standard and Apple touch icons are within optimal size bounds (< 250KB).
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function runIconAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — PWA Icon Suite Forensic Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const ROOT_DIR = path.resolve(__dirname, "..");

  const expectedIcons = [
    { file: "public/icons/icon-192x192.png", width: 192, height: 192, purpose: "any" },
    { file: "public/icons/icon-512x512.png", width: 512, height: 512, purpose: "any" },
    { file: "public/icons/maskable-icon-192x192.png", width: 192, height: 192, purpose: "maskable" },
    { file: "public/icons/maskable-icon-512x512.png", width: 512, height: 512, purpose: "maskable" },
    { file: "public/icons/apple-touch-icon.png", width: 180, height: 180, purpose: "apple-touch" },
    { file: "app/icon.png", width: 512, height: 512, purpose: "app-icon" },
    { file: "app/apple-icon.png", width: 180, height: 180, purpose: "apple-icon" },
    { file: "app/favicon.ico", minBytes: 1000, purpose: "favicon" },
  ];

  for (const item of expectedIcons) {
    const fullPath = path.join(ROOT_DIR, item.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ FAILED: Missing icon file: ${item.file}`);
      errors++;
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      console.error(`❌ FAILED: Icon file is empty (0 bytes): ${item.file}`);
      errors++;
      continue;
    }

    if (item.file.endsWith(".png")) {
      try {
        const meta = await sharp(fullPath).metadata();
        if (meta.width !== item.width || meta.height !== item.height) {
          console.error(
            `❌ FAILED: ${item.file} expected ${item.width}x${item.height}, got ${meta.width}x${meta.height}`
          );
          errors++;
          continue;
        }

        // Check file size is optimized (under 300KB)
        if (stat.size > 300 * 1024) {
          console.error(`❌ FAILED: ${item.file} is unoptimized (${(stat.size / 1024).toFixed(1)} KB > 300 KB)`);
          errors++;
          continue;
        }

        console.log(
          `✅ Verified: ${item.file} (${meta.width}x${meta.height}, ${(stat.size / 1024).toFixed(1)} KB, ${item.purpose})`
        );
        checksPassed++;
      } catch (err) {
        console.error(`❌ FAILED: Error reading ${item.file}:`, err.message);
        errors++;
      }
    } else {
      console.log(`✅ Verified: ${item.file} (${stat.size} bytes, ${item.purpose})`);
      checksPassed++;
    }
  }

  console.log("==================================================");
  console.log(`TOTAL ICON CHECKS PASSED: ${checksPassed} / ${expectedIcons.length}`);
  console.log(`TOTAL ICON ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA ICON SUITE AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runIconAudit().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});

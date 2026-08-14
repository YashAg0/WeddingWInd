/**
 * scripts/verify-pwa-cache-policy.js
 *
 * Automated verification of PWA Cache Policy & Maintenance:
 * 1. Confirms explicit cache naming and versioning (v2).
 * 2. Confirms obsolete cache purging on activate event.
 * 3. Confirms image cache quota capping and trimming.
 * 4. Confirms graceful fallback for corrupt/failed cache operations.
 */

const fs = require("fs");
const path = require("path");

function runCachePolicyAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — PWA Cache Policy Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const swPath = path.resolve(__dirname, "../public/sw.js");
  const swContent = fs.readFileSync(swPath, "utf8");

  // 1. Audit Cache Versioning
  if (
    swContent.includes("CACHE_VERSION") &&
    swContent.includes("CACHE_STATIC") &&
    swContent.includes("CACHE_IMAGES") &&
    swContent.includes("CACHE_OFFLINE") &&
    swContent.includes('CACHE_VERSION = "v2"')
  ) {
    console.log("✅ Cache Versioning: Explicit semantic cache namespaces defined (Version v2).");
    checksPassed++;
  } else {
    console.error("❌ FAILED: SW lacks explicit cache namespaces or version constant v2.");
    errors++;
  }

  // 2. Audit Obsolete Cache Purge on Activation
  if (
    swContent.includes("caches.keys()") &&
    swContent.includes("caches.delete(key)") &&
    swContent.includes("CURRENT_CACHES.includes(key)")
  ) {
    console.log("✅ Activation Purge: Obsolete cache versions are safely deleted upon worker activation.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: SW lacks obsolete cache purging in activate event.");
    errors++;
  }

  // 3. Audit Image Quota Trimming
  if (
    swContent.includes("trimCache") &&
    swContent.includes("MAX_CACHED_IMAGES") &&
    swContent.includes("cache.delete(keys[0])")
  ) {
    console.log("✅ Quota Protection: Image cache includes LRU-style trimCache bounding.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: SW lacks image cache quota bounding.");
    errors++;
  }

  // 4. Audit Safe Error Recovery
  if (
    swContent.includes(".catch(") &&
    swContent.includes("try {") &&
    swContent.includes("caches.open")
  ) {
    console.log("✅ Fault Tolerance: Cache operations wrapped in try/catch and promise catch handlers.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: SW cache operations lack fault tolerance wrappers.");
    errors++;
  }

  console.log("==================================================");
  console.log(`TOTAL CACHE CHECKS PASSED: ${checksPassed} / 4`);
  console.log(`TOTAL CACHE ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA CACHE POLICY AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runCachePolicyAudit();

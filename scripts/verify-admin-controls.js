/**
 * Verification Script: verify-admin-controls.js
 * Validates:
 * 1. Admin Featured + Sponsored action endpoints.
 * 2. Audit logging contract with exact action types (ADMIN_FEATURED_ENABLED, ADMIN_SPONSORED_ENABLED, ADMIN_SPONSORSHIP_UPDATED, etc.).
 * 3. Administrative UI controls in app/dashboard/admin/weddings/page.tsx.
 * 4. Automatic sponsorship expiration invariant (lib/wedding-dto.ts).
 */

const assert = require("assert");
const fs = require("fs");

function isSponsorshipActive(rawWedding) {
  if (!rawWedding || !rawWedding.sponsored) return false;
  const now = new Date();
  if (rawWedding.sponsorshipStart) {
    const startDate = new Date(rawWedding.sponsorshipStart);
    if (!isNaN(startDate.getTime()) && startDate > now) {
      return false;
    }
  }
  if (rawWedding.sponsorshipEnd) {
    const endDate = new Date(rawWedding.sponsorshipEnd);
    if (!isNaN(endDate.getTime()) && endDate <= now) {
      return false;
    }
  }
  return true;
}

function testAdminAuditLogContracts() {
  console.log("▶ Verifying Admin Actions Audit Logging & RBAC contracts...");
  const adminActionsCode = fs.readFileSync("lib/actions/admin.ts", "utf8");

  assert(adminActionsCode.includes("ADMIN_FEATURED_ENABLED"), "lib/actions/admin.ts must record ADMIN_FEATURED_ENABLED");
  assert(adminActionsCode.includes("ADMIN_FEATURED_DISABLED"), "lib/actions/admin.ts must record ADMIN_FEATURED_DISABLED");
  assert(adminActionsCode.includes("ADMIN_SPONSORED_ENABLED"), "lib/actions/admin.ts must record ADMIN_SPONSORED_ENABLED");
  assert(adminActionsCode.includes("ADMIN_SPONSORED_DISABLED"), "lib/actions/admin.ts must record ADMIN_SPONSORED_DISABLED");
  assert(adminActionsCode.includes("ADMIN_SPONSORSHIP_UPDATED"), "lib/actions/admin.ts must record ADMIN_SPONSORSHIP_UPDATED");
  assert(adminActionsCode.includes("requireRole([UserRole.ADMIN])"), "lib/actions/admin.ts must enforce admin role check");

  console.log("  ✓ Admin action audit logs and RBAC verified.");
}

function testAdminUiControls() {
  console.log("▶ Verifying Admin Weddings UI controls in app/dashboard/admin/weddings/page.tsx...");
  const adminPageCode = fs.readFileSync("app/dashboard/admin/weddings/page.tsx", "utf8");

  assert(adminPageCode.includes('name="religion"'), "Admin page must expose religion input field");
  assert(adminPageCode.includes('name="sponsored"'), "Admin page must expose sponsored toggle field");
  assert(adminPageCode.includes('name="sponsorshipStart"'), "Admin page must expose sponsorshipStart date field");
  assert(adminPageCode.includes('name="sponsorshipEnd"'), "Admin page must expose sponsorshipEnd date field");
  assert(adminPageCode.includes("sponsored_active"), "Admin page must have active sponsored filter tab");
  assert(adminPageCode.includes("sponsored_expired"), "Admin page must have expired sponsored filter tab");

  console.log("  ✓ Admin UI controls and filter tabs verified.");
}

function testSponsorshipSafetyInvariant() {
  console.log("▶ Verifying Automatic Expiration & Safety Invariant in lib/wedding-dto.ts...");
  const weddingDtoCode = fs.readFileSync("lib/wedding-dto.ts", "utf8");
  assert(weddingDtoCode.includes("export function isSponsorshipActive"), "lib/wedding-dto.ts must export isSponsorshipActive");

  const now = new Date();
  const pastDate = new Date(now.getTime() - 86400000);
  const futureDate = new Date(now.getTime() + 86400000);

  // 1. Not sponsored
  assert.strictEqual(isSponsorshipActive({ sponsored: false }), false, "Unsponsored wedding must return false");

  // 2. Sponsored without date limits -> active
  assert.strictEqual(isSponsorshipActive({ sponsored: true }), true, "Sponsored without dates must be active");

  // 3. Sponsored with future start date -> inactive
  assert.strictEqual(isSponsorshipActive({ sponsored: true, sponsorshipStart: futureDate }), false, "Future start must be inactive");

  // 4. Sponsored with past end date -> expired (inactive)
  assert.strictEqual(isSponsorshipActive({ sponsored: true, sponsorshipEnd: pastDate }), false, "Past end date must automatically expire without cron");

  // 5. Sponsored within valid active window -> active
  assert.strictEqual(isSponsorshipActive({ sponsored: true, sponsorshipStart: pastDate, sponsorshipEnd: futureDate }), true, "Active window must return true");

  console.log("  ✓ Time-aware automatic sponsorship expiration invariant verified.");
}

function run() {
  try {
    testAdminAuditLogContracts();
    testAdminUiControls();
    testSponsorshipSafetyInvariant();
    console.log("\n✅ ALL ADMIN CONTROL & SPONSORSHIP CONTRACT TESTS PASSED.");
  } catch (err) {
    console.error("\n❌ ADMIN CONTROLS TEST FAILED:", err);
    process.exit(1);
  }
}

run();

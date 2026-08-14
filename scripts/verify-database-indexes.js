/**
 * Verification Script: verify-database-indexes.js
 * Validates:
 * 1. Compound database indexes in prisma/schema.prisma for scale and performance.
 */

const assert = require("assert");
const fs = require("fs");

function testSchemaIndexes() {
  console.log("▶ Verifying compound indexes in prisma/schema.prisma...");
  const schemaCode = fs.readFileSync("prisma/schema.prisma", "utf8");

  assert(schemaCode.includes("@@index([status, suspended, deletedAt, date])"), "Wedding model must have [status, suspended, deletedAt, date] compound index");
  assert(schemaCode.includes("@@index([status, featured, sponsored])"), "Wedding model must have [status, featured, sponsored] compound index");
  assert(schemaCode.includes("@@index([sponsored, sponsorshipStart, sponsorshipEnd])"), "Wedding model must have [sponsored, sponsorshipStart, sponsorshipEnd] compound index");
  assert(schemaCode.includes("@@index([religion])"), "Wedding model must have [religion] index");
  assert(schemaCode.includes("@@index([category])"), "Wedding model must have [category] index");
  assert(schemaCode.includes("@@index([pricePerGuest])"), "Wedding model must have [pricePerGuest] index");
  assert(schemaCode.includes("@@index([status, type])"), "Review model must have [status, type] compound index");
  assert(schemaCode.includes("@@index([status, createdAt])"), "ContactSubmission model must have [status, createdAt] compound index");
  assert(schemaCode.includes("@@index([action, createdAt])"), "AuditLog model must have [action, createdAt] compound index");

  console.log("  ✓ All compound database indexes verified in schema.prisma.");
}

function run() {
  try {
    testSchemaIndexes();
    console.log("\n✅ ALL DATABASE INDEX TESTS PASSED.");
  } catch (err) {
    console.error("\n❌ DATABASE INDEXES TEST FAILED:", err);
    process.exit(1);
  }
}

run();

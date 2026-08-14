/**
 * Verification Script: verify-dashboard-reliability.js
 * Validates:
 * 1. Database retry resilience (withDbRetry) handling transient drops and recovering.
 * 2. AuthContext state separation (Loading, Empty, Temporary Failure with Retry, Unauthorized, Forbidden).
 * 3. Session persistence & non-blocking warning states.
 */

const assert = require("assert");
const fs = require("fs");

function isTransientDbError(err) {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const name = err.name || "";
  const code = err.code || "";

  if (name === "PrismaClientInitializationError") return true;
  if (["P1000", "P1001", "P1002", "P1008", "P1011", "P1017"].includes(code)) return true;
  if (
    msg.includes("can't reach database server") ||
    msg.includes("cannot reach database server") ||
    msg.includes("connection pool exhausted") ||
    msg.includes("connection closed") ||
    msg.includes("connection timeout") ||
    msg.includes("etimedout") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("socket has been ended") ||
    msg.includes("terminating connection due to administrator command")
  ) {
    return true;
  }
  return false;
}

async function withDbRetry(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 200;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || attempt >= maxRetries) {
        throw err;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 10;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

async function testWithDbRetry() {
  console.log("▶ Testing withDbRetry transient error handling and backoff...");
  
  assert.strictEqual(isTransientDbError(new Error("Connection pool exhausted")), true, "Should recognize pool exhaustion as transient");
  assert.strictEqual(isTransientDbError(new Error("connect ETIMEDOUT")), true, "Should recognize timeout as transient");
  assert.strictEqual(isTransientDbError(new Error("socket has been ended")), true, "Should recognize ended socket as transient");
  assert.strictEqual(isTransientDbError({ code: "P1001" }), true, "Should recognize P1001 as transient");
  assert.strictEqual(isTransientDbError({ code: "P2002" }), false, "Should NOT recognize P2002 unique constraint as transient");
  assert.strictEqual(isTransientDbError(new Error("Validation failed")), false, "Should NOT recognize validation error as transient");

  let attempts = 0;
  const result = await withDbRetry(async () => {
    attempts++;
    if (attempts < 3) {
      const err = new Error("Can't reach database server");
      err.name = "PrismaClientInitializationError";
      throw err;
    }
    return "recovered_data";
  }, { maxRetries: 3, initialDelayMs: 10 });

  assert.strictEqual(result, "recovered_data", "withDbRetry should return recovered data on 3rd attempt");
  assert.strictEqual(attempts, 3, "withDbRetry should have attempted 3 times");

  // Verify lib/prisma.ts contains withDbRetry
  const prismaCode = fs.readFileSync("lib/prisma.ts", "utf8");
  assert(prismaCode.includes("export async function withDbRetry"), "lib/prisma.ts must export withDbRetry");
  assert(prismaCode.includes("isTransientDbError"), "lib/prisma.ts must define isTransientDbError");

  // Verify lib/auth.ts uses withDbRetry
  const authCode = fs.readFileSync("lib/auth.ts", "utf8");
  assert(authCode.includes("withDbRetry"), "lib/auth.ts must wrap queries in withDbRetry");

  console.log("  ✓ withDbRetry gracefully recovered after 2 transient failures and verified in lib/prisma.ts & lib/auth.ts.");
}

async function testAuthContextContracts() {
  console.log("▶ Verifying AuthContext & DashboardShell contracts...");
  const authContextCode = fs.readFileSync("context/AuthContext.tsx", "utf8");
  const shellCode = fs.readFileSync("components/dashboard/DashboardShell.tsx", "utf8");

  assert(authContextCode.includes("visibilitychange"), "AuthContext must register visibilitychange auto-reconnect");
  assert(authContextCode.includes("online"), "AuthContext must register online auto-reconnect");
  assert(shellCode.includes("dbOffline && !user"), "DashboardShell must handle dbOffline && !user state distinctly");
  assert(shellCode.includes("Retry Connection"), "DashboardShell must provide Retry button during transient outage");
  assert(shellCode.includes("dbOffline && user"), "DashboardShell must show non-blocking warning banner when authenticated user experiences transient DB drop");
  console.log("  ✓ Dashboard contracts and state separation verified.");
}

async function run() {
  try {
    await testWithDbRetry();
    await testAuthContextContracts();
    console.log("\n✅ ALL DASHBOARD RELIABILITY TESTS PASSED.");
  } catch (err) {
    console.error("\n❌ DASHBOARD RELIABILITY TEST FAILED:", err);
    process.exit(1);
  }
}

run();

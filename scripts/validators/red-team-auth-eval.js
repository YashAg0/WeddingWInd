/**
 * scripts/validators/red-team-auth-eval.js
 * Red-Team Evaluation of E2E Auth Security and Production Isolation.
 */

const { isE2ETestAuthEnabled, createE2ETestSessionToken, verifyE2ETestSessionToken } = require("../../lib/test-auth");

function testAuthIsolation() {
  console.log("================================================================================");
  console.log("RED-TEAM EVALUATION: E2E AUTH SECURITY & PRODUCTION ISOLATION");
  console.log("================================================================================");

  // Test 1: Production environment simulation
  const originalEnv = process.env.NODE_ENV;
  const originalPlaywright = process.env.PLAYWRIGHT_TEST;

  process.env.NODE_ENV = "production";
  delete process.env.PLAYWRIGHT_TEST;

  const prodEnabled = isE2ETestAuthEnabled();
  console.log("\n[Test 1] Production Environment Check:");
  console.log("  NODE_ENV: production, PLAYWRIGHT_TEST: undefined");
  console.log("  isE2ETestAuthEnabled() =>", prodEnabled);
  console.log("  Result:", prodEnabled === false ? "PASS (Disabled in Production)" : "FAIL (Active in Production!)");

  // Test 2: Token forging attempt with wrong secret
  const validToken = createE2ETestSessionToken("admin-123", "ADMIN", "admin@weddingwithindia.com");
  console.log("\n[Test 2] Valid Token Structure:", validToken.slice(0, 40) + "...");

  const parts = validToken.split(".");
  const forgedToken = `${parts[0]}.invalid_signature_tampered`;
  const forgedResult = verifyE2ETestSessionToken(forgedToken);
  console.log("  Tampered Token Verification =>", forgedResult);
  console.log("  Result:", forgedResult === null ? "PASS (Signature verification rejects tampering)" : "FAIL (Tampered token accepted!)");

  // Test 3: Expired Token
  const expiredPayload = {
    userId: "admin-123",
    role: "ADMIN",
    email: "admin@weddingwithindia.com",
    expiresAt: Date.now() - 10000, // in the past
  };
  const crypto = require("crypto");
  const E2E_SECRET = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";
  const jsonStr = JSON.stringify(expiredPayload);
  const base64Data = Buffer.from(jsonStr, "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", E2E_SECRET).update(base64Data).digest("base64url");
  const expiredToken = `${base64Data}.${signature}`;

  const expiredResult = verifyE2ETestSessionToken(expiredToken);
  console.log("\n[Test 3] Expired Token Verification =>", expiredResult);
  console.log("  Result:", expiredResult === null ? "PASS (Expired token rejected)" : "FAIL (Expired token accepted!)");

  // Restore env
  process.env.NODE_ENV = originalEnv;
  if (originalPlaywright) process.env.PLAYWRIGHT_TEST = originalPlaywright;

  console.log("\n================================================================================");
}

testAuthIsolation();

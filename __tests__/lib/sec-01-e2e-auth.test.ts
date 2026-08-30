/**
 * __tests__/lib/sec-01-e2e-auth.test.ts
 *
 * Unit tests for SEC-01: E2E Auth Bypass Remediation
 * Verifies that isE2ETestAuthEnabled() is strictly gated to
 * process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true".
 */

import {
  isE2ETestAuthEnabled,
  createE2ETestSessionToken,
  verifyE2ETestSessionToken,
} from "@/lib/test-auth";

describe("SEC-01: E2E Test Authentication Gating", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPlaywright = process.env.PLAYWRIGHT_TEST;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    if (originalPlaywright !== undefined) {
      process.env.PLAYWRIGHT_TEST = originalPlaywright;
    } else {
      delete process.env.PLAYWRIGHT_TEST;
    }
  });

  it("strictly disables E2E test auth when in production mode without PLAYWRIGHT_TEST", () => {
    (process.env as any).NODE_ENV = "production";
    delete process.env.PLAYWRIGHT_TEST;
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("strictly disables E2E test auth in production even if PLAYWRIGHT_TEST is 'true'", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.PLAYWRIGHT_TEST = "true";
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("strictly disables E2E test auth in development mode without PLAYWRIGHT_TEST", () => {
    (process.env as any).NODE_ENV = "development";
    delete process.env.PLAYWRIGHT_TEST;
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("strictly disables E2E test auth in test mode when PLAYWRIGHT_TEST is not set", () => {
    (process.env as any).NODE_ENV = "test";
    delete process.env.PLAYWRIGHT_TEST;
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("enables E2E test auth strictly when NODE_ENV is 'test' and PLAYWRIGHT_TEST is 'true'", () => {
    (process.env as any).NODE_ENV = "test";
    process.env.PLAYWRIGHT_TEST = "true";
    expect(isE2ETestAuthEnabled()).toBe(true);
  });

  it("creates and verifies valid E2E session tokens", () => {
    const token = createE2ETestSessionToken("user_admin_999", "ADMIN", "admin@test.com");
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const payload = verifyE2ETestSessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user_admin_999");
    expect(payload?.role).toBe("ADMIN");
    expect(payload?.email).toBe("admin@test.com");
    expect(payload?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects tampered or malformed tokens", () => {
    const validToken = createE2ETestSessionToken("user_1", "TRAVELER", "user1@test.com");
    const [body] = validToken.split(".");
    const tamperedToken = `${body}.tamperedsignature123`;

    expect(verifyE2ETestSessionToken(tamperedToken)).toBeNull();
    expect(verifyE2ETestSessionToken("invalid-token-without-parts")).toBeNull();
    expect(verifyE2ETestSessionToken("")).toBeNull();
  });
});

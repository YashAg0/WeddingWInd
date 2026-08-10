/**
 * __tests__/lib/auth-db-availability.test.ts
 *
 * Behavioral tests for Database Availability (R3) & Fail-Closed Database Auth (R4).
 *
 * What these tests verify at the behavior level:
 * 1. isDatabaseAvailable() returns true when the DB query succeeds.
 * 2. isDatabaseAvailable() caches success — no redundant DB queries within the window.
 * 3. isDatabaseAvailable() returns false when the query fails.
 * 4. isDatabaseAvailable() does NOT cache failures — immediate retries are allowed.
 * 5. syncAndGetDbUser() throws SERVICE_UNAVAILABLE when the DB is offline (fail-closed).
 * 6. syncAndGetDbUser() returns null, never a synthetic fallback user, when DB is offline.
 * 7. isAdmin() returns false (not throws) when DB is offline — safe check API contract.
 * 8. requireAuth() propagates SERVICE_UNAVAILABLE when the DB is offline.
 * 9. requireRole([ADMIN]) propagates SERVICE_UNAVAILABLE when the DB is offline.
 *
 * Architecture Invariants verified at source level (contractual, not implementation detail):
 * 10. lib/prisma.ts exports clearDbAliveCache — required by tests and readiness reset logic.
 * 11. app/dashboard/admin/layout.tsx verifies ADMIN role and has a db-error path distinct from
 *     the admin_required redirect — DB failure must not be misclassified as authorization failure.
 * 12. app/api/readiness/route.ts uses isDatabaseAvailable() (not direct queries).
 * 13. lib/auth.ts enforces fail-closed with SERVICE_UNAVAILABLE and SEC-002 compliance.
 */

// Setup required environment variables for lib/env schema validation before importing lib/prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/test?pgbouncer=true";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_123";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_123";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_123";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123";
process.env.UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET || "sk_123";
process.env.UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID || "app_123";
process.env.GUEST_PASS_ENCRYPTION_KEY = process.env.GUEST_PASS_ENCRYPTION_KEY || "378e1bf771d5a5f1c9ab06ed4d48065a3bac7e8a995ef8a0a9437fd40a547a54";
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com";

import { isDatabaseAvailable, clearDbAliveCache, prisma } from "@/lib/prisma";
import { syncAndGetDbUser, isAdmin, requireAuth, requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Mock Clerk auth & currentUser
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn().mockResolvedValue({ userId: "clerk_test_123" }),
  currentUser: jest.fn().mockResolvedValue({
    id: "clerk_test_123",
    emailAddresses: [{ emailAddress: "founder@weddingwithindia.com" }],
    firstName: "Founder",
    lastName: "Admin",
    imageUrl: "https://example.com/avatar.jpg",
  }),
}));

describe("Database Availability (R3) — isDatabaseAvailable", () => {
  beforeEach(() => {
    clearDbAliveCache();
    jest.clearAllMocks();
  });

  it("returns true when database query succeeds", async () => {
    jest.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([{ "?column?": 1 }]);
    const available = await isDatabaseAvailable();
    expect(available).toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("caches successful status — no redundant DB queries within the 15-second window", async () => {
    const spy = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([{ "?column?": 1 }]);

    const first = await isDatabaseAvailable();
    expect(first).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);

    // Second call within cache window: must NOT query DB again
    const second = await isDatabaseAvailable();
    expect(second).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1); // still 1 — cache was hit
  });

  it("returns false when the database query fails (connection error)", async () => {
    jest.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(
      new Error("connect ECONNREFUSED 127.0.0.1:5432")
    );
    const available = await isDatabaseAvailable();
    expect(available).toBe(false);
  });

  it("does NOT cache failures — subsequent calls retry the database immediately", async () => {
    const spy = jest.spyOn(prisma, "$queryRaw");

    // First call: DB offline
    spy.mockRejectedValueOnce(new Error("Connection refused"));
    const firstCall = await isDatabaseAvailable();
    expect(firstCall).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);

    // Second call immediately after: must retry (cache was cleared on failure)
    spy.mockResolvedValueOnce([{ "?column?": 1 }]);
    const secondCall = await isDatabaseAvailable();
    expect(secondCall).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2); // retried
  });
});

describe("Fail-Closed Database Auth (R4) — lib/auth.ts", () => {
  beforeEach(() => {
    clearDbAliveCache();
    jest.clearAllMocks();
  });

  it("syncAndGetDbUser() throws SERVICE_UNAVAILABLE when the DB transaction fails (fail-closed)", async () => {
    // syncAndGetDbUser() attempts the $transaction directly — no separate health pre-ping.
    jest.spyOn(prisma, "$transaction").mockRejectedValueOnce(
      new Error("Can't reach database server")
    );

    await expect(syncAndGetDbUser()).rejects.toThrow(
      "SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly."
    );
  });

  it("syncAndGetDbUser() does NOT return a user object when the DB is offline — result must be null and an error must be thrown", async () => {
    jest.spyOn(prisma, "$transaction").mockRejectedValueOnce(
      new Error("Can't reach database server")
    );

    let result: any = null;
    let thrownError: any = null;
    try {
      result = await syncAndGetDbUser();
    } catch (err) {
      thrownError = err;
    }

    // Must throw, not silently return a synthetic user
    expect(result).toBeNull();
    expect(thrownError).toBeDefined();
    expect(thrownError.message).toContain("SERVICE_UNAVAILABLE");
    // The thrown error must NOT contain role/permission data that could be used for access
    expect(thrownError.message).not.toContain("ADMIN");
    expect(thrownError.message).not.toContain("TRAVELER");
  });

  it("isAdmin() returns false (does not throw) when the database is offline", async () => {
    // isAdmin() calls getDbUser() which returns null on DB error — behavioral contract.
    jest.spyOn(prisma.user, "findUnique").mockRejectedValueOnce(new Error("DB Down") as any);

    const adminCheck = await isAdmin();
    // Must return false, never true, on DB failure — fail-closed
    expect(adminCheck).toBe(false);
  });

  it("requireAuth() propagates SERVICE_UNAVAILABLE when DB is offline", async () => {
    jest.spyOn(prisma, "$transaction").mockRejectedValueOnce(
      new Error("Can't reach database server")
    );

    await expect(requireAuth()).rejects.toThrow("SERVICE_UNAVAILABLE");
  });

  it("requireRole([UserRole.ADMIN]) propagates SERVICE_UNAVAILABLE when DB is offline — admin access not granted", async () => {
    jest.spyOn(prisma, "$transaction").mockRejectedValueOnce(
      new Error("Can't reach database server")
    );

    // Must throw SERVICE_UNAVAILABLE, not grant ADMIN access on DB failure
    await expect(requireRole([UserRole.ADMIN])).rejects.toThrow("SERVICE_UNAVAILABLE");
  });
});

describe("Architecture Invariants", () => {
  const fs = require("fs");
  const path = require("path");

  it("lib/prisma.ts exports clearDbAliveCache — required by tests and retry logic", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/prisma.ts"),
      "utf-8"
    );
    // Behavioral requirement: clearDbAliveCache must be exported
    expect(source).toContain("export function clearDbAliveCache");
    // Must clear the cache on call (not just export empty function)
    expect(source).toContain("dbAliveCache = null");
  });

  it("lib/prisma.ts does NOT use Promise.race() for DB health checks — prevents connection leaks", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/prisma.ts"),
      "utf-8"
    );
    // Promise.race() with a timeout creates orphaned Prisma connections that continue
    // running after the timeout fires, exhausting the PgBouncer pool.
    // We check for actual usage: Promise.race([...]) — the call syntax with an array argument.
    // The comment text may reference "Promise.race()" in documentation but must not invoke it.
    expect(source).not.toMatch(/Promise\.race\(\[/);
  });

  it("app/dashboard/admin/layout.tsx: DB failure is NOT classified as admin_required — separate code paths required", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../app/dashboard/admin/layout.tsx"),
      "utf-8"
    );

    // Must check ADMIN role (required for server-authoritative RBAC)
    expect(source).toContain("ADMIN");
    // Must redirect non-admins with admin_required
    expect(source).toContain("admin_required");
    // Must have a separate error path for DB failures (dbError variable or equivalent)
    // This ensures DB failure → service-unavailable, not admin_required
    expect(source).toContain("dbError");
    // Must NOT skip role checks
    expect(source).not.toContain("// skip role check");
  });

  it("app/api/readiness/route.ts uses isDatabaseAvailable() for readiness probes", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../app/api/readiness/route.ts"),
      "utf-8"
    );
    expect(source).toContain("isDatabaseAvailable()");
  });

  it("lib/auth.ts enforces fail-closed: throws SERVICE_UNAVAILABLE on DB failure, marked SEC-002", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/auth.ts"),
      "utf-8"
    );
    // Must throw SERVICE_UNAVAILABLE (not silently return synthetic user)
    expect(source).toContain("SERVICE_UNAVAILABLE");
    // Must be documented as SEC-002 compliance
    expect(source).toContain("SEC-002");
    // Must NOT return a mock/synthetic/Guest user on DB failure
    expect(source).not.toContain("Guest User");
    expect(source).not.toContain("mockUser");
  });

  it("lib/actions/index.ts does NOT use pre-ping isDatabaseAvailable with aggressive timeouts before actual queries — this pattern causes connection leaks", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );
    // The pre-ping pattern with sub-second timeouts (300ms, 1500ms) on Supabase Sydney
    // (4000ms+ cold connection) always fails on cold start, leaks the connection,
    // and leaves the pool exhausted for the actual auth transaction.
    expect(source).not.toContain("isDatabaseAvailable(300)");
    expect(source).not.toContain("isDatabaseAvailable(1500)");
    // Also must not use the general isDatabaseAvailable pre-ping before actual queries
    // (the function is fine for health endpoints, not for pre-gating data queries)
    expect(source).not.toContain("isDatabaseAvailable(500)");
  });
});

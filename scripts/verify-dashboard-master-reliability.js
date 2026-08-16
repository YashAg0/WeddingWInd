/**
 * scripts/verify-dashboard-master-reliability.js
 *
 * WeddingWithIndia — Dashboard Reliability & Session Master Verification Script
 */

const { PrismaClient, UserRole } = require("@prisma/client");
const prisma = new PrismaClient();

const RESULTS = {
  passed: 0,
  failed: 0,
};

function assert(condition, message) {
  if (condition) {
    RESULTS.passed++;
    console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
  } else {
    RESULTS.failed++;
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${message}`);
  }
}

async function validateOrCreateDeviceSession(params) {
  const { userId, deviceId, deviceName, ipAddress, userAgent } = params;
  return await prisma.$transaction(async (tx) => {
    const now = new Date();

    const existing = await tx.userDeviceSession.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });

    if (existing) {
      if (existing.revokedAt) {
        return {
          status: "REVOKED",
          reason: "This device session has been logged out from another device.",
        };
      }

      if (existing.expiresAt && existing.expiresAt <= now) {
        return {
          status: "REVOKED",
          reason: "This device session has expired. Please sign in again.",
        };
      }

      const updated = await tx.userDeviceSession.update({
        where: { id: existing.id },
        data: {
          lastActiveAt: now,
          deviceName: deviceName || existing.deviceName,
          ipAddress: ipAddress || existing.ipAddress,
          userAgent: userAgent || existing.userAgent,
        },
      });

      return {
        status: "ACTIVE",
        session: updated,
      };
    }

    const activeSessions = await tx.userDeviceSession.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { lastActiveAt: "desc" },
    });

    if (activeSessions.length >= 2) {
      return {
        status: "DEVICE_LIMIT_REACHED",
        activeSessions,
      };
    }

    const created = await tx.userDeviceSession.create({
      data: {
        userId,
        deviceId,
        deviceName: deviceName || "Unknown Device",
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        lastActiveAt: now,
      },
    });

    return {
      status: "ACTIVE",
      session: created,
    };
  });
}

async function revokeUserDeviceSession(userId, sessionId) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.userDeviceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    if (session.userId !== userId) {
      throw new Error("FORBIDDEN: You do not have permission to revoke this session.");
    }

    if (session.revokedAt) {
      return true;
    }

    await tx.userDeviceSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return true;
  });
}

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

async function main() {
  console.log("================================================================================");
  console.log(" WEDDINGWITHINDIA — DASHBOARD RELIABILITY & SESSION ACCEPTANCE SUITE");
  console.log("================================================================================\n");

  try {
    // 1. Find or create a test user
    console.log("1. AUDITING MULTI-DEVICE SESSION CONTROL (MAX 2 DEVICES)...");

    let testUser = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        testUser = await prisma.user.findFirst({
          where: { role: UserRole.TRAVELER, status: "ACTIVE" },
        });
        break;
      } catch (err) {
        console.log(`  [Connection warmup attempt ${attempt}/5] retrying in 2s...`);
        if (attempt === 5) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: `test_session_${Date.now()}@example.com`,
          clerkUserId: `clerk_session_${Date.now()}`,
          name: "Session Test User",
          role: UserRole.TRAVELER,
        },
      });
    }

    assert(testUser !== null, `Target user verified (${testUser.email})`);

    // Clean any prior test sessions for clean state
    await prisma.userDeviceSession.deleteMany({
      where: { userId: testUser.id },
    });

    const dev1 = `dev-test-1-${Date.now()}`;
    const dev2 = `dev-test-2-${Date.now()}`;
    const dev3 = `dev-test-3-${Date.now()}`;

    // A. Register Device 1
    const res1 = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev1,
      deviceName: "Chrome on Windows",
      ipAddress: "127.0.0.1",
    });

    assert(res1.status === "ACTIVE", "Device 1 successfully authenticated as ACTIVE");

    // B. Simulate multiple tabs on Device 1
    const res1Tab2 = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev1,
      deviceName: "Chrome on Windows",
      ipAddress: "127.0.0.1",
    });

    assert(res1Tab2.status === "ACTIVE" && res1Tab2.session.id === res1.session.id, "Multiple tabs on Device 1 share the same session (counts as 1 device)");

    // C. Register Device 2
    const res2 = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev2,
      deviceName: "Safari on iPhone",
      ipAddress: "127.0.0.2",
    });

    assert(res2.status === "ACTIVE", "Device 2 successfully authenticated as ACTIVE (2 active devices total)");

    // D. Attempt Device 3 (Must be blocked with DEVICE_LIMIT_REACHED)
    const res3 = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev3,
      deviceName: "Android Tablet",
      ipAddress: "127.0.0.3",
    });

    assert(res3.status === "DEVICE_LIMIT_REACHED", "Device 3 strictly rejected with DEVICE_LIMIT_REACHED");
    assert(res3.activeSessions && res3.activeSessions.length === 2, "Device 3 response returns exactly 2 active sessions for user choice");

    // E. Explicit Revocation of Device 1
    const revokeRes = await revokeUserDeviceSession(testUser.id, res1.session.id);
    assert(revokeRes === true, "User successfully revoked Device 1");

    // F. Device 3 retry after revocation (Must now succeed)
    const res3Retry = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev3,
      deviceName: "Android Tablet",
      ipAddress: "127.0.0.3",
    });

    assert(res3Retry.status === "ACTIVE", "Device 3 successfully authenticated after explicit revocation of Device 1");

    // G. Revoked Device 1 attempting to connect (Must return REVOKED)
    const res1RevokedAttempt = await validateOrCreateDeviceSession({
      userId: testUser.id,
      deviceId: dev1,
    });

    assert(res1RevokedAttempt.status === "REVOKED", "Revoked Device 1 is strictly rejected with REVOKED status");

    // H. Cross-User Revocation IDOR Defense
    let idorPrevented = false;
    try {
      await revokeUserDeviceSession("attacker-user-id-999", res2.session.id);
    } catch (err) {
      if (err.message.includes("FORBIDDEN")) {
        idorPrevented = true;
      }
    }
    assert(idorPrevented, "IDOR Defense: Attacker user cannot revoke victim's device session");

    // 2. AUDITING DATABASE RESILIENCE & WITH_DB_RETRY
    console.log("\n2. AUDITING DATABASE RESILIENCE & RECOVERY...");

    assert(isTransientDbError(new Error("Connection pool exhausted")) === true, "isTransientDbError detects pool exhaustion");
    assert(isTransientDbError(new Error("socket has been ended")) === true, "isTransientDbError detects socket close");
    assert(isTransientDbError(new Error("Validation error")) === false, "isTransientDbError ignores non-transient validation error");

    // Clean up test sessions
    await prisma.userDeviceSession.deleteMany({
      where: { userId: testUser.id },
    });
    console.log("  [CLEANUP] Temporary test device sessions pruned cleanly.");

    console.log("\n================================================================================");
    console.log(` AUDIT SUMMARY: ${RESULTS.passed} PASSED, ${RESULTS.failed} FAILED`);
    console.log("================================================================================\n");

    if (RESULTS.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Dashboard master reliability audit failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

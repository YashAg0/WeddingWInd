/**
 * __tests__/lib/dashboard-reliability-and-sessions.test.ts
 *
 * WeddingWithIndia — Dashboard Reliability, Admin Availability, and Multi-Device Session Control Test Suite
 */

import {
  validateOrCreateDeviceSession,
  revokeUserDeviceSession,
} from "@/lib/services/device-session";
import { isTransientDbError, withDbRetry } from "@/lib/prisma";


// Mock Prisma
jest.mock("@/lib/prisma", () => {
  const original = jest.requireActual("@/lib/prisma");
  return {
    ...original,
    prisma: {
      userDeviceSession: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => {
        const txPrisma = {
          userDeviceSession: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
          user: {
            findUnique: jest.fn(),
          },
        };
        return callback(txPrisma);
      }),
    },
  };
});

describe("Pillar: Multi-Device Session Control (Max 2 Devices)", () => {
  const mockUserId = "user-123";
  const device1 = "device-uuid-1";
  const device2 = "device-uuid-2";
  const device3 = "device-uuid-3";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. First device registers successfully and becomes ACTIVE", async () => {
    const { prisma } = require("@/lib/prisma");
    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue({
            id: "session-1",
            userId: mockUserId,
            deviceId: device1,
            deviceName: "Chrome on Windows",
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
            lastActiveAt: new Date(),
            createdAt: new Date(),
            revokedAt: null,
            expiresAt: null,
          }),
        },
      });
    });

    const res = await validateOrCreateDeviceSession({
      userId: mockUserId,
      deviceId: device1,
      deviceName: "Chrome on Windows",
    });

    expect(res.status).toBe("ACTIVE");
    if (res.status === "ACTIVE") {
      expect(res.session.deviceId).toBe(device1);
      expect(res.session.isCurrent).toBe(true);
    }
  });

  test("2. Multiple tabs on the same device share the same deviceId and update lastActiveAt (Counts as 1 device)", async () => {
    const { prisma } = require("@/lib/prisma");
    const existingSession = {
      id: "session-1",
      userId: mockUserId,
      deviceId: device1,
      deviceName: "Chrome on Windows",
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      lastActiveAt: new Date(Date.now() - 60000),
      createdAt: new Date(Date.now() - 60000),
      revokedAt: null,
      expiresAt: null,
    };

    const updateMock = jest.fn().mockResolvedValue({
      ...existingSession,
      lastActiveAt: new Date(),
    });

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(existingSession),
          update: updateMock,
        },
      });
    });

    const res = await validateOrCreateDeviceSession({
      userId: mockUserId,
      deviceId: device1,
    });

    expect(res.status).toBe("ACTIVE");
    expect(updateMock).toHaveBeenCalled();
  });

  test("3. Second device registers successfully (2 active devices total)", async () => {
    const { prisma } = require("@/lib/prisma");
    const active1 = {
      id: "session-1",
      userId: mockUserId,
      deviceId: device1,
      deviceName: "Windows PC",
      lastActiveAt: new Date(),
      createdAt: new Date(),
      revokedAt: null,
      expiresAt: null,
    };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([active1]),
          create: jest.fn().mockResolvedValue({
            id: "session-2",
            userId: mockUserId,
            deviceId: device2,
            deviceName: "iPhone",
            lastActiveAt: new Date(),
            createdAt: new Date(),
            revokedAt: null,
            expiresAt: null,
          }),
        },
      });
    });

    const res = await validateOrCreateDeviceSession({
      userId: mockUserId,
      deviceId: device2,
      deviceName: "iPhone",
    });

    expect(res.status).toBe("ACTIVE");
    if (res.status === "ACTIVE") {
      expect(res.session.deviceId).toBe(device2);
    }
  });

  test("4. Third device is REJECTED with DEVICE_LIMIT_REACHED and returns active sessions list without kicking existing devices", async () => {
    const { prisma } = require("@/lib/prisma");
    const activeSessions = [
      {
        id: "session-1",
        userId: mockUserId,
        deviceId: device1,
        deviceName: "Windows PC",
        ipAddress: "1.1.1.1",
        userAgent: "Chrome",
        lastActiveAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
        expiresAt: null,
      },
      {
        id: "session-2",
        userId: mockUserId,
        deviceId: device2,
        deviceName: "iPhone",
        ipAddress: "2.2.2.2",
        userAgent: "Safari",
        lastActiveAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
        expiresAt: null,
      },
    ];

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue(activeSessions),
        },
      });
    });

    const res = await validateOrCreateDeviceSession({
      userId: mockUserId,
      deviceId: device3,
      deviceName: "Android Tablet",
    });

    expect(res.status).toBe("DEVICE_LIMIT_REACHED");
    if (res.status === "DEVICE_LIMIT_REACHED") {
      expect(res.activeSessions.length).toBe(2);
      expect(res.activeSessions.map((s) => s.id)).toEqual(["session-1", "session-2"]);
    }
  });

  test("5. Explicit revocation of active session succeeds and permits new device login", async () => {
    const { prisma } = require("@/lib/prisma");
    const sessionToRevoke = {
      id: "session-1",
      userId: mockUserId,
      deviceId: device1,
      revokedAt: null,
    };

    const updateMock = jest.fn().mockResolvedValue({
      ...sessionToRevoke,
      revokedAt: new Date(),
    });

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(sessionToRevoke),
          update: updateMock,
        },
      });
    });

    const success = await revokeUserDeviceSession(mockUserId, "session-1");
    expect(success).toBe(true);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "session-1" },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      })
    );
  });

  test("6. IDOR Defense: User A cannot revoke User B's device session", async () => {
    const { prisma } = require("@/lib/prisma");
    const victimSession = {
      id: "session-victim",
      userId: "victim-user-id",
      deviceId: "victim-device",
      revokedAt: null,
    };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(victimSession),
        },
      });
    });

    await expect(revokeUserDeviceSession("attacker-user-id", "session-victim")).rejects.toThrow(
      "FORBIDDEN: You do not have permission to revoke this session."
    );
  });

  test("7. Revoked session is denied and returns REVOKED status", async () => {
    const { prisma } = require("@/lib/prisma");
    const revokedSession = {
      id: "session-1",
      userId: mockUserId,
      deviceId: device1,
      revokedAt: new Date(),
    };

    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        userDeviceSession: {
          findUnique: jest.fn().mockResolvedValue(revokedSession),
        },
      });
    });

    const res = await validateOrCreateDeviceSession({
      userId: mockUserId,
      deviceId: device1,
    });

    expect(res.status).toBe("REVOKED");
    if (res.status === "REVOKED") {
      expect(res.reason).toContain("logged out from another device");
    }
  });
});

describe("Pillar: Database Resilience & Auth ≠ Database Separation", () => {
  test("1. isTransientDbError identifies connection pool and network errors", () => {
    expect(isTransientDbError(new Error("Connection pool exhausted"))).toBe(true);
    expect(isTransientDbError(new Error("Can't reach database server at aws-0.pooler.supabase.com:5432"))).toBe(true);
    expect(isTransientDbError({ name: "PrismaClientInitializationError", message: "Timeout" })).toBe(true);
    expect(isTransientDbError({ code: "P1001", message: "Can't reach database server" })).toBe(true);
    expect(isTransientDbError(new Error("Validation failed for field 'title'"))).toBe(false);
    expect(isTransientDbError(new Error("UNAUTHORIZED: Invalid credentials"))).toBe(false);
  });

  test("2. withDbRetry retries transient database errors and succeeds on recovery", async () => {
    let callCount = 0;
    const transientOperation = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Connection pool exhausted");
      }
      return { success: true, data: "recovered" };
    });

    const res = await withDbRetry(transientOperation, { maxRetries: 3, initialDelayMs: 1 });
    expect(res).toEqual({ success: true, data: "recovered" });
    expect(callCount).toBe(2);
  });

  test("3. withDbRetry fails fast on non-transient business/validation errors without retrying", async () => {
    let callCount = 0;
    const businessOperation = jest.fn().mockImplementation(async () => {
      callCount++;
      throw new Error("Validation Error: Invalid wedding date");
    });

    await expect(withDbRetry(businessOperation, { maxRetries: 3, initialDelayMs: 1 })).rejects.toThrow(
      "Validation Error: Invalid wedding date"
    );
    expect(callCount).toBe(1);
  });
});

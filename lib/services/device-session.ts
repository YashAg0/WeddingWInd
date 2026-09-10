import { prisma, withDbRetry } from "@/lib/prisma";

export const MAX_ACTIVE_DEVICES_PER_USER = 2;

export interface DeviceSessionDTO {
  id: string;
  deviceId: string;
  deviceName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  isCurrent?: boolean;
}

export type DeviceValidationResult =
  | { status: "ACTIVE"; session: DeviceSessionDTO }
  | { status: "REVOKED"; reason: string }
  | { status: "DEVICE_LIMIT_REACHED"; activeSessions: DeviceSessionDTO[] };

/**
 * Validates an existing device session or creates a new one,
 * enforcing maximum 2 active devices per account atomically.
 */
export async function validateOrCreateDeviceSession(params: {
  userId: string;
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<DeviceValidationResult> {
  const { userId, deviceId, deviceName, ipAddress, userAgent } = params;

  if (!userId || !deviceId) {
    throw new Error("Missing required parameters for device session validation.");
  }

  return await withDbRetry(async () => {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      // 1. Check if a session already exists for this (userId, deviceId)
      const existing = await tx.userDeviceSession.findUnique({
        where: {
          userId_deviceId: {
            userId,
            deviceId,
          },
        },
      });

      if (existing) {
        // If session was revoked by user from another device
        if (existing.revokedAt) {
          return {
            status: "REVOKED",
            reason: "This device session has been logged out from another device.",
          };
        }

        // If session expired
        if (existing.expiresAt && existing.expiresAt <= now) {
          return {
            status: "REVOKED",
            reason: "This device session has expired. Please sign in again.",
          };
        }

        // Active existing session (e.g. multiple tabs or returning user on same device) -> update lastActiveAt
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
          session: {
            id: updated.id,
            deviceId: updated.deviceId,
            deviceName: updated.deviceName,
            ipAddress: updated.ipAddress,
            userAgent: updated.userAgent,
            lastActiveAt: updated.lastActiveAt,
            createdAt: updated.createdAt,
            isCurrent: true,
          },
        };
      }

      // 2. New device attempting to authenticate. Query currently active sessions.
      // Lock user record or query active sessions with strict filter.
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

      // 3. Enforce maximum 2 active devices
      if (activeSessions.length >= MAX_ACTIVE_DEVICES_PER_USER) {
        return {
          status: "DEVICE_LIMIT_REACHED",
          activeSessions: activeSessions.map((s) => ({
            id: s.id,
            deviceId: s.deviceId,
            deviceName: s.deviceName,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            lastActiveAt: s.lastActiveAt,
            createdAt: s.createdAt,
            isCurrent: false,
          })),
        };
      }

      // 4. Create or update new device session idempotently
      let sessionRecord = null;
      if (typeof tx.userDeviceSession.upsert === "function") {
        sessionRecord = await tx.userDeviceSession.upsert({
          where: {
            userId_deviceId: {
              userId,
              deviceId,
            },
          },
          create: {
            userId,
            deviceId,
            deviceName: deviceName || "Unknown Device",
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            lastActiveAt: now,
          },
          update: {
            lastActiveAt: now,
            revokedAt: null,
            deviceName: deviceName || undefined,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
          },
        });
      } else {
        const existingSession = await tx.userDeviceSession.findUnique({
          where: {
            userId_deviceId: {
              userId,
              deviceId,
            },
          },
        });
        if (existingSession) {
          sessionRecord = await tx.userDeviceSession.update({
            where: { id: existingSession.id },
            data: {
              lastActiveAt: now,
              revokedAt: null,
              deviceName: deviceName || undefined,
              ipAddress: ipAddress || undefined,
              userAgent: userAgent || undefined,
            },
          });
        } else {
          sessionRecord = await tx.userDeviceSession.create({
            data: {
              userId,
              deviceId,
              deviceName: deviceName || "Unknown Device",
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
              lastActiveAt: now,
            },
          });
        }
      }

      return {
        status: "ACTIVE",
        session: {
          id: sessionRecord.id,
          deviceId: sessionRecord.deviceId,
          deviceName: sessionRecord.deviceName,
          ipAddress: sessionRecord.ipAddress,
          userAgent: sessionRecord.userAgent,
          lastActiveAt: sessionRecord.lastActiveAt,
          createdAt: sessionRecord.createdAt,
          isCurrent: true,
        },
      };
    }, { maxWait: 20000, timeout: 60000 });
  }, { label: "validateOrCreateDeviceSession" });
}

/**
 * Lists all active device sessions for a user.
 */
export async function getActiveUserDeviceSessions(userId: string, currentDeviceId?: string): Promise<DeviceSessionDTO[]> {
  const now = new Date();
  const sessions = await withDbRetry(async () => {
    return await prisma.userDeviceSession.findMany({
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
  }, { label: "getActiveUserDeviceSessions" });

  return sessions.map((s) => ({
    id: s.id,
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    lastActiveAt: s.lastActiveAt,
    createdAt: s.createdAt,
    isCurrent: currentDeviceId ? s.deviceId === currentDeviceId : false,
  }));
}

/**
 * Explicitly revokes a device session.
 * Enforces ownership: users can only revoke their own sessions.
 */
export async function revokeUserDeviceSession(userId: string, sessionId: string): Promise<boolean> {
  if (!userId || !sessionId) {
    throw new Error("Missing parameters for session revocation.");
  }

  return await withDbRetry(async () => {
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
        return true; // Already revoked
      }

      await tx.userDeviceSession.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });

      return true;
    }, { maxWait: 10000, timeout: 20000 });
  }, { label: "revokeUserDeviceSession" });
}


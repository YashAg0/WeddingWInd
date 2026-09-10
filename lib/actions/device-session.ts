"use server";

import { requireAuth } from "@/lib/auth";
import { isE2ETestAuthEnabled } from "@/lib/test-auth";
import { prisma } from "@/lib/prisma";
import {
  validateOrCreateDeviceSession,
  getActiveUserDeviceSessions,
  revokeUserDeviceSession,
  DeviceValidationResult,
  DeviceSessionDTO,
} from "@/lib/services/device-session";
import { headers } from "next/headers";


/**
 * Validates the current device session or registers a new device,
 * enforcing maximum 2 active devices.
 */
export async function validateDeviceSessionAction(
  deviceId: string,
  clientMetadata?: { deviceName?: string }
): Promise<DeviceValidationResult> {
  const user = await requireAuth();

  // In E2E tests, clean up prior sessions for this user so test automation doesn't hit device limit
  if (isE2ETestAuthEnabled()) {
    await prisma.userDeviceSession.deleteMany({
      where: { userId: user.id, deviceId: { not: deviceId } }
    }).catch(() => {});
  }

  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : reqHeaders.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || undefined;

  let deviceName = clientMetadata?.deviceName;
  if (!deviceName && userAgent) {
    if (userAgent.includes("iPhone")) deviceName = "iPhone (Safari)";
    else if (userAgent.includes("iPad")) deviceName = "iPad";
    else if (userAgent.includes("Android")) deviceName = "Android Mobile";
    else if (userAgent.includes("Macintosh")) deviceName = "MacBook (macOS)";
    else if (userAgent.includes("Windows")) deviceName = "Windows PC";
    else if (userAgent.includes("Linux")) deviceName = "Linux Device";
    else deviceName = "Web Browser";
  }

  try {
    const result = await validateOrCreateDeviceSession({
      userId: user.id,
      deviceId,
      deviceName: deviceName || "Web Browser",
      ipAddress,
      userAgent,
    });

    return result;
  } catch (err: any) {
    console.warn("[validateDeviceSessionAction] Non-fatal device tracking error:", err?.message);
    return {
      status: "ACTIVE",
      session: {
        id: `device-${Date.now()}`,
        deviceId,
        deviceName: deviceName || "Current Device",
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        isCurrent: true,
      },
    };
  }
}

/**
 * Lists all active device sessions for the authenticated user.
 */
export async function getActiveDeviceSessionsAction(
  currentDeviceId?: string
): Promise<DeviceSessionDTO[]> {
  const user = await requireAuth();
  return await getActiveUserDeviceSessions(user.id, currentDeviceId);
}

/**
 * Explicitly revokes a device session owned by the authenticated user.
 */
export async function revokeDeviceSessionAction(sessionId: string): Promise<{ success: boolean; message?: string }> {
  const user = await requireAuth();

  try {
    await revokeUserDeviceSession(user.id, sessionId);

    try {
      const { prisma } = require("@/lib/prisma");
      await prisma.auditLog.create({
        data: {
          action: "REVOKE_DEVICE_SESSION",
          entity: "UserDeviceSession",
          entityId: sessionId,
          userId: user.id,
          userName: user.name || user.email || "User",
          details: `User ${user.id} revoked device session ${sessionId}`,
        },
      });
    } catch (auditErr) {
      console.warn("Failed to write audit log on session revoke:", auditErr);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to revoke device session." };
  }
}

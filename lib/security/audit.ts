import { prisma } from "../prisma";
import { UserRole } from "@prisma/client";

/**
 * Structured Audit Logger for high-risk system actions.
 * Logs sensitive events to standard output (for Datadog/CloudWatch)
 * and to the database (for internal dashboard review).
 */
export class AuditLogger {
  static async logAdminAction(
    adminId: string,
    action: string,
    entity: string,
    entityId: string,
    details: string,
    metadata?: Record<string, any>
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "AUDIT",
      actorId: adminId,
      action,
      entity,
      entityId,
      details,
      metadata,
    };

    // 1. Log to structured output (CloudWatch/Datadog ingest)
    console.info(JSON.stringify(logEntry));

    // 2. Persist to Postgres for internal admin traceability
    try {
      const adminUser = await prisma.user.findUnique({
        where: { id: adminId },
        select: { name: true, email: true, role: true },
      });

      if (!adminUser || adminUser.role !== UserRole.ADMIN) {
        console.warn(`[AuditLogger] Non-admin user attempted an admin action: ${adminId}`);
      }

      await prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          userId: adminId,
          userName: adminUser?.name || adminUser?.email || "Unknown Admin",
          details: JSON.stringify({ summary: details, ...metadata }),
        },
      });
    } catch (dbError) {
      console.error("[AuditLogger] Failed to persist audit log to database:", dbError);
    }
  }

  static async logSystemAction(
    action: string,
    entity: string,
    entityId: string,
    details: string,
    metadata?: Record<string, any>
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "AUDIT",
      actorId: "SYSTEM",
      action,
      entity,
      entityId,
      details,
      metadata,
    };

    console.info(JSON.stringify(logEntry));

    try {
      await prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          userId: "system",
          userName: "System Process",
          details: JSON.stringify({ summary: details, ...metadata }),
        },
      });
    } catch (dbError) {
      console.error("[AuditLogger] Failed to persist system log to database:", dbError);
    }
  }
}

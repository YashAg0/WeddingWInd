import { prisma } from "@/lib/prisma";
import { ReputationEntityType, ReputationEventType } from "@prisma/client";
import { recalculateTrustScore } from "./trust-score";

export interface LogEventParams {
  entityType: ReputationEntityType;
  entityId: string;
  type: ReputationEventType;
  scoreEffect: number;
  referenceId?: string;
  idempotencyKey: string;
}

/**
 * Logs a reputation event to the event ledger table.
 * Assures absolute idempotency using the idempotencyKey.
 * Recomputes the entity's trust score upon successful insertion.
 */
export async function logReputationEvent(params: LogEventParams): Promise<boolean> {
  const { entityType, entityId, type, scoreEffect, referenceId, idempotencyKey } = params;

  try {
    // 1. Log the event inside the database
    await prisma.reputationEvent.create({
      data: {
        entityType,
        entityId,
        type,
        scoreEffect,
        referenceId,
        idempotencyKey
      }
    });

    // 2. Trigger asynchronous recalculation of trust score for the entity
    // We run it synchronously here to ensure client reflects updates immediately.
    await recalculateTrustScore(entityType, entityId);

    return true;
  } catch (err: any) {
    // Check for unique key constraint violation in Prisma (P2002)
    if (err.code === "P2002") {
      console.log(`Reputation event ignored: idempotencyKey ${idempotencyKey} already exists.`);
      return false;
    }
    console.error("Error logging reputation event:", err);
    throw err;
  }
}

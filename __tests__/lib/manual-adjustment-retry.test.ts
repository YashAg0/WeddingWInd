/**
 * __tests__/lib/manual-adjustment-retry.test.ts
 *
 * Verification tests for Phase 14.8 Stable Mutation ID retry idempotency in admin Create Manual Reputation Adjustment Action.
 */

import { adminCreateManualReputationAdjustmentAction } from "@/lib/actions/admin";
import { logReputationEvent } from "@/lib/services/reputation";
import { ReputationEntityType } from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn().mockResolvedValue({ id: "admin-user-id", role: "ADMIN" }),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Admin Manual Reputation Adjustment - Stable Mutation ID & Retry Idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate server-side that mutationId is present and non-empty", async () => {
    await expect(
      adminCreateManualReputationAdjustmentAction({
        entityType: ReputationEntityType.WEDDING,
        entityId: "wedding-id",
        scoreEffect: 10,
        reason: "Valid reason for adjustment",
        mutationId: "",
      })
    ).rejects.toThrow("INVALID_MUTATION_ID: A stable mutation identifier must be provided.");

    await expect(
      adminCreateManualReputationAdjustmentAction({
        entityType: ReputationEntityType.WEDDING,
        entityId: "wedding-id",
        scoreEffect: 10,
        reason: "Valid reason for adjustment",
        mutationId: "   ",
      })
    ).rejects.toThrow("INVALID_MUTATION_ID: A stable mutation identifier must be provided.");
  });

  it("should generate a deterministic idempotency key using adminUserId and mutationId", async () => {
    (logReputationEvent as jest.Mock).mockResolvedValue(true);

    await adminCreateManualReputationAdjustmentAction({
      entityType: ReputationEntityType.WEDDING,
      entityId: "wedding-id",
      scoreEffect: 10,
      reason: "Valid reason for adjustment",
      mutationId: "mut-12345",
    });

    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "MANUAL_ADJUSTMENT:admin-user-id:mut-12345:WEDDING:wedding-id",
      })
    );
  });

  it("should allow two intentional adjustments with identical inputs when mutationIds are different", async () => {
    (logReputationEvent as jest.Mock).mockResolvedValue(true);

    // First adjustment
    const res1 = await adminCreateManualReputationAdjustmentAction({
      entityType: ReputationEntityType.WEDDING,
      entityId: "wedding-id",
      scoreEffect: 10,
      reason: "Valid reason for adjustment",
      mutationId: "mut-abc",
    });

    // Second adjustment with identical arguments but different mutationId
    const res2 = await adminCreateManualReputationAdjustmentAction({
      entityType: ReputationEntityType.WEDDING,
      entityId: "wedding-id",
      scoreEffect: 10,
      reason: "Valid reason for adjustment",
      mutationId: "mut-def",
    });

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(logReputationEvent).toHaveBeenCalledTimes(2);
  });

  it("should block duplicate adjustments with the same mutationId (retry idempotency)", async () => {
    // Mock first call as successful, second call as duplicate (returning false)
    (logReputationEvent as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    // First call (original request)
    const res1 = await adminCreateManualReputationAdjustmentAction({
      entityType: ReputationEntityType.WEDDING,
      entityId: "wedding-id",
      scoreEffect: 10,
      reason: "Valid reason for adjustment",
      mutationId: "mut-retry-test",
    });

    // Second call (retry of the same request)
    const res2 = await adminCreateManualReputationAdjustmentAction({
      entityType: ReputationEntityType.WEDDING,
      entityId: "wedding-id",
      scoreEffect: 10,
      reason: "Valid reason for adjustment",
      mutationId: "mut-retry-test",
    });

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(false); // Deduplicated!
    expect(logReputationEvent).toHaveBeenCalledTimes(2);
  });
});

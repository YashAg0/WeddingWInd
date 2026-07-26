/**
 * __tests__/lib/reputation-events.test.ts
 *
 * Verification tests for Phase 14.7 Reputation Event deduplication, verification status updates,
 * and host payouts.
 */

import { adminProcessHostPayoutAction, adminReviewVerificationAction } from "@/lib/actions/admin";
import { logReputationEvent } from "@/lib/services/reputation";
import { evaluateEntityBadges } from "@/lib/services/badges";
import { prisma } from "@/lib/prisma";
import { VerificationStatus, UserRole } from "@prisma/client";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "admin-user-id", role: "ADMIN" }),
  requireRole: jest.fn().mockResolvedValue({ id: "admin-user-id", role: "ADMIN" }),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/services/badges", () => ({
  evaluateEntityBadges: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/actions/safety", () => ({
  isFinanciallyHeld: jest.fn().mockResolvedValue(false),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payout: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    verification: {
      update: jest.fn(),
    },
    notification: {
      create: jest.fn().mockResolvedValue({}),
    },
    userVerification: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(prisma);
    }),
  },
}));

describe("Reputation Events, Verifications & Payouts Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log PAYOUT_COMPLETED event for Host Couple on processed host payout", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: "payment-id",
      amount: 500,
      bookingId: "booking-id",
      booking: {
        traveler: { userId: "traveler-id" },
        weddingId: "wedding-id",
        wedding: {
          hostCoupleId: "host-couple-id",
          hostCouple: { userId: "host-user-id" },
        },
      },
    });

    (prisma.payout.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.payout.create as jest.Mock).mockResolvedValue({
      id: "payout-id",
    });

    await adminProcessHostPayoutAction("payment-id");

    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "HOST",
        entityId: "host-couple-id",
        type: "PAYOUT_COMPLETED",
        scoreEffect: 5,
        referenceId: "payout-id",
        idempotencyKey: "PAYOUT_COMPLETED:HOST:payout-id",
      })
    );
  });

  it("should trigger badge evaluation on admin verification status changes", async () => {
    (prisma.verification.update as jest.Mock).mockResolvedValue({
      id: "verification-id",
      userId: "user-id",
      user: {
        role: UserRole.COUPLE,
        coupleProfile: { id: "host-couple-id" },
      },
    });

    await adminReviewVerificationAction("verification-id", VerificationStatus.APPROVED, "Approved");

    expect(evaluateEntityBadges).toHaveBeenCalledWith("HOST", "host-couple-id");
  });
});

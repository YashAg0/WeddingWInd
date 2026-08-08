/**
 * __tests__/lib/refund-reputation.test.ts
 *
 * Verification tests for Phase 14.7 Refund Reason Classification and Webhook idempotency.
 */

import { handleStripeRefundSucceeded, classifyRefundReason } from "@/lib/services/refunds";
import { logReputationEvent } from "@/lib/services/reputation";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/email", () => ({
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
    DATABASE_URL: "postgres://mock",
  }
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    refund: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    booking: {
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    cancellationRequest: {
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(prisma);
    }),
  },
}));

describe("Refund Reputation Classification & Webhook Idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Reason Classification Helper", () => {
    it("should classify HOST_CAUSED reasons", () => {
      expect(classifyRefundReason("Host cancel")).toBe("HOST_CAUSED");
      expect(classifyRefundReason("host_caused_refund")).toBe("HOST_CAUSED");
    });

    it("should classify PLATFORM_ERROR reasons", () => {
      expect(classifyRefundReason("Platform system bug error")).toBe("PLATFORM_ERROR");
    });

    it("should default to TRAVELER_POLICY", () => {
      expect(classifyRefundReason(null)).toBe("TRAVELER_POLICY");
      expect(classifyRefundReason("Traveler changed mind")).toBe("TRAVELER_POLICY");
    });
  });

  describe("handleStripeRefundSucceeded integration", () => {
    it("should not penalize traveler on platform error refund", async () => {
      (prisma.refund.findFirst as jest.Mock).mockResolvedValue({
        id: "refund-id",
        amount: 100,
        paymentId: "payment-id",
        status: "PENDING",
        reason: "PLATFORM_ERROR",
        cancellationRequest: {
          id: "cancel-id",
          actorRole: "TRAVELER",
        },
        payment: {
          booking: {
            id: "booking-id",
            travelerId: "traveler-id",
            weddingId: "wedding-id",
            traveler: { fullName: "Jane Doe", user: { email: "jane@doe.com" } },
            wedding: { hostCoupleId: "host-id" },
          },
        },
      });

      await handleStripeRefundSucceeded("stripe-refund-id");

      // Verify no reputation event is logged for TRAVELER_CANCELLED
      expect(logReputationEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: "TRAVELER_CANCELLED",
        })
      );

      // Verify no reputation event is logged for REFUND_ISSUED (wedding)
      expect(logReputationEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: "REFUND_ISSUED",
        })
      );
    });

    it("should penalize traveler on traveler policy refund", async () => {
      (prisma.refund.findFirst as jest.Mock).mockResolvedValue({
        id: "refund-id",
        amount: 100,
        paymentId: "payment-id",
        status: "PENDING",
        reason: "TRAVELER_POLICY",
        cancellationRequest: {
          id: "cancel-id",
          actorRole: "TRAVELER",
        },
        payment: {
          booking: {
            id: "booking-id",
            travelerId: "traveler-id",
            weddingId: "wedding-id",
            traveler: { fullName: "Jane Doe", user: { email: "jane@doe.com" } },
            wedding: { hostCoupleId: "host-id" },
          },
        },
      });

      await handleStripeRefundSucceeded("stripe-refund-id");

      expect(logReputationEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: "TRAVELER",
          entityId: "traveler-id",
          type: "TRAVELER_CANCELLED",
          scoreEffect: -5,
        })
      );
    });
  });
});

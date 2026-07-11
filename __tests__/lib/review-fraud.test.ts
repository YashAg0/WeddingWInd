/**
 * __tests__/lib/review-fraud.test.ts
 *
 * Verification tests for Phase 14.7 HEURISTIC FRAUD DETECTION rules, Jaccard guard, and retaliation detection.
 */

import { evaluateReviewFraud } from "@/lib/services/review-fraud";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    safetyCase: {
      count: jest.fn().mockResolvedValue(0),
    },
    cancellationRequest: {
      count: jest.fn().mockResolvedValue(0),
    },
    refund: {
      count: jest.fn().mockResolvedValue(0),
    },
    guestCheckIn: {
      count: jest.fn().mockResolvedValue(1),
    },
  },
}));

describe("HEURISTIC FRAUD DETECTION Engine Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fail Jaccard similarity evaluation gracefully on empty comments", async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      traveler: { userId: "traveler-user-id" },
      wedding: {
        hostCouple: {
          userId: "host-user-id",
          user: { name: "Host Couple" },
        },
      },
    });

    (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.review.findMany as jest.Mock).mockResolvedValue([
      { id: "prev-id", comment: "" },
    ]);

    // Should not throw division by zero error
    const res = await evaluateReviewFraud(
      {
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 5,
        comment: "",
      },
      "traveler-user-id"
    );

    expect(res.detected).toBe(false);
  });

  it("should flag RETALIATION_PATTERN if safety cases, cancellation requests, or refunds are present", async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: "booking-id",
      traveler: { userId: "traveler-user-id" },
      wedding: {
        hostCouple: {
          userId: "host-user-id",
          user: { name: "Host Couple" },
        },
      },
    });

    (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.safetyCase.count as jest.Mock).mockResolvedValue(1);

    const res = await evaluateReviewFraud(
      {
        bookingId: "booking-id",
        travelerId: "traveler-id",
        rating: 1,
        comment: "Worst experience ever!",
      },
      "traveler-user-id"
    );

    const retaliationSignal = res.signals.find((s) => s.type === "RETALIATION_PATTERN");
    expect(retaliationSignal).toBeDefined();
    expect(retaliationSignal?.severity).toBe("HIGH");
    expect(retaliationSignal?.score).toBe(0.9);
  });
});

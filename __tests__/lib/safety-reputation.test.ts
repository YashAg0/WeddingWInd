/**
 * __tests__/lib/safety-reputation.test.ts
 *
 * Verification tests for Phase 14.7 Safety incident case open, resolved, upheld, and dismissed outcomes.
 */

import { reportIncidentAction, adminResolveCaseAction } from "@/lib/actions/safety";
import { logReputationEvent } from "@/lib/services/reputation";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn().mockResolvedValue({ id: "reporter-user-id", role: "TRAVELER" }),
  requireRole: jest.fn().mockResolvedValue({ id: "admin-user-id", role: "ADMIN" }),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    safetyCase: {
      create: jest.fn(),
      update: jest.fn(),
    },
    caseParticipant: {
      create: jest.fn(),
    },
    caseTimelineEvent: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(prisma);
    }),
  },
}));

describe("Safety Reputation Integration Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log SAFETY_CASE_OPENED reputation event when incident is reported against a host", async () => {
    (prisma.safetyCase.create as jest.Mock).mockResolvedValue({
      id: "case-id",
      subjectUserId: "host-user-id",
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "host-user-id",
      role: "COUPLE",
      coupleProfile: { id: "host-id" },
    });

    await reportIncidentAction({
      type: "HARASSMENT",
      title: "Safety Incident Title",
      description: "Incident details and evidence.",
      subjectUserId: "host-user-id",
    });

    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "HOST",
        entityId: "host-id",
        type: "SAFETY_CASE_OPENED",
        scoreEffect: -2,
        referenceId: "case-id",
        idempotencyKey: "SAFETY_CASE_OPENED:case-id",
      })
    );
  });

  it("should log SAFETY_CASE_UPHELD reputation event on admin UPHELD resolution", async () => {
    (prisma.safetyCase.update as jest.Mock).mockResolvedValue({
      id: "case-id",
      subjectUserId: "host-user-id",
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "host-user-id",
      role: "COUPLE",
      coupleProfile: { id: "host-id" },
    });

    await adminResolveCaseAction("case-id", "UPHELD", "Upheld case notes.");

    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "HOST",
        entityId: "host-id",
        type: "SAFETY_CASE_UPHELD",
        scoreEffect: -20,
        referenceId: "case-id",
        idempotencyKey: "SAFETY_CASE_UPHELD:case-id",
      })
    );
  });

  it("should log SAFETY_CASE_DISMISSED reputation event on admin DISMISSED resolution", async () => {
    (prisma.safetyCase.update as jest.Mock).mockResolvedValue({
      id: "case-id",
      subjectUserId: "host-user-id",
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "host-user-id",
      role: "COUPLE",
      coupleProfile: { id: "host-id" },
    });

    await adminResolveCaseAction("case-id", "DISMISSED", "Dismissed case notes.");

    expect(logReputationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "HOST",
        entityId: "host-id",
        type: "SAFETY_CASE_DISMISSED",
        scoreEffect: 2,
        referenceId: "case-id",
        idempotencyKey: "SAFETY_CASE_DISMISSED:case-id",
      })
    );
  });
});

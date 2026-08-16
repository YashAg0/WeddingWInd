/**
 * lib/actions/safety.ts
 *
 * Core Server Actions for Trust & Safety management, safety reports, cases,
 * user restrictions, wedding suspensions, appeals, and timeline trails.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import {
  UserRole,
  CaseType,
  CaseSeverity,
  CaseStatus,
  AppealStatus,
  RestrictionType,
  Prisma,
  BookingStatus,
  ReputationEntityType,
  ReputationEventType,
} from "@prisma/client";
import crypto from "crypto";
import { rateLimit } from "../rate-limit";
import { AuditLogger } from "../security/audit";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Restriction Assertions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if a user has an active restriction of the specified type.
 */
export async function checkUserRestriction(userId: string, type: RestrictionType): Promise<boolean> {
  const restriction = await prisma.userRestriction.findFirst({
    where: {
      userId,
      type,
      startsAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
      revokedAt: null,
    },
  });

  return !!restriction;
}

export async function assertCanBook(userId: string) {
  const restricted = await checkUserRestriction(userId, RestrictionType.BOOKING_RESTRICTED);
  if (restricted) throw new Error("RESTRICTED: Your account is restricted from booking events.");
}

export async function assertCanHost(userId: string) {
  const restricted = await checkUserRestriction(userId, RestrictionType.HOSTING_RESTRICTED);
  if (restricted) throw new Error("RESTRICTED: Your account is restricted from hosting weddings or managing events.");
}

export async function assertCanMessage(userId: string) {
  const restricted = await checkUserRestriction(userId, RestrictionType.MESSAGING_RESTRICTED);
  if (restricted) throw new Error("RESTRICTED: Your account is restricted from sending messages.");
}

export async function assertCanRequestPayout(userId: string) {
  const restricted = await checkUserRestriction(userId, RestrictionType.PAYOUT_RESTRICTED);
  if (restricted) throw new Error("RESTRICTED: Your account is restricted from requesting payouts.");
}

export async function assertCanUseAgentReferrals(userId: string) {
  const restricted = await checkUserRestriction(userId, RestrictionType.AGENT_REFERRAL_RESTRICTED);
  if (restricted) throw new Error("RESTRICTED: Your account is restricted from using referral features.");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Incident & Report Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a random public non-sequential case number: WWI-CASE-XXXXXX
 */
function generateCaseNumber(): string {
  const randomChars = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `WWI-CASE-${randomChars}`;
}

/**
 * Submits an incident safety report and initializes a SafetyCase record.
 */
export async function reportIncidentAction({
  type,
  title,
  description,
  bookingId,
  weddingId,
  subjectUserId,
  evidenceFiles,
}: {
  type: CaseType;
  title: string;
  description: string;
  bookingId?: string;
  weddingId?: string;
  subjectUserId?: string;
  evidenceFiles?: Array<{ fileUrl: string; fileKey?: string; mimeType: string; size: number }>;
}) {
  const user = await requireAuth();

  const { success: rateLimitOk } = await rateLimit("reportIncident", user.id, { limit: 3, window: 3600 });
  if (!rateLimitOk) {
    throw new Error("You have submitted too many safety reports. Please wait before submitting again.");
  }

  // Basic validation
  if (!title.trim() || !description.trim()) {
    throw new Error("Title and description are required to file a safety report.");
  }

  const caseNumber = generateCaseNumber();

  const safetyCase = await prisma.$transaction(async (tx) => {
    // 1. Create safety case in database
    const safetyCase = await tx.safetyCase.create({
      data: {
        caseNumber,
        type,
        severity: CaseSeverity.MEDIUM, // Default starting severity (triaged by admin later)
        status: CaseStatus.OPEN,
        bookingId: bookingId || null,
        weddingId: weddingId || null,
        reportedById: user.id,
        subjectUserId: subjectUserId || null,
        title,
        description,
      },
    });

    // 2. Add reporter as participant
    await tx.caseParticipant.create({
      data: {
        caseId: safetyCase.id,
        userId: user.id,
        role: "REPORTER",
      },
    });

    // 3. Add subject as participant if present
    if (subjectUserId) {
      await tx.caseParticipant.create({
        data: {
          caseId: safetyCase.id,
          userId: subjectUserId,
          role: "SUBJECT",
        },
      });
    }

    // 4. Save evidence records
    if (evidenceFiles && evidenceFiles.length > 0) {
      for (const f of evidenceFiles) {
        await tx.caseEvidence.create({
          data: {
            caseId: safetyCase.id,
            fileUrl: f.fileUrl,
            fileKey: f.fileKey || null,
            mimeType: f.mimeType,
            size: f.size,
            uploadedById: user.id,
          },
        });
      }
    }

    // 5. Create timeline event
    await tx.caseTimelineEvent.create({
      data: {
        caseId: safetyCase.id,
        actorId: user.id,
        eventType: "CASE_CREATED",
        safeSummary: `Safety report filed by reporter. Case number: ${caseNumber}`,
        metadata: JSON.stringify({ type, evidenceCount: evidenceFiles?.length || 0 }),
      },
    });

    return safetyCase;
  });

  if (safetyCase.subjectUserId) {
    const subjectUser = await prisma.user.findUnique({
      where: { id: safetyCase.subjectUserId },
      include: { travelerProfile: true, coupleProfile: true, agentProfile: true }
    });

    let subjectEntityType: ReputationEntityType | null = null;
    let subjectEntityId: string | null = null;

    if (subjectUser) {
      if (subjectUser.role === "TRAVELER" && subjectUser.travelerProfile) {
        subjectEntityType = ReputationEntityType.TRAVELER;
        subjectEntityId = subjectUser.travelerProfile.id;
      } else if (subjectUser.role === "COUPLE" && subjectUser.coupleProfile) {
        subjectEntityType = ReputationEntityType.HOST;
        subjectEntityId = subjectUser.coupleProfile.id;
      } else if (subjectUser.role === "AGENT" && subjectUser.agentProfile) {
        subjectEntityType = ReputationEntityType.AGENT;
        subjectEntityId = subjectUser.agentProfile.id;
      }
    }

    if (subjectEntityType && subjectEntityId) {
      const { logReputationEvent } = require("../services/reputation");
      await logReputationEvent({
        entityType: subjectEntityType,
        entityId: subjectEntityId,
        type: ReputationEventType.SAFETY_CASE_OPENED,
        scoreEffect: -2,
        referenceId: safetyCase.id,
        idempotencyKey: `SAFETY_CASE_OPENED:${safetyCase.id}`
      });
    }
  }

  return safetyCase;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Admin Investigation Controls
// ─────────────────────────────────────────────────────────────────────────────

export async function adminTriageCaseAction(
  caseId: string,
  severity: CaseSeverity,
  status: CaseStatus,
  assignedAdminId?: string | null
) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const safetyCase = await tx.safetyCase.findUnique({
      where: { id: caseId },
    });
    if (!safetyCase) throw new Error("Safety case not found.");

    const updated = await tx.safetyCase.update({
      where: { id: caseId },
      data: {
        severity,
        status,
        assignedAdminId: assignedAdminId || null,
      },
    });

    // Write timeline trace
    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        actorId: admin.id,
        eventType: "CASE_TRIAGED",
        safeSummary: `Case severity updated to ${severity}, status set to ${status}.`,
        metadata: JSON.stringify({ severity, status, assignedAdminId }),
      },
    });

    await AuditLogger.logAdminAction(admin.id, "TRIAGE_SAFETY_CASE", "SafetyCase", caseId, `Triaged case ${caseId} to severity ${severity} and status ${status}`, { severity, status, assignedAdminId });

    return updated;
  });
}

/**
 * Applies a financial hold on the booking/wedding related to the safety case.
 */
export async function adminToggleFinancialHoldAction(caseId: string, enable: boolean) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const safetyCase = await tx.safetyCase.findUnique({
      where: { id: caseId },
    });
    if (!safetyCase) throw new Error("Safety case not found.");

    await tx.safetyCase.update({
      where: { id: caseId },
      data: { financialHold: enable },
    });

    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        actorId: admin.id,
        eventType: enable ? "FINANCIAL_HOLD_ENABLED" : "FINANCIAL_HOLD_RELEASED",
        safeSummary: enable ? "A financial hold has been applied." : "The financial hold has been released.",
      },
    });

    await AuditLogger.logAdminAction(admin.id, "TOGGLE_FINANCIAL_HOLD", "SafetyCase", caseId, `Toggled financial hold for case ${caseId} to ${enable}`, { enable });
  });
}

/**
 * Restricts a user's capabilities inside safety investigations.
 */
export async function adminRestrictUserAction({
  userId,
  type,
  reasonCode,
  notes,
  expiresAt,
  caseId,
}: {
  userId: string;
  type: RestrictionType;
  reasonCode: string;
  notes?: string;
  expiresAt?: Date;
  caseId?: string;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const restriction = await tx.userRestriction.create({
      data: {
        userId,
        type,
        reasonCode,
        notes,
        caseId,
        expiresAt,
        createdById: admin.id,
      },
    });

    if (caseId) {
      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          actorId: admin.id,
          eventType: "USER_RESTRICTED",
          safeSummary: `Restriction applied to user for capability: ${type}`,
          metadata: JSON.stringify({ type, reasonCode }),
        },
      });
    }

    await AuditLogger.logAdminAction(admin.id, "RESTRICT_USER", "User", userId, `Restricted user ${userId} for capability: ${type}`, { type, reasonCode });

    return restriction;
  });
}

export async function adminRevokeRestrictionAction(restrictionId: string, caseId?: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.userRestriction.update({
      where: { id: restrictionId },
      data: {
        revokedAt: new Date(),
        revokedById: admin.id,
      },
    });

    if (caseId) {
      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          actorId: admin.id,
          eventType: "RESTRICTION_REVOKED",
          safeSummary: `Restriction of type ${updated.type} revoked by admin.`,
        },
      });
    }

    await AuditLogger.logAdminAction(admin.id, "REVOKE_RESTRICTION", "UserRestriction", restrictionId, `Revoked restriction ${restrictionId}`);

    return updated;
  });
}

/**
 * Suspends a wedding, removing it from discovery but keeping it visible to existing guests.
 */
export async function adminToggleWeddingSuspensionAction(weddingId: string, suspend: boolean, caseId?: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    await tx.wedding.update({
      where: { id: weddingId },
      data: { suspended: suspend },
    });

    if (caseId) {
      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          actorId: admin.id,
          eventType: suspend ? "WEDDING_SUSPENDED" : "WEDDING_UNSUSPENDED",
          safeSummary: suspend ? "Wedding experience operational suspension enabled." : "Wedding experience suspension lifted.",
        },
      });
    }

    await AuditLogger.logAdminAction(admin.id, "TOGGLE_WEDDING_SUSPENSION", "Wedding", weddingId, `Toggled suspension for wedding ${weddingId} to ${suspend}`, { suspend });
  });
}

/**
 * Resolves or closes a safety case.
 */
export async function adminResolveCaseAction(caseId: string, resolutionCode: string, notes: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const result = await prisma.$transaction(async (tx) => {
    const safetyCase = await tx.safetyCase.update({
      where: { id: caseId },
      data: {
        status: CaseStatus.RESOLVED,
        resolutionCode,
        resolutionNotes: notes,
        resolvedAt: new Date(),
      },
    });

    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        actorId: admin.id,
        eventType: "CASE_RESOLVED",
        safeSummary: `Case marked as RESOLVED. Code: ${resolutionCode}`,
        metadata: JSON.stringify({ resolutionCode, notes }),
      },
    });

    await AuditLogger.logAdminAction(admin.id, "RESOLVE_SAFETY_CASE", "SafetyCase", caseId, `Resolved case ${caseId} with code ${resolutionCode}`, { resolutionCode });

    return safetyCase;
  });

  if (result.subjectUserId) {
    const subjectUser = await prisma.user.findUnique({
      where: { id: result.subjectUserId },
      include: { travelerProfile: true, coupleProfile: true, agentProfile: true }
    });

    let subjectEntityType: ReputationEntityType | null = null;
    let subjectEntityId: string | null = null;

    if (subjectUser) {
      if (subjectUser.role === "TRAVELER" && subjectUser.travelerProfile) {
        subjectEntityType = ReputationEntityType.TRAVELER;
        subjectEntityId = subjectUser.travelerProfile.id;
      } else if (subjectUser.role === "COUPLE" && subjectUser.coupleProfile) {
        subjectEntityType = ReputationEntityType.HOST;
        subjectEntityId = subjectUser.coupleProfile.id;
      } else if (subjectUser.role === "AGENT" && subjectUser.agentProfile) {
        subjectEntityType = ReputationEntityType.AGENT;
        subjectEntityId = subjectUser.agentProfile.id;
      }
    }

    if (subjectEntityType && subjectEntityId) {
      const { logReputationEvent } = require("../services/reputation");

      if (resolutionCode === "UPHELD") {
        await logReputationEvent({
          entityType: subjectEntityType,
          entityId: subjectEntityId,
          type: ReputationEventType.SAFETY_CASE_UPHELD,
          scoreEffect: -20,
          referenceId: result.id,
          idempotencyKey: `SAFETY_CASE_UPHELD:${result.id}`
        });
      } else if (resolutionCode === "DISMISSED") {
        await logReputationEvent({
          entityType: subjectEntityType,
          entityId: subjectEntityId,
          type: ReputationEventType.SAFETY_CASE_DISMISSED,
          scoreEffect: 2,
          referenceId: result.id,
          idempotencyKey: `SAFETY_CASE_DISMISSED:${result.id}`
        });
      }
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Financial Holds Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if a booking, wedding, or user profile is financially held.
 */
export async function isFinanciallyHeld({
  bookingId,
  weddingId,
  userId,
}: {
  bookingId?: string;
  weddingId?: string;
  userId?: string;
}): Promise<boolean> {
  const orConditions: Prisma.SafetyCaseWhereInput[] = [];

  if (bookingId) orConditions.push({ bookingId });
  if (weddingId) orConditions.push({ weddingId });
  if (userId) {
    orConditions.push({ reportedById: userId });
    orConditions.push({ subjectUserId: userId });
  }

  if (orConditions.length === 0) return false;

  const activeHold = await prisma.safetyCase.findFirst({
    where: {
      financialHold: true,
      status: { notIn: [CaseStatus.RESOLVED, CaseStatus.CLOSED] },
      OR: orConditions,
    },
  });

  return !!activeHold;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Case Appeals System
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits an appeal on a resolved safety case.
 */
export async function submitCaseAppealAction(caseId: string, reason: string) {
  const user = await requireAuth();

  if (!reason.trim()) {
    throw new Error("Appeal reason cannot be blank.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch case with participants
    const safetyCase = await tx.safetyCase.findUnique({
      where: { id: caseId },
      include: { participants: true },
    });

    if (!safetyCase) throw new Error("Safety case not found.");

    // Appeal rules:
    // Only resolved cases
    if (safetyCase.status !== CaseStatus.RESOLVED) {
      throw new Error("Only safety cases with RESOLVED status can be appealed.");
    }

    // Participant only
    const isParticipant = safetyCase.participants.some((p) => p.userId === user.id);
    if (!isParticipant) {
      throw new Error("Forbidden: Only case participants can file an appeal.");
    }

    // Appeal deadline (14 days after resolution)
    if (safetyCase.resolvedAt) {
      const diffTime = Date.now() - safetyCase.resolvedAt.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 14) {
        throw new Error("Appeal rejected: The 14-day appeal submission window has closed.");
      }
    }

    // Only one active appeal at a time
    const existingAppeal = await tx.caseAppeal.findFirst({
      where: { caseId, status: AppealStatus.UNDER_REVIEW },
    });
    if (existingAppeal) {
      throw new Error("An active appeal is already under review for this case.");
    }

    // Create Appeal
    const appeal = await tx.caseAppeal.create({
      data: {
        caseId,
        submittedById: user.id,
        reason,
        status: AppealStatus.SUBMITTED,
      },
    });

    // Update case status to APPEALED
    await tx.safetyCase.update({
      where: { id: caseId },
      data: { status: CaseStatus.APPEALED },
    });

    // Write timeline
    await tx.caseTimelineEvent.create({
      data: {
        caseId,
        actorId: user.id,
        eventType: "CASE_APPEALED",
        safeSummary: "Case appeal submitted by participant.",
      },
    });

    return appeal;
  });
}

/**
 * Admins reviews case appeals.
 */
export async function adminReviewAppealAction(
  appealId: string,
  status: AppealStatus,
  reviewNotes: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  return await prisma.$transaction(async (tx) => {
    const appeal = await tx.caseAppeal.findUnique({
      where: { id: appealId },
      include: { case: true },
    });

    if (!appeal) throw new Error("Appeal record not found.");

    // Warn if the reviewing admin is the same admin assigned to the case
    if (appeal.case.assignedAdminId === admin.id) {
      console.warn(`[appeals] Admin ${admin.id} is reviewing an appeal for a case they were assigned to.`);
    }

    const updatedAppeal = await tx.caseAppeal.update({
      where: { id: appealId },
      data: {
        status,
        reviewNotes,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    // Reset SafetyCase status to CLOSED if rejected, or TRIAGED if overturned for re-investigation
    const nextCaseStatus = status === AppealStatus.OVERTURNED ? CaseStatus.TRIAGED : CaseStatus.CLOSED;

    await tx.safetyCase.update({
      where: { id: appeal.caseId },
      data: { status: nextCaseStatus },
    });

    // Write timeline
    await tx.caseTimelineEvent.create({
      data: {
        caseId: appeal.caseId,
        actorId: admin.id,
        eventType: "APPEAL_RESOLVED",
        safeSummary: `Case appeal resolved as: ${status}.`,
        metadata: JSON.stringify({ status, reviewNotes }),
      },
    });

    return updatedAppeal;
  });
}

/**
 * Executes a full Host Wedding cancellation workflow.
 * Suspends the wedding, files a safety incident, and cancels all active guest bookings.
 */
export async function hostCancelWeddingAction(weddingId: string, reasonText?: string) {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id }
  });
  if (!couple) throw new Error("Forbidden: Only couples can cancel their hosted weddings.");

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, hostCoupleId: couple.id },
    include: {
      bookings: {
        where: {
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.AWAITING_PAYMENT,
              BookingStatus.APPROVED,
              BookingStatus.PAID
            ]
          }
        },
        include: {
          traveler: { include: { user: true } }
        }
      }
    }
  });

  if (!wedding) throw new Error("Wedding not found or unauthorized.");

  const { createCancellationRequest, processApprovedRefund } = require("../services/refunds");

  // 1. Suspend the wedding experience
  await prisma.wedding.update({
    where: { id: weddingId },
    data: { suspended: true, status: "DRAFT" }
  });

  // 2. Create Safety Incident Report automatically against the host
  await reportIncidentAction({
    type: "EVENT_ISSUE",
    title: `Host Cancelled Wedding Event: ${wedding.title}`,
    description: `Host couple has cancelled the wedding event scheduled on ${wedding.date.toLocaleDateString()}. Reason: ${reasonText || "None provided"}. All ${wedding.bookings.length} active bookings are flagged for refunds.`,
    weddingId,
    subjectUserId: user.id
  });

  // 3. Process cancellations and refunds per-booking (resumable, not in a single big database transaction)
  const results = [];
  for (const booking of wedding.bookings) {
    try {
      const request = await createCancellationRequest({
        bookingId: booking.id,
        requestedById: user.id,
        actorRole: "HOST",
        reasonCode: "HOST_CANCELLED",
        reasonText: reasonText || "Host cancelled wedding event."
      });

      if (booking.status === BookingStatus.PAID) {
        // paid booking: trigger refund orchestration
        await processApprovedRefund(request.id, user.id);
      } else {
        // unpaid booking: auto-approved will transition booking status directly
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED }
        });
      }

      // Notify Traveler
      await prisma.notification.create({
        data: {
          userId: booking.traveler.user.id,
          title: "Wedding Event Cancelled by Host",
          message: `We regret to inform you that the host has cancelled the wedding experience: ${wedding.title}. You have been issued a 100% refund.`,
          type: "ALERT"
        }
      });

      results.push({ bookingId: booking.id, success: true });
    } catch (err: any) {
      console.error(`Failed to process host cancellation for booking ${booking.id}:`, err);
      results.push({ bookingId: booking.id, success: false, error: err.message });
    }
  }

  revalidatePath("/dashboard/operations");
  revalidatePath("/dashboard");
  return { success: true, results };
}


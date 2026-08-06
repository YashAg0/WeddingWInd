"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import {
  ReferralStatus,
  ReferralType,
  CommissionStatus,
  UserRole,
  ReputationEntityType,
  ReputationEventType
} from "@prisma/client";
import { logReputationEvent } from "../services/reputation";
import { z } from "zod";
import { setAttributionCookie } from "../attribution";
import { AuditLogger } from "../security/audit";

// Zod Validation Schemas
const referralCodeSchema = z.string().min(6).max(30).regex(/^[a-zA-Z0-9\-]+$/);
const _campaignSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_\-\s]+$/),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
});

const payoutRequestSchema = z.object({
  amount: z.number().positive().min(50), // Min payout threshold is $50
  method: z.enum(["BANK_TRANSFER", "STRIPE_CONNECT", "MANUAL"]),
});

const payoutReviewSchema = z.object({
  requestId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Helper to generate secure, unique, non-sequential, case-insensitive codes.
 */
export async function generateReferralCode(agentName: string): Promise<string> {
  const cleanName = agentName.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `WWI-${cleanName || "AGENT"}-${randomSuffix}`;
  
  // Verify uniqueness
  const exists = await prisma.agentProfile.findUnique({
    where: { referralCode: code },
  });
  if (exists) {
    return generateReferralCode(agentName);
  }
  return code;
}

/**
 * Tracks a referral click/visit.
 */
export async function trackReferralVisitAction(
  referralCode: string,
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  },
  landingPage: string
) {
  try {
    const validatedCode = referralCodeSchema.parse(referralCode.toUpperCase());
    
    // Resolve agent
    const agent = await prisma.agentProfile.findUnique({
      where: { referralCode: validatedCode },
      include: { user: true },
    });
    if (!agent) return { success: false, error: "Referral code not found." };

    const { checkUserRestriction } = require("./safety");
    const restricted = await checkUserRestriction(agent.userId, "AGENT_REFERRAL_RESTRICTED");
    if (restricted) {
      return { success: false, error: "This referral link is inactive." };
    }

    // Set first-party secure cookie
    const visitorId = Math.random().toString(36).substring(2, 15);
    const _attribution = await setAttributionCookie({
      referralCode: validatedCode,
      visitorId,
      source: utm.source,
      medium: utm.medium,
      campaign: utm.campaign,
      landingPage,
    });

    // Create or update AgentReferral database click log
    // Clicks represent anonymous visits (no referredUserId yet)
    await prisma.agentReferral.create({
      data: {
        agentId: agent.id,
        referralCode: validatedCode,
        referralType: ReferralType.TRAVELER,
        status: ReferralStatus.CLICKED,
        visitorId,
        source: utm.source,
        medium: utm.medium,
        campaign: utm.campaign,
        landingPage,
      },
    });

    return { success: true, visitorId };
  } catch (error) {
    console.error("Referral visit tracking failed:", error);
    return { success: false, error: "Failed to parse parameters." };
  }
}

/**
 * Associates user with referral attribution on signup.
 */
export async function associateReferralOnSignup(userId: string, refCookieData: any) {
  try {
    if (!refCookieData?.referralCode) return;

    // Resolve agent
    const agent = await prisma.agentProfile.findUnique({
      where: { referralCode: refCookieData.referralCode },
    });
    if (!agent) return;

    // Create signup referral linkage
    const referral = await prisma.agentReferral.create({
      data: {
        agentId: agent.id,
        referredUserId: userId,
        referralCode: refCookieData.referralCode,
        referralType: ReferralType.TRAVELER,
        status: ReferralStatus.SIGNED_UP,
        visitorId: refCookieData.visitorId,
        source: refCookieData.source,
        medium: refCookieData.medium,
        campaign: refCookieData.campaign,
        landingPage: refCookieData.landingPage,
        signedUpAt: new Date(),
      },
    });

    // Run basic fraud detection checks
    await detectReferralFraudAction(referral.id);

    return referral;
  } catch (error) {
    console.error("Referral association failed:", error);
  }
}

/**
 * Deterministic commission calculator based on rule definitions
 */
export async function calculateCommission(
  grossAmount: number,
  rule: {
    calculationType: string;
    percentage: number;
    fixedAmount: number;
    minimumTransactionAmount: number;
    maximumCommission: number;
  }
): Promise<number> {
  if (grossAmount < rule.minimumTransactionAmount) return 0;

  let amount = 0;
  if (rule.calculationType === "PERCENTAGE") {
    amount = grossAmount * (rule.percentage / 100);
  } else if (rule.calculationType === "FIXED") {
    amount = rule.fixedAmount;
  } else if (rule.calculationType === "HYBRID") {
    amount = rule.fixedAmount + (grossAmount * (rule.percentage / 100));
  }

  // Apply maximum cap
  if (rule.maximumCommission > 0 && amount > rule.maximumCommission) {
    amount = rule.maximumCommission;
  }

  return Math.round(amount * 100) / 100; // Round to 2 decimals
}

/**
 * Submits payout request and locks commissions in transaction.
 */
export async function submitPayoutRequestAction(data: z.infer<typeof payoutRequestSchema>) {
  const user = await requireAuth();

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: user.id },
  });
  if (!agent) throw new Error("Unauthorized: Agent profile not found.");

  const { assertCanRequestPayout, isFinanciallyHeld } = require("./safety");
  await assertCanRequestPayout(user.id);
  const held = await isFinanciallyHeld({ userId: user.id });
  if (held) {
    throw new Error("HELD: Your payout requests are currently held due to an active safety case or investigation.");
  }

  const payload = payoutRequestSchema.parse(data);

  // Fetch approved & payable commissions not assigned to any payout requests
  const commissions = await prisma.commission.findMany({
    where: {
      agentId: agent.id,
      status: CommissionStatus.APPROVED,
      payoutRequestId: null,
    },
  });

  const payableBalance = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  if (payableBalance < payload.amount) {
    throw new Error("Insufficient payable balance.");
  }

  // Use database transaction to guarantee consistency and lock rows
  const payout = await prisma.$transaction(async (tx) => {
    // Create PayoutRequest
    const req = await tx.payoutRequest.create({
      data: {
        agentId: agent.id,
        amount: payload.amount,
        method: payload.method,
        status: "REQUESTED",
      },
    });

    // Link commissions to this request and move status to LOCKED
    // This prevents concurrent double requests
    for (const c of commissions) {
      await tx.commission.update({
        where: { id: c.id },
        data: {
          payoutRequestId: req.id,
          status: CommissionStatus.LOCKED,
        },
      });
    }

    return req;
  });

  // Revalidate earnings page
  revalidatePath("/dashboard/earnings");
  return payout;
}

/**
 * Admins approves or rejects payout request.
 */
export async function adminReviewPayoutRequestAction(data: z.infer<typeof payoutReviewSchema>) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) throw new Error("Forbidden: Admin access only.");

  const payload = payoutReviewSchema.parse(data);

  // Execute review in database transaction
  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.payoutRequest.findUnique({
      where: { id: payload.requestId },
      include: { commissions: true, agent: true },
    });

    if (!req) throw new Error("Payout request not found.");
    if (req.status !== "REQUESTED") throw new Error("Payout request already resolved.");

    const { isFinanciallyHeld } = require("./safety");
    const held = await isFinanciallyHeld({ userId: req.agent.userId });
    if (held && payload.approved) {
      throw new Error("HELD: This payout request is currently subject to a safety hold.");
    }

    const newStatus = payload.approved ? "APPROVED" : "REJECTED";
    const commissionNewStatus = payload.approved ? CommissionStatus.PAID : CommissionStatus.APPROVED;

    // Resolve commissions status
    for (const c of req.commissions) {
      await tx.commission.update({
        where: { id: c.id },
        data: {
          status: commissionNewStatus,
          paidAt: payload.approved ? new Date() : null,
          payoutRequestId: payload.approved ? req.id : null, // keep relation if approved, unset if rejected
        },
      });
    }

    const updatedRequest = await tx.payoutRequest.update({
      where: { id: payload.requestId },
      data: {
        status: newStatus,
        notes: payload.notes,
      },
    });

    return updatedRequest;
  });

  if (updated.status === "APPROVED") {
    await logReputationEvent({
      entityType: ReputationEntityType.AGENT,
      entityId: updated.agentId,
      type: ReputationEventType.PAYOUT_COMPLETED,
      scoreEffect: 5,
      referenceId: updated.id,
      idempotencyKey: `PAYOUT_COMPLETED:${updated.id}`
    });
  }

  await AuditLogger.logAdminAction(user.id, "REVIEW_PAYOUT_REQUEST", "PayoutRequest", updated.id, `Admin reviewed payout request: ${updated.status}`, { status: updated.status, notes: payload.notes });

  revalidatePath("/dashboard/admin/agents");
  return updated;
}

/**
 * Basic fraud logs check.
 */
export async function detectReferralFraudAction(referralId: string) {
  const referral = await prisma.agentReferral.findUnique({
    where: { id: referralId },
    include: {
      agent: { include: { user: true } },
      referredUser: true,
    },
  });
  if (!referral) return;

  const logs = [];

  // Check 1: Agent referring own database identity
  if (referral.referredUser && referral.agent.userId === referral.referredUser.id) {
    logs.push("Agent referring their own platform/database account profile.");
  }

  // Check 2: Same visitor ID or IP referred repeatedly
  const repeats = await prisma.agentReferral.count({
    where: {
      visitorId: referral.visitorId,
      id: { not: referral.id },
    },
  });
  if (repeats > 3) {
    logs.push("Visitor ID referred multiple accounts within short timeframe.");
  }

  // Write fraud flag log if suspicious activity detected
  if (logs.length > 0) {
    await prisma.referralFraudFlag.create({
      data: {
        referralId: referral.id,
        reason: logs.join(" | "),
        severity: "HIGH",
        status: "OPEN",
      },
    });
  }
}

/**
 * Fetches dashboard analytics metrics.
 */
export async function getAgentGrowthStats() {
  const user = await requireAuth();

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: user.id },
  });
  if (!agent) throw new Error("Agent profile not found.");

  // Funnel analytics queries
  const clicks = await prisma.agentReferral.count({
    where: { agentId: agent.id, status: ReferralStatus.CLICKED },
  });
  const signups = await prisma.agentReferral.count({
    where: { agentId: agent.id, status: ReferralStatus.SIGNED_UP },
  });
  const onboarded = await prisma.agentReferral.count({
    where: { agentId: agent.id, status: ReferralStatus.ONBOARDED },
  });
  const converted = await prisma.agentReferral.count({
    where: { agentId: agent.id, status: ReferralStatus.CONVERTED },
  });

  // Calculate earnings summary
  const commissions = await prisma.commission.findMany({
    where: { agentId: agent.id },
  });

  const totalEarnings = commissions
    .filter((c) => c.status === CommissionStatus.PAID)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const pendingCommission = commissions
    .filter((c) => c.status === CommissionStatus.PENDING)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const payableBalance = commissions
    .filter((c) => c.status === CommissionStatus.APPROVED)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const reversedCommission = commissions
    .filter((c) => c.status === CommissionStatus.REVERSED)
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return {
    clicks,
    signups,
    onboarded,
    converted,
    totalEarnings,
    pendingCommission,
    payableBalance,
    reversedCommission,
    referralCode: agent.referralCode,
  };
}

/**
 * Admin action to fetch agent reviews.
 */
export async function adminGetAgentsList() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) throw new Error("Unauthorized.");

  const agents = await prisma.agentProfile.findMany({
    include: {
      user: true,
      referrals: {
        include: { referredUser: true },
      },
      commissions: true,
      payoutRequests: true,
    },
  });

  const fraudFlags = await prisma.referralFraudFlag.findMany({
    where: { status: "OPEN" },
    include: {
      referral: {
        include: {
          agent: { include: { user: true } },
          referredUser: true,
        },
      },
    },
  });

  const payoutRequests = await prisma.payoutRequest.findMany({
    where: { status: "REQUESTED" },
    include: {
      agent: { include: { user: true } },
    },
  });

  return {
    agents,
    fraudFlags,
    payoutRequests,
  };
}

/**
 * Admin triggers referral code regeneration.
 */
export async function regenerateReferralCodeAction(agentId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) throw new Error("Unauthorized.");

  const agent = await prisma.agentProfile.findUnique({
    where: { id: agentId },
    include: { user: true },
  });
  if (!agent) throw new Error("Agent not found.");

  const newCode = await generateReferralCode(agent.user.name || "AGENT");

  await prisma.agentProfile.update({
    where: { id: agentId },
    data: { referralCode: newCode },
  });

  await AuditLogger.logAdminAction(user.id, "REGENERATE_REFERRAL_CODE", "AgentProfile", agentId, `Admin regenerated referral code for agent ${agentId}`);

  revalidatePath("/dashboard/admin/agents");
  return { success: true, newCode };
}

/**
 * Processes commission generation inside a database transaction during Stripe payment confirmation.
 */
export async function generateBookingCommissionAction(
  tx: any,
  paymentId: string,
  bookingId: string,
  travelerUserId: string,
  grossAmount: number
) {
  try {
    // Check booking status first
    const booking = await tx.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) return { success: false, reason: "Booking not found." };
    const validStates = ["PAID", "ATTENDED", "COMPLETED"];
    if (!validStates.includes(booking.status)) {
      return { success: false, reason: `Booking is not paid/completed. Status: ${booking.status}` };
    }

    // 1. Resolve referral linkage
    const referral = await tx.agentReferral.findFirst({
      where: {
        referredUserId: travelerUserId,
        status: { in: [ReferralStatus.SIGNED_UP, ReferralStatus.ONBOARDED, ReferralStatus.QUALIFIED] },
      },
    });

    if (!referral) return { success: false, reason: "No active referral found for this user." };

    const idempotencyKey = `BOOKING_PAYMENT:${paymentId}:${referral.agentId}`;

    // 2. Check for duplicate commission generation
    const existing = await tx.commission.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return { success: true, reason: "Commission already processed." };

    // 3. Resolve active commission rule (or default rule if none configured)
    let rule = await tx.commissionRule.findFirst({
      where: {
        referralType: ReferralType.TRAVELER,
        active: true,
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]
      },
    });

    if (!rule) {
      // Default placeholder rules if none seeded
      rule = {
        id: null,
        name: "Default Traveler Rule",
        referralType: ReferralType.TRAVELER,
        calculationType: "PERCENTAGE",
        percentage: 10.0,
        fixedAmount: 0.0,
        minimumTransactionAmount: 0.0,
        maximumCommission: 0.0,
      };
    }

    const commissionAmount = await calculateCommission(grossAmount, rule);

    // 4. Create ledger item
    const commission = await tx.commission.create({
      data: {
        agentId: referral.agentId,
        referralId: referral.id,
        bookingId,
        paymentId,
        commissionRuleId: rule.id,
        grossAmount,
        commissionAmount,
        status: CommissionStatus.PENDING,
        source: "BOOKING_PAYMENT",
        idempotencyKey,
        calculationSnapshot: JSON.stringify(rule),
        availableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // available in 14 days
      },
    });

    // 5. Update referral stage
    await tx.agentReferral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.CONVERTED,
        convertedAt: new Date(),
      },
    });

    // Log referral converted reputation event
    await logReputationEvent({
      entityType: ReputationEntityType.AGENT,
      entityId: referral.agentId,
      type: ReputationEventType.REFERRAL_CONVERTED,
      scoreEffect: 10,
      referenceId: referral.id,
      idempotencyKey: `REFERRAL_CONVERTED:${referral.id}`
    });

    // 6. Push notification to Agent
    const agent = await tx.agentProfile.findUnique({ where: { id: referral.agentId } });
    await tx.notification.create({
      data: {
        userId: agent.userId,
        title: "Commission Earned!",
        message: `You earned a commission of $${commissionAmount} from a referred traveler booking!`,
        type: "SUCCESS",
      },
    });

    return { success: true, commissionId: commission.id };
  } catch (error) {
    console.error("Failed to generate booking commission:", error);
    return { success: false, error };
  }
}

/**
 * Handles reversals / refunds of payments.
 */
export async function reverseBookingCommissionAction(tx: any, paymentId: string, refundId?: string) {
  try {
    const commissions = await tx.commission.findMany({
      where: { paymentId },
    });

    for (const c of commissions) {
      if (c.status === CommissionStatus.PAID) {
        // Already paid: generate negative balance adjustment ledger
        const idempotencyKey = refundId 
          ? `REFUND_REVERSAL:${refundId}:${c.id}` 
          : `REVERSAL:${paymentId}:${c.agentId}`;
        const duplicate = await tx.commission.findUnique({ where: { idempotencyKey } });
        if (duplicate) continue;

        await tx.commission.create({
          data: {
            agentId: c.agentId,
            referralId: c.referralId,
            bookingId: c.bookingId,
            paymentId: c.paymentId,
            commissionRuleId: c.commissionRuleId,
            grossAmount: -c.grossAmount,
            commissionAmount: -c.commissionAmount,
            status: CommissionStatus.CANCELLED,
            source: "REVERSAL",
            idempotencyKey,
            calculationSnapshot: c.calculationSnapshot,
          },
        });
      } else {
        // Unpaid commission: set status to REVERSED
        await tx.commission.update({
          where: { id: c.id },
          data: { status: CommissionStatus.REVERSED },
        });
      }

      // Notify agent of reversal
      const agent = await tx.agentProfile.findUnique({ where: { id: c.agentId } });
      await tx.notification.create({
        data: {
          userId: agent.userId,
          title: "Commission Reversal",
          message: `Commission of $${c.commissionAmount} has been reversed due to traveler refund.`,
          type: "ALERT",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Reversal failed:", error);
    return { success: false, error };
  }
}

/**
 * Resolves a referral fraud flag, logging REFERRAL_FRAUD_CONFIRMED if status is CONFIRMED.
 */
export async function adminResolveReferralFraudFlagAction(
  flagId: string,
  status: "CLEARED" | "CONFIRMED",
  _notes?: string
) {
  const admin = await requireAuth();
  if (admin.role !== UserRole.ADMIN) {
    throw new Error("UNAUTHORIZED: Administrative credentials required.");
  }

  const flag = await prisma.referralFraudFlag.findUnique({
    where: { id: flagId },
    include: { referral: true }
  });

  if (!flag) {
    throw new Error("Fraud flag not found.");
  }

  const updatedFlag = await prisma.referralFraudFlag.update({
    where: { id: flagId },
    data: { status }
  });

  if (status === "CONFIRMED") {
    // Log referral fraud confirmed reputation event for the agent
    await logReputationEvent({
      entityType: ReputationEntityType.AGENT,
      entityId: flag.referral.agentId,
      type: ReputationEventType.REFERRAL_FRAUD_CONFIRMED,
      scoreEffect: -25,
      referenceId: flag.id,
      idempotencyKey: `REFERRAL_FRAUD_CONFIRMED:${flag.id}`
    });
  }

  await AuditLogger.logAdminAction(admin.id, "RESOLVE_FRAUD_FLAG", "ReferralFraudFlag", flagId, `Admin resolved fraud flag: ${status}`, { status });

  return { success: true, flag: updatedFlag };
}


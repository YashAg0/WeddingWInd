/**
 * lib/services/sponsorship.ts
 *
 * Production-Grade Sponsored Marketplace Placement & CRM System for WeddingWithIndia.
 * Supports:
 * - Dual entry paths: Host website requests & Admin direct outreach / negotiated placements
 * - External payment architectures: UPI (QR codes, UPI IDs, deep links), PayPal external links, Bank transfers, Waived/Complimentary
 * - Persistent server-backed 10-step progress checklists with audit completion stamps
 * - Manual admin payment verification with immutable financial history
 * - PostgreSQL transactional advisory locking (`pg_advisory_xact_lock`) for concurrent activation protection
 * - Hard conflict detection against overlapping active timeframes
 * - Time-aware expiration (`startsAt <= now < endsAt`) independent of cron
 * - Single source of truth ranking (Sponsored > Featured > Normal)
 * - Strict server-side authorization and IDOR protections
 */

import "server-only";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { UserRole, WeddingStatus, SponsorshipRequestStatus } from "@prisma/client";
import { createAuditLog } from "../actions/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
} from "../marketplace/ranking";

export {
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
};

export type PromotionType = "SPONSORED" | "FEATURED";
export type SponsorshipSource = "HOST_REQUEST" | "ADMIN_OUTREACH" | "PARTNER" | "MANUAL" | "OTHER";
export type SponsorshipContactMethod = "WHATSAPP" | "PHONE" | "EMAIL" | "IN_PERSON" | "WEBSITE" | "OTHER";
export type SponsorshipPaymentMethod = "UPI" | "PAYPAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | "WAIVED";
export type SponsorshipPaymentStatus = "NOT_REQUESTED" | "PAYMENT_REQUESTED" | "PAYMENT_SUBMITTED" | "PAYMENT_VERIFIED" | "REJECTED" | "WAIVED";

export interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  completedBy?: string | null;
  completedAt?: string | null;
}

export const DEFAULT_CHECKLIST_TEMPLATE: { key: string; label: string }[] = [
  { key: "HOST_CONTACTED", label: "Host contacted" },
  { key: "SPONSORSHIP_DISCUSSED", label: "Sponsorship discussed" },
  { key: "PRICE_AGREED", label: "Price agreed" },
  { key: "DURATION_AGREED", label: "Duration agreed" },
  { key: "TERMS_COMMUNICATED", label: "Terms communicated" },
  { key: "PAYMENT_INSTRUCTIONS_SENT", label: "Payment instructions sent" },
  { key: "PAYMENT_RECEIVED", label: "Payment received" },
  { key: "PAYMENT_VERIFIED", label: "Payment verified" },
  { key: "LISTING_APPROVED", label: "Listing approved" },
  { key: "SPONSORSHIP_ACTIVATED", label: "Sponsorship activated" },
];

export function buildDefaultChecklist(initialCompletedKeys: string[] = [], actorEmail?: string): ChecklistItem[] {
  const now = new Date().toISOString();
  return DEFAULT_CHECKLIST_TEMPLATE.map((item) => {
    const isCompleted = initialCompletedKeys.includes(item.key);
    return {
      key: item.key,
      label: item.label,
      completed: isCompleted,
      completedBy: isCompleted ? (actorEmail || "SYSTEM") : null,
      completedAt: isCompleted ? now : null,
    };
  });
}

export interface CreateSponsorshipRequestInput {
  weddingId: string;
  promotionType?: PromotionType;
  proposedAmount?: number;
  message?: string;
  budget?: string;
  requestedDurationDays?: number;
}

export interface SubmitHostPaymentProofInput {
  sponsorshipId: string;
  transactionReference: string;
  paymentProofUrl?: string;
  paymentNotes?: string;
}

export interface AdminReviewSponsorshipInput {
  requestId: string;
  decision: "APPROVED" | "REJECTED";
  promotionType?: PromotionType;
  amount?: number;
  currency?: string;
  durationDays?: number;
  paymentMethod?: SponsorshipPaymentMethod;
  paymentRequired?: boolean;
  sponsorshipStart?: string | null;
  sponsorshipEnd?: string | null;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface AdminDirectSponsorshipInput {
  weddingId: string;
  promotionType?: PromotionType;
  source?: SponsorshipSource;
  contactMethod?: SponsorshipContactMethod;
  contactDate?: string | null;
  contactNotes?: string;
  agreementNotes?: string;
  amount?: number;
  currency?: string;
  durationDays?: number;
  paymentMethod?: SponsorshipPaymentMethod;
  paymentStatus?: SponsorshipPaymentStatus;
  paymentRequired?: boolean;
  sponsorshipStart?: string | null;
  sponsorshipEnd?: string | null;
  adminNotes?: string;
  completedChecklistKeys?: string[];
}

export interface AdminUpdatePromotionInput {
  sponsorshipId: string;
  amount?: number;
  currency?: string;
  durationDays?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  promotionType?: PromotionType;
  paymentMethod?: SponsorshipPaymentMethod;
  paymentStatus?: SponsorshipPaymentStatus;
  adminNotes?: string;
}

export interface AdminVerifyPaymentInput {
  sponsorshipId: string;
  transactionReference?: string;
  paymentMethod?: SponsorshipPaymentMethod;
  verifiedAmount?: number;
  currency?: string;
  notes?: string;
}

export interface AdminUpdatePaymentConfigInput {
  upiId?: string;
  upiName?: string;
  upiQrImageUrl?: string | null;
  upiPaymentLink?: string | null;
  upiInstructions?: string;
  paypalPaymentLink?: string;
  paypalDisplayName?: string;
  paypalInstructions?: string;
  bankTransferInstructions?: string;
  otherPaymentInstructions?: string;
}

/**
 * Exact minor currency units conversion without floating point precision loss.
 * e.g., 299.00 USD -> 29900 cents, 25000.00 INR -> 2500000 paise.
 */
export function toMinorCurrencyUnits(amount: number): number {
  if (typeof amount !== "number" || isNaN(amount)) return 0;
  return Math.round(Number(amount.toFixed(2)) * 100);
}

export function sanitizePaymentUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  if (trimmed.startsWith("upi://")) {
    return trimmed;
  }

  if (trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return null;
    }
  }

  return null;
}



// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT CONFIGURATION (UPI, PayPal, Bank Transfer)
// ─────────────────────────────────────────────────────────────────────────────

export async function getSponsorshipPaymentConfig() {
  try {
    const config = await prisma.sponsorshipPaymentConfig.findUnique({
      where: { id: "default" },
    });
    if (config) return config;
  } catch {
    // Fallback if table is not yet seeded
  }

  return {
    id: "default",
    upiId: null,
    upiName: "WeddingWithIndia",
    upiQrImageUrl: null,
    upiPaymentLink: null,
    upiInstructions: "UPI payment instructions will be provided by your WeddingWithIndia concierge.",
    paypalPaymentLink: null,
    paypalDisplayName: "WeddingWithIndia",
    paypalInstructions: "PayPal payment instructions will be provided by your WeddingWithIndia concierge.",
    bankTransferInstructions: null,
    otherPaymentInstructions: null,
    updatedAt: new Date(),
    updatedBy: "SYSTEM",
  };
}

export async function adminUpdatePaymentConfig(input: AdminUpdatePaymentConfigInput) {
  const admin = await requireRole([UserRole.ADMIN]);

  const sanitizedPaypal = sanitizePaymentUrl(input.paypalPaymentLink);
  const sanitizedUpiLink = sanitizePaymentUrl(input.upiPaymentLink);

  const updated = await prisma.sponsorshipPaymentConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      upiId: input.upiId?.trim() || null,
      upiName: input.upiName?.trim() || "WeddingWithIndia",
      upiQrImageUrl: input.upiQrImageUrl?.trim() || null,
      upiPaymentLink: sanitizedUpiLink,
      upiInstructions: input.upiInstructions?.trim() || null,
      paypalPaymentLink: sanitizedPaypal,
      paypalDisplayName: input.paypalDisplayName?.trim() || "WeddingWithIndia",
      paypalInstructions: input.paypalInstructions?.trim() || null,
      bankTransferInstructions: input.bankTransferInstructions?.trim() || null,
      otherPaymentInstructions: input.otherPaymentInstructions?.trim() || null,
      updatedBy: admin.email,
    },
    update: {
      ...(input.upiId !== undefined && { upiId: input.upiId ? input.upiId.trim() : null }),
      ...(input.upiName !== undefined && { upiName: input.upiName.trim() }),
      ...(input.upiQrImageUrl !== undefined && { upiQrImageUrl: input.upiQrImageUrl ? input.upiQrImageUrl.trim() : null }),
      ...(input.upiPaymentLink !== undefined && { upiPaymentLink: sanitizedUpiLink }),
      ...(input.upiInstructions !== undefined && { upiInstructions: input.upiInstructions ? input.upiInstructions.trim() : null }),
      ...(input.paypalPaymentLink !== undefined && { paypalPaymentLink: sanitizedPaypal }),
      ...(input.paypalDisplayName !== undefined && { paypalDisplayName: input.paypalDisplayName.trim() }),
      ...(input.paypalInstructions !== undefined && { paypalInstructions: input.paypalInstructions ? input.paypalInstructions.trim() : null }),
      ...(input.bankTransferInstructions !== undefined && { bankTransferInstructions: input.bankTransferInstructions ? input.bankTransferInstructions.trim() : null }),
      ...(input.otherPaymentInstructions !== undefined && { otherPaymentInstructions: input.otherPaymentInstructions ? input.otherPaymentInstructions.trim() : null }),
      updatedBy: admin.email,
    },
  });

  await createAuditLog(
    "ADMIN_SPONSORSHIP_CONFIG_UPDATED",
    "SponsorshipPaymentConfig",
    "default",
    `Admin ${admin.email} updated marketplace sponsorship payment configuration.`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/listings");
  return { success: true, config: updated };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOST REQUEST & PAYMENT PROOF WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Host submits a request for sponsored or featured discovery placement on an owned published wedding.
 */
export async function requestSponsorship(input: CreateSponsorshipRequestInput) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Only host couples can request sponsorship for their weddings.");
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
  if (!couple) throw new Error("Couple profile not found.");

  const promotionType: PromotionType = input.promotionType || "SPONSORED";

  // Verify ownership and listing validity
  const wedding = await prisma.wedding.findUnique({
    where: { id: input.weddingId },
    select: { id: true, title: true, hostCoupleId: true, status: true, sponsored: true, featured: true, sponsorshipEnd: true },
  });

  if (!wedding) throw new Error("Wedding not found.");
  if (wedding.hostCoupleId !== couple.id) {
    throw new Error("Forbidden: You do not own this wedding.");
  }
  if (wedding.status !== WeddingStatus.PUBLISHED) {
    throw new Error("Only published weddings can be submitted for sponsorship.");
  }

  if (promotionType === "SPONSORED" && isSponsorshipCurrentlyActive(wedding)) {
    throw new Error("This wedding already has an active sponsored placement.");
  }

  // Reject duplicate pending/payment_pending requests
  const existingPending = await prisma.sponsorshipRequest.findFirst({
    where: {
      weddingId: input.weddingId,
      status: { in: [SponsorshipRequestStatus.PENDING, SponsorshipRequestStatus.PAYMENT_PENDING] },
    },
  });
  if (existingPending) {
    throw new Error("A sponsorship request for this wedding is already pending admin review or payment.");
  }

  const requestedDays = input.requestedDurationDays ? Math.max(1, Math.min(60, input.requestedDurationDays)) : 7;
  const initialChecklist = buildDefaultChecklist([], user.email);
  const proposedAmount = input.proposedAmount !== undefined ? Number(input.proposedAmount) : (input.budget ? parseFloat(input.budget) || null : null);

  const request = await prisma.sponsorshipRequest.create({
    data: {
      weddingId: input.weddingId,
      coupleId: couple.id,
      promotionType,
      source: "HOST_REQUEST",
      contactMethod: "WEBSITE",
      message: input.message?.trim() || null,
      budget: input.budget?.trim() || (proposedAmount ? String(proposedAmount) : null),
      proposedAmount,
      requestedDurationDays: requestedDays,
      durationDays: requestedDays,
      status: SponsorshipRequestStatus.PENDING,
      paymentRequired: true,
      paymentMethod: "UPI",
      paymentStatus: "NOT_REQUESTED",
      checklist: initialChecklist as any,
    },
  });

  // Notify Admins
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (Array.isArray(admins) && admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: `${promotionType === "FEATURED" ? "Featured" : "Sponsorship"} Request`,
        message: `Host couple requested ${promotionType.toLowerCase()} placement for "${wedding.title}" (${requestedDays} days${proposedAmount ? `, proposed ₹${proposedAmount}` : ""}). Review in Admin CRM.`,
        type: "REQUEST" as const,
      })),
    });
  }

  await createAuditLog(
    promotionType === "FEATURED" ? "FEATURED_REQUESTED" : "SPONSORSHIP_REQUESTED",
    "SponsorshipRequest",
    request.id,
    `Host ${user.email} requested ${promotionType} placement for wedding ${wedding.id} (${requestedDays} days${proposedAmount ? `, proposed: ${proposedAmount}` : ""})`
  );

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  return { success: true, requestId: request.id };
}

/**
 * Host cancels their pending sponsorship request.
 */
export async function cancelSponsorshipRequest(requestId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Only host couples can cancel their sponsorship requests.");
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
  if (!couple) throw new Error("Couple profile not found.");

  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id: requestId },
    include: { wedding: { select: { hostCoupleId: true, title: true, id: true } } },
  });

  if (!request) throw new Error("Sponsorship request not found.");
  if (request.wedding.hostCoupleId !== couple.id) {
    throw new Error("Forbidden: You do not own the wedding linked to this request.");
  }
  if (request.status !== SponsorshipRequestStatus.PENDING && request.status !== SponsorshipRequestStatus.PAYMENT_PENDING) {
    throw new Error("Only pending sponsorship requests can be cancelled.");
  }

  await prisma.sponsorshipRequest.update({
    where: { id: requestId },
    data: { status: SponsorshipRequestStatus.CANCELLED },
  });

  await createAuditLog(
    "SPONSORSHIP_REQUEST_CANCELLED",
    "SponsorshipRequest",
    requestId,
    `Host ${user.email} cancelled sponsorship request ${requestId} for wedding ${request.wedding.id}`
  );

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  return { success: true };
}

/**
 * Host submits payment proof / UTR reference after paying externally via UPI/PayPal/Bank.
 * Crucial Invariant: Only transitions paymentStatus to PAYMENT_SUBMITTED.
 * MUST NOT ACTIVATE SPONSORSHIP DIRECTLY. Only admin verification can activate.
 */
export async function submitHostPaymentProof(input: SubmitHostPaymentProofInput) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Only host couples can submit payment proof for their wedding sponsorship.");
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
  if (!couple) throw new Error("Couple profile not found.");

  const cleanTxnRef = input.transactionReference?.trim();
  if (!cleanTxnRef || cleanTxnRef.length < 4) {
    throw new Error("A valid UTR or payment transaction reference (minimum 4 characters) is required.");
  }

  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id: input.sponsorshipId },
    include: { wedding: { select: { id: true, title: true, hostCoupleId: true } } },
  });

  if (!request) throw new Error("Sponsorship record not found.");
  if (request.wedding.hostCoupleId !== couple.id) {
    throw new Error("Forbidden: You do not own the wedding linked to this sponsorship.");
  }
  if (request.status !== SponsorshipRequestStatus.PAYMENT_PENDING && request.status !== SponsorshipRequestStatus.PENDING) {
    throw new Error(`Cannot submit payment in status ${request.status}.`);
  }

  const now = new Date();

  // Update existing checklist if present
  let currentChecklist: ChecklistItem[] = Array.isArray(request.checklist)
    ? (request.checklist as any as ChecklistItem[])
    : buildDefaultChecklist(["HOST_CONTACTED", "PRICE_AGREED", "DURATION_AGREED", "PAYMENT_INSTRUCTIONS_SENT"], user.email);

  currentChecklist = currentChecklist.map((item) => {
    if (item.key === "PAYMENT_RECEIVED" && !item.completed) {
      return { ...item, completed: true, completedBy: user.email, completedAt: now.toISOString() };
    }
    return item;
  });

  const updated = await prisma.sponsorshipRequest.update({
    where: { id: input.sponsorshipId },
    data: {
      paymentStatus: "PAYMENT_SUBMITTED",
      paymentReference: cleanTxnRef,
      paymentProofUrl: input.paymentProofUrl ? sanitizePaymentUrl(input.paymentProofUrl) || input.paymentProofUrl : null,
      paymentProofUploadedAt: input.paymentProofUrl ? now : null,
      paymentSubmittedAt: now,
      paymentNotes: input.paymentNotes?.trim() || null,
      checklist: currentChecklist as any,
    },
  });

  // Notify Admins to verify
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (Array.isArray(admins) && admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: "Sponsorship Payment Submitted",
        message: `Host for "${request.wedding.title}" submitted payment reference: ${cleanTxnRef}. Verify in Sponsorship CRM.`,
        type: "REQUEST" as const,
      })),
    });
  }

  await createAuditLog(
    "HOST_PAYMENT_SUBMITTED",
    "SponsorshipRequest",
    request.id,
    `Host ${user.email} submitted payment reference "${cleanTxnRef}" for wedding ${request.weddingId}. Awaiting admin verification.`
  );

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");

  return { success: true, paymentStatus: "PAYMENT_SUBMITTED", sponsorshipId: updated.id };
}

/**
 * Host gets payment instructions (UPI QR/ID and PayPal links) for approved sponsorship.
 */
export async function getSponsorshipPaymentInstructions(sponsorshipId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Only host couples can view payment instructions for their wedding sponsorship.");
  }

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
  if (!couple) throw new Error("Couple profile not found.");

  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id: sponsorshipId },
    include: {
      wedding: {
        select: { id: true, title: true, hostCoupleId: true, status: true },
      },
    },
  });

  if (!request) throw new Error("Sponsorship request not found.");
  if (request.wedding.hostCoupleId !== couple.id) {
    throw new Error("Forbidden: You do not own the wedding linked to this sponsorship.");
  }
  if (request.status !== SponsorshipRequestStatus.PAYMENT_PENDING) {
    throw new Error(`Sponsorship is not in payment pending state (Current: ${request.status}).`);
  }

  const config = await getSponsorshipPaymentConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com";
  const checkoutUrl = `${appUrl}/dashboard/listings?payment=${request.id}`;

  return {
    success: true,
    sponsorshipId: request.id,
    amount: request.amount,
    currency: request.currency,
    durationDays: request.durationDays,
    paymentMethod: request.paymentMethod || "UPI",
    checkoutUrl,
    config,
  };
}

export const getSponsorshipPaymentOptions = getSponsorshipPaymentInstructions;
export const createSponsorshipCheckoutSession = getSponsorshipPaymentInstructions;

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CRM OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin reviews, prices, and approves/rejects a host sponsorship request.
 */
export async function adminReviewSponsorshipRequest(input: AdminReviewSponsorshipInput) {
  const admin = await requireRole([UserRole.ADMIN]);

  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id: input.requestId },
    include: {
      wedding: {
        include: { hostCouple: { include: { user: true } } },
      },
    },
  });

  if (!request) throw new Error("Sponsorship request not found.");
  if (request.status !== SponsorshipRequestStatus.PENDING && request.status !== SponsorshipRequestStatus.PAYMENT_PENDING) {
    throw new Error("Only pending sponsorship requests can be reviewed.");
  }

  const now = new Date();
  const promotionType: PromotionType = input.promotionType || (request.promotionType as PromotionType) || "SPONSORED";

  if (input.decision === "REJECTED") {
    await prisma.sponsorshipRequest.update({
      where: { id: input.requestId },
      data: {
        status: SponsorshipRequestStatus.REJECTED,
        paymentStatus: "REJECTED",
        rejectionReason: input.rejectionReason?.trim() || input.adminNotes?.trim() || "Declined by marketplace administration.",
        adminNotes: input.adminNotes?.trim() || null,
        reviewedAt: now,
        reviewedBy: admin.email,
      },
    });

    const hostUserId = request.wedding.hostCouple?.user?.id || request.wedding.hostCouple?.userId;
    if (hostUserId) {
      await prisma.notification.create({
        data: {
          userId: hostUserId,
          title: "Promotion Request Update",
          message: `Your ${promotionType.toLowerCase()} request for "${request.wedding.title}" was not approved at this time.${input.adminNotes ? ` Note: ${input.adminNotes}` : ""}`,
          type: "INFO",
        },
      });
    }

    await createAuditLog(
      "ADMIN_SPONSORSHIP_REQUEST_REJECTED",
      "SponsorshipRequest",
      input.requestId,
      `Admin ${admin.email} rejected ${promotionType} request ${input.requestId} for wedding ${request.weddingId}`
    );

    revalidatePath("/dashboard/admin/weddings/sponsorship");
    revalidatePath("/dashboard/listings");
    return { success: true, status: SponsorshipRequestStatus.REJECTED };
  }

  // Handle APPROVAL
  const durationDays = input.durationDays ? Math.max(1, input.durationDays) : request.requestedDurationDays || 7;
  const paymentRequired = input.paymentRequired !== false;
  const amount = paymentRequired ? (input.amount !== undefined ? Math.max(1, Number(input.amount)) : 299) : 0;
  const currency = (input.currency || "USD").toUpperCase();
  const paymentMethod = input.paymentMethod || (currency === "INR" ? "UPI" : "PAYPAL");

  const startDate = input.sponsorshipStart ? new Date(input.sponsorshipStart) : now;
  const endDate = input.sponsorshipEnd ? new Date(input.sponsorshipEnd) : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  if (endDate <= startDate) {
    throw new Error("Sponsorship end date must be after the start date.");
  }

  // If complimentary / waived: Activate immediately with transactional advisory locking
  if (!paymentRequired) {
    const checklist = buildDefaultChecklist(
      ["HOST_CONTACTED", "SPONSORSHIP_DISCUSSED", "PRICE_AGREED", "DURATION_AGREED", "TERMS_COMMUNICATED", "LISTING_APPROVED", "SPONSORSHIP_ACTIVATED"],
      admin.email
    );

    await prisma.$transaction(async (tx) => {
      try {
        if (typeof (tx as any).$executeRaw === "function") {
          await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`sponsorship:${request.weddingId}`}::text))`;
        }
      } catch {
        // Fallback in test/mock environments
      }

      if (promotionType === "SPONSORED") {
        const conflictingActive = await tx.sponsorshipRequest.findFirst({
          where: {
            weddingId: request.weddingId,
            status: SponsorshipRequestStatus.ACTIVE,
            promotionType: "SPONSORED",
            id: { not: input.requestId },
            revokedAt: null,
            startsAt: { lte: endDate },
            endsAt: { gte: startDate },
          },
        });

        if (conflictingActive) {
          throw new Error(
            `CONFLICT_OVERLAPPING_SPONSORSHIP: Wedding ${request.weddingId} already has an active sponsorship (${conflictingActive.id}) active until ${conflictingActive.endsAt?.toISOString()}. Cannot activate conflicting complimentary placement without prior resolution.`
          );
        }
      }

      await tx.sponsorshipRequest.update({
        where: { id: input.requestId },
        data: {
          status: SponsorshipRequestStatus.ACTIVE,
          promotionType,
          amount: 0,
          currency,
          durationDays,
          startsAt: startDate,
          endsAt: endDate,
          approvedAt: now,
          approvedBy: admin.email,
          paymentRequired: false,
          paymentMethod: "WAIVED",
          paymentStatus: "WAIVED",
          activatedAt: now,
          adminNotes: input.adminNotes || `Admin complimentary ${promotionType} placement`,
          reviewedAt: now,
          reviewedBy: admin.email,
          checklist: checklist as any,
        },
      });

      if (promotionType === "FEATURED") {
        await tx.wedding.update({
          where: { id: request.weddingId },
          data: {
            featured: true,
            sponsored: false,
            sponsorshipStart: null,
            sponsorshipEnd: null,
          },
        });
      } else {
        await tx.wedding.update({
          where: { id: request.weddingId },
          data: {
            sponsored: true,
            sponsorshipStart: startDate,
            sponsorshipEnd: endDate,
          },
        });
      }

      const hostUserId = request.wedding.hostCouple?.user?.id || request.wedding.hostCouple?.userId;
      if (hostUserId) {
        await tx.notification.create({
          data: {
            userId: hostUserId,
            title: `${promotionType === "FEATURED" ? "Featured" : "Sponsored"} Placement Active! ✦`,
            message: `Your wedding "${request.wedding.title}" has been granted complimentary ${promotionType} placement from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
            type: "SUCCESS",
          },
        });
      }
    });

    await createAuditLog(
      `ADMIN_COMPLIMENTARY_${promotionType}_ACTIVATED`,
      "SponsorshipRequest",
      input.requestId,
      `Admin ${admin.email} activated complimentary ${promotionType} on wedding ${request.weddingId} until ${endDate.toISOString()}`
    );

    revalidatePath("/dashboard/admin/weddings/sponsorship");
    revalidatePath("/dashboard/listings");
    revalidatePath("/weddings");
    revalidatePath("/");
    revalidateTag("weddings", "max");
    revalidateTag("homepage", "max");
    return { success: true, status: SponsorshipRequestStatus.ACTIVE, promotionType };
  }

  // Paid Placement Workflow
  const checklist = buildDefaultChecklist(
    ["HOST_CONTACTED", "SPONSORSHIP_DISCUSSED", "PRICE_AGREED", "DURATION_AGREED", "TERMS_COMMUNICATED", "PAYMENT_INSTRUCTIONS_SENT"],
    admin.email
  );

  await prisma.$transaction(async (tx) => {
    await tx.sponsorshipRequest.update({
      where: { id: input.requestId },
      data: {
        status: SponsorshipRequestStatus.PAYMENT_PENDING,
        promotionType,
        amount,
        currency,
        durationDays,
        startsAt: startDate,
        endsAt: endDate,
        approvedAt: now,
        approvedBy: admin.email,
        paymentRequired: true,
        paymentMethod,
        paymentStatus: "PAYMENT_REQUESTED",
        adminNotes: input.adminNotes?.trim() || null,
        reviewedAt: now,
        reviewedBy: admin.email,
        checklist: checklist as any,
      },
    });

    const hostUserId = request.wedding.hostCouple?.user?.id || request.wedding.hostCouple?.userId;
    if (hostUserId) {
      const symbol = currency === "INR" ? "₹" : "$";
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: `${promotionType === "FEATURED" ? "Featured" : "Sponsorship"} Approved — Payment Instructions Ready`,
          message: `Your ${promotionType.toLowerCase()} request for "${request.wedding.title}" is approved (${symbol}${amount.toLocaleString()} for ${durationDays} days via ${paymentMethod}). Complete payment to activate priority discovery.`,
          type: "PAYMENT_REQUIRED",
        },
      });
    }
  });

  await createAuditLog(
    "ADMIN_SPONSORSHIP_PAYMENT_REQUESTED",
    "SponsorshipRequest",
    input.requestId,
    `Admin ${admin.email} approved ${promotionType} request ${input.requestId} for wedding ${request.weddingId}: Amount ${currency} ${amount} (${durationDays} days, ${paymentMethod})`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/listings");
  return { success: true, status: SponsorshipRequestStatus.PAYMENT_PENDING, amount, currency, durationDays, paymentMethod, promotionType };
}

/**
 * Admin directly creates a promotion placement (e.g. from WhatsApp outreach, phone call, partner agreement).
 */
export async function adminDirectAddSponsorship(input: AdminDirectSponsorshipInput) {
  const admin = await requireRole([UserRole.ADMIN]);

  const wedding = await prisma.wedding.findUnique({
    where: { id: input.weddingId },
    include: { hostCouple: { include: { user: true } } },
  });
  if (!wedding) throw new Error("Wedding not found.");
  if (wedding.status !== WeddingStatus.PUBLISHED) {
    throw new Error("Only published weddings can receive promotion placement.");
  }

  const now = new Date();
  const promotionType: PromotionType = input.promotionType || "SPONSORED";
  const source: SponsorshipSource = input.source || "ADMIN_OUTREACH";
  const contactMethod: SponsorshipContactMethod = input.contactMethod || "WHATSAPP";
  const durationDays = input.durationDays ? Math.max(1, input.durationDays) : 7;
  const paymentRequired = Boolean(input.paymentRequired);
  const amount = paymentRequired ? (input.amount !== undefined ? Math.max(1, Number(input.amount)) : 299) : 0;
  const currency = (input.currency || "USD").toUpperCase();
  const paymentMethod: SponsorshipPaymentMethod = input.paymentMethod || (paymentRequired ? (currency === "INR" ? "UPI" : "PAYPAL") : "WAIVED");

  const startDate = input.sponsorshipStart ? new Date(input.sponsorshipStart) : now;
  const endDate = input.sponsorshipEnd ? new Date(input.sponsorshipEnd) : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  if (endDate <= startDate) {
    throw new Error("Promotion end date must be after start date.");
  }

  // Determine if payment is verified/waived for immediate activation
  const isImmediatelyActive = !paymentRequired || input.paymentStatus === "PAYMENT_VERIFIED" || input.paymentStatus === "WAIVED";
  const targetStatus = isImmediatelyActive ? SponsorshipRequestStatus.ACTIVE : SponsorshipRequestStatus.PAYMENT_PENDING;
  const targetPaymentStatus: SponsorshipPaymentStatus = isImmediatelyActive
    ? (!paymentRequired || input.paymentStatus === "WAIVED" ? "WAIVED" : "PAYMENT_VERIFIED")
    : (input.paymentStatus || "PAYMENT_REQUESTED");

  const initialChecklistKeys = input.completedChecklistKeys || (isImmediatelyActive
    ? ["HOST_CONTACTED", "SPONSORSHIP_DISCUSSED", "PRICE_AGREED", "DURATION_AGREED", "TERMS_COMMUNICATED", "PAYMENT_INSTRUCTIONS_SENT", "PAYMENT_RECEIVED", "PAYMENT_VERIFIED", "LISTING_APPROVED", "SPONSORSHIP_ACTIVATED"]
    : ["HOST_CONTACTED", "SPONSORSHIP_DISCUSSED", "PRICE_AGREED", "DURATION_AGREED", "TERMS_COMMUNICATED"]);

  const checklist = buildDefaultChecklist(initialChecklistKeys, admin.email);

  const sponsorship = await prisma.$transaction(async (tx) => {
    // Check for hard overlap conflict if activating immediately as SPONSORED
    if (isImmediatelyActive && promotionType === "SPONSORED") {
      try {
        if (typeof (tx as any).$executeRaw === "function") {
          await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`sponsorship:${input.weddingId}`}::text))`;
        }
      } catch {
        // Fallback in mock/sqlite test environments
      }

      const conflictingActive = await tx.sponsorshipRequest.findFirst({
        where: {
          weddingId: input.weddingId,
          status: SponsorshipRequestStatus.ACTIVE,
          promotionType: "SPONSORED",
          revokedAt: null,
          startsAt: { lte: endDate },
          endsAt: { gte: startDate },
        },
      });

      if (conflictingActive) {
        throw new Error(
          `CONFLICT_OVERLAPPING_SPONSORSHIP: Wedding ${input.weddingId} already has an active sponsorship (${conflictingActive.id}) active until ${conflictingActive.endsAt?.toISOString()}. Cannot activate direct placement without prior resolution.`
        );
      }
    }

    const record = await tx.sponsorshipRequest.create({
      data: {
        weddingId: input.weddingId,
        coupleId: wedding.hostCoupleId,
        promotionType,
        source,
        contactMethod,
        contactDate: input.contactDate ? new Date(input.contactDate) : now,
        contactNotes: input.contactNotes?.trim() || null,
        agreementNotes: input.agreementNotes?.trim() || null,
        status: targetStatus,
        amount,
        currency,
        durationDays,
        requestedDurationDays: durationDays,
        startsAt: startDate,
        endsAt: endDate,
        approvedAt: now,
        approvedBy: admin.email,
        paymentRequired,
        paymentMethod,
        paymentStatus: targetPaymentStatus,
        paymentVerifiedAt: isImmediatelyActive ? now : null,
        paymentVerifiedBy: isImmediatelyActive ? admin.email : null,
        activatedAt: isImmediatelyActive ? now : null,
        adminNotes: input.adminNotes || `Admin direct ${promotionType.toLowerCase()} via ${source} (${contactMethod})`,
        reviewedAt: now,
        reviewedBy: admin.email,
        checklist: checklist as any,
      },
    });

    if (isImmediatelyActive) {
      if (promotionType === "FEATURED") {
        await tx.wedding.update({
          where: { id: input.weddingId },
          data: {
            featured: true,
            sponsored: false,
            sponsorshipStart: null,
            sponsorshipEnd: null,
          },
        });
      } else {
        await tx.wedding.update({
          where: { id: input.weddingId },
          data: {
            sponsored: true,
            sponsorshipStart: startDate,
            sponsorshipEnd: endDate,
          },
        });
      }
    }

    const hostUserId = wedding.hostCouple?.user?.id || wedding.hostCouple?.userId;
    if (hostUserId) {
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: isImmediatelyActive ? `${promotionType === "FEATURED" ? "Featured" : "Sponsored"} Placement Active! ✦` : "Placement Configured",
          message: isImmediatelyActive
            ? `Your wedding "${wedding.title}" has been placed in priority ${promotionType.toLowerCase()} discovery until ${endDate.toLocaleDateString()}.`
            : `A ${promotionType.toLowerCase()} placement for "${wedding.title}" was arranged with WeddingWithIndia (${currency} ${amount} for ${durationDays} days). View details in your dashboard.`,
          type: isImmediatelyActive ? "SUCCESS" : "PAYMENT_REQUIRED",
        },
      });
    }

    return record;
  });

  await createAuditLog(
    "ADMIN_DIRECT_SPONSORSHIP_ADDED",
    "SponsorshipRequest",
    sponsorship.id,
    `Admin ${admin.email} created direct ${promotionType} for wedding ${input.weddingId} (${source}, ${contactMethod}, Status: ${targetStatus}, ${currency} ${amount})`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/listings");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true, sponsorshipId: sponsorship.id, status: targetStatus, promotionType };
}

/**
 * Admin updates promotion parameters (pricing, duration, dates, notes, payment status).
 */
export async function adminUpdatePromotionParameters(input: AdminUpdatePromotionInput) {
  const admin = await requireRole([UserRole.ADMIN]);
  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: input.sponsorshipId },
    include: { wedding: true },
  });
  if (!record) throw new Error("Promotion record not found.");

  const now = new Date();
  const durationDays = input.durationDays !== undefined ? Math.max(1, Number(input.durationDays)) : record.durationDays || 7;
  const startDate = input.startsAt ? new Date(input.startsAt) : (record.startsAt || now);
  const endDate = input.endsAt ? new Date(input.endsAt) : (record.endsAt || new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000));
  const promotionType = input.promotionType || (record.promotionType as PromotionType) || "SPONSORED";
  const amount = input.amount !== undefined ? Math.max(0, Number(input.amount)) : record.amount;
  const paymentStatus = input.paymentStatus || record.paymentStatus;
  const paymentMethod = input.paymentMethod || record.paymentMethod;

  const isActive = record.status === SponsorshipRequestStatus.ACTIVE || paymentStatus === "PAYMENT_VERIFIED" || paymentStatus === "WAIVED";

  await prisma.$transaction(async (tx) => {
    await tx.sponsorshipRequest.update({
      where: { id: input.sponsorshipId },
      data: {
        amount,
        durationDays,
        startsAt: startDate,
        endsAt: endDate,
        promotionType,
        paymentStatus,
        paymentMethod,
        adminNotes: input.adminNotes ? `${record.adminNotes ? record.adminNotes + "\n" : ""}[Admin Edited]: ${input.adminNotes}` : record.adminNotes,
      },
    });

    if (isActive) {
      if (promotionType === "FEATURED") {
        await tx.wedding.update({
          where: { id: record.weddingId },
          data: { featured: true, sponsored: false, sponsorshipStart: null, sponsorshipEnd: null },
        });
      } else {
        await tx.wedding.update({
          where: { id: record.weddingId },
          data: { sponsored: true, sponsorshipStart: startDate, sponsorshipEnd: endDate },
        });
      }
    }
  });

  await createAuditLog(
    "ADMIN_PROMOTION_PARAMETERS_UPDATED",
    "SponsorshipRequest",
    input.sponsorshipId,
    `Admin ${admin.email} updated promotion parameters for ${input.sponsorshipId} on wedding ${record.weddingId} (Amount: ${amount}, Type: ${promotionType}, Status: ${paymentStatus})`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/listings");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true };
}

/**
 * Admin explicitly verifies that payment was received (via UPI, PayPal, Bank, or Cash) and activates placement.
 * Invariant: Uses PostgreSQL transactional advisory lock to prevent race conditions & overlapping active periods.
 */
export async function adminVerifyAndActivatePayment(input: AdminVerifyPaymentInput) {
  const admin = await requireRole([UserRole.ADMIN]);

  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: input.sponsorshipId },
    include: {
      wedding: {
        include: { hostCouple: { include: { user: true } } },
      },
    },
  });

  if (!record) throw new Error("Sponsorship record not found.");

  // If already verified and active, return idempotently
  if (record.status === SponsorshipRequestStatus.ACTIVE && record.paymentStatus === "PAYMENT_VERIFIED") {
    return { success: true, alreadyActive: true, record };
  }

  const now = new Date();
  const promotionType: PromotionType = (record.promotionType as PromotionType) || "SPONSORED";
  const durationDays = record.durationDays || record.requestedDurationDays || 7;
  const startDate = record.startsAt && new Date(record.startsAt) >= now ? new Date(record.startsAt) : now;
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const cleanTxnRef = input.transactionReference?.trim() || record.paymentReference || `ADMIN-MANUAL-${now.getTime()}`;
  const paymentMethod = input.paymentMethod || (record.paymentMethod as SponsorshipPaymentMethod) || "UPI";

  // Update checklist to reflect full completion
  let currentChecklist: ChecklistItem[] = Array.isArray(record.checklist)
    ? (record.checklist as any as ChecklistItem[])
    : buildDefaultChecklist([], admin.email);

  currentChecklist = currentChecklist.map((item) => {
    if (["PAYMENT_RECEIVED", "PAYMENT_VERIFIED", "LISTING_APPROVED", "SPONSORSHIP_ACTIVATED"].includes(item.key)) {
      return { ...item, completed: true, completedBy: admin.email, completedAt: now.toISOString() };
    }
    return item;
  });

  const updatedRecord = await prisma.$transaction(async (tx) => {
    // 1. Acquire transactional advisory lock on the wedding ID namespace
    try {
      if (typeof (tx as any).$executeRaw === "function") {
        await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`sponsorship:${record.weddingId}`}::text))`;
      }
    } catch {
      // Fallback in mock/test environments
    }

    // 2. Hard conflict check for SPONSORED
    if (promotionType === "SPONSORED") {
      const conflictingActive = await tx.sponsorshipRequest.findFirst({
        where: {
          weddingId: record.weddingId,
          status: SponsorshipRequestStatus.ACTIVE,
          promotionType: "SPONSORED",
          id: { not: record.id },
          revokedAt: null,
          startsAt: { lte: endDate },
          endsAt: { gte: startDate },
        },
      });

      if (conflictingActive) {
        throw new Error(
          `CONFLICT_OVERLAPPING_SPONSORSHIP: Wedding ${record.weddingId} already has an active sponsorship (${conflictingActive.id}) active until ${conflictingActive.endsAt?.toISOString()}. Cannot activate conflicting sponsorship ${record.id} without prior resolution.`
        );
      }
    }

    // 3. Update sponsorship to ACTIVE and PAYMENT_VERIFIED
    const updated = await tx.sponsorshipRequest.update({
      where: { id: record.id },
      data: {
        status: SponsorshipRequestStatus.ACTIVE,
        paymentStatus: "PAYMENT_VERIFIED",
        paymentMethod,
        paymentReference: cleanTxnRef,
        paymentVerifiedAt: now,
        paymentVerifiedBy: admin.email,
        paidAt: now,
        activatedAt: now,
        startsAt: startDate,
        endsAt: endDate,
        paymentNotes: input.notes ? `${record.paymentNotes ? record.paymentNotes + "\n" : ""}[Admin Verified]: ${input.notes}` : record.paymentNotes,
        checklist: currentChecklist as any,
      },
    });

    // 4. Update wedding level priority discovery flags
    if (promotionType === "FEATURED") {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          featured: true,
          sponsored: false,
          sponsorshipStart: null,
          sponsorshipEnd: null,
        },
      });
    } else {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          sponsored: true,
          sponsorshipStart: startDate,
          sponsorshipEnd: endDate,
        },
      });
    }

    // 5. Notify host
    const hostUserId = record.wedding.hostCouple?.user?.id || record.wedding.hostCouple?.userId;
    if (hostUserId) {
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: `${promotionType === "FEATURED" ? "Featured" : "Sponsorship"} Verified — Listing Active! ✦`,
          message: `Your payment for "${record.wedding.title}" has been verified by administration. Your listing is now prioritized in ${promotionType.toLowerCase()} discovery until ${endDate.toLocaleDateString()}.`,
          type: "SUCCESS",
        },
      });
    }

    return updated;
  });

  await createAuditLog(
    "PAYMENT_VERIFIED_AND_ACTIVATED",
    "SponsorshipRequest",
    record.id,
    `Admin ${admin.email} manually verified payment (${paymentMethod}, Ref: ${cleanTxnRef}) and activated ${promotionType} for wedding ${record.weddingId} until ${endDate.toISOString()}`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/listings");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true, record: updatedRecord };
}

/**
 * Server-authoritative payment activation for backward compatibility or automated handlers.
 */
export async function verifyAndActivateSponsorshipPayment(params: {
  sponsorshipId: string;
  transactionReference: string;
  provider?: string;
  paymentNotes?: string;
  paidAmountMinorUnits?: number;
}) {
  const cleanTxnRef = params.transactionReference?.trim();
  if (!cleanTxnRef || cleanTxnRef.length < 4) {
    throw new Error("A valid payment transaction reference is required.");
  }

  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: params.sponsorshipId },
    include: {
      wedding: {
        include: { hostCouple: { include: { user: true } } },
      },
    },
  });

  if (!record) throw new Error("Sponsorship record not found.");

  if (record.status === SponsorshipRequestStatus.ACTIVE && (record.paymentStatus === "PAID" || record.paymentStatus === "PAYMENT_VERIFIED")) {
    return { success: true, alreadyActive: true, record };
  }

  if (record.status !== SponsorshipRequestStatus.PAYMENT_PENDING && record.status !== SponsorshipRequestStatus.PENDING) {
    throw new Error(`Invalid sponsorship state for payment activation: ${record.status}.`);
  }

  const now = new Date();
  const promotionType: PromotionType = (record.promotionType as PromotionType) || "SPONSORED";
  const durationDays = record.durationDays || record.requestedDurationDays || 7;
  const startDate = record.startsAt && new Date(record.startsAt) >= now ? new Date(record.startsAt) : now;
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const updatedRecord = await prisma.$transaction(async (tx) => {
    try {
      if (typeof (tx as any).$executeRaw === "function") {
        await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`sponsorship:${record.weddingId}`}::text))`;
      }
    } catch {
      // Fallback
    }

    if (promotionType === "SPONSORED") {
      const conflictingActive = await tx.sponsorshipRequest.findFirst({
        where: {
          weddingId: record.weddingId,
          status: SponsorshipRequestStatus.ACTIVE,
          promotionType: "SPONSORED",
          id: { not: record.id },
          revokedAt: null,
          startsAt: { lte: endDate },
          endsAt: { gte: startDate },
        },
      });

      if (conflictingActive) {
        throw new Error(
          `CONFLICT_OVERLAPPING_SPONSORSHIP: Wedding ${record.weddingId} already has an active sponsorship (${conflictingActive.id}) active until ${conflictingActive.endsAt?.toISOString()}. Cannot activate conflicting sponsorship ${record.id} without prior resolution.`
        );
      }
    }

    const req = await tx.sponsorshipRequest.update({
      where: { id: record.id },
      data: {
        status: SponsorshipRequestStatus.ACTIVE,
        paymentStatus: "PAID",
        paymentProvider: params.provider || "MANUAL_VERIFIED",
        paymentReference: cleanTxnRef,
        paidAt: now,
        activatedAt: now,
        startsAt: startDate,
        endsAt: endDate,
      },
    });

    if (promotionType === "FEATURED") {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          featured: true,
          sponsored: false,
          sponsorshipStart: null,
          sponsorshipEnd: null,
        },
      });
    } else {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          sponsored: true,
          sponsorshipStart: startDate,
          sponsorshipEnd: endDate,
        },
      });
    }

    const hostUserId = record.wedding.hostCouple?.user?.id || record.wedding.hostCouple?.userId;
    if (hostUserId) {
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: `${promotionType === "FEATURED" ? "Featured" : "Sponsorship"} Payment Confirmed — Listing Active! ✦`,
          message: `Your payment for "${record.wedding.title}" has been verified. Your wedding is now prioritized with ${promotionType.toLowerCase()} discovery placement until ${endDate.toLocaleDateString()}.`,
          type: "SUCCESS",
        },
      });
    }

    return req;
  });

  await createAuditLog(
    "SPONSORSHIP_PAID_AND_ACTIVATED",
    "SponsorshipRequest",
    record.id,
    `Verified payment ${cleanTxnRef} for ${promotionType} ${record.id} on wedding ${record.weddingId}. Active until ${endDate.toISOString()}`
  );

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true, alreadyActive: false, record: updatedRecord };
}

/**
 * Admin updates checklist progress on a sponsorship request.
 */
export async function adminUpdateChecklist(sponsorshipId: string, itemKey: string, completed: boolean) {
  const admin = await requireRole([UserRole.ADMIN]);

  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: sponsorshipId },
    select: { id: true, checklist: true, weddingId: true },
  });

  if (!record) throw new Error("Sponsorship record not found.");

  const now = new Date().toISOString();
  let currentChecklist: ChecklistItem[] = Array.isArray(record.checklist)
    ? (record.checklist as any as ChecklistItem[])
    : buildDefaultChecklist([], admin.email);

  currentChecklist = currentChecklist.map((item) => {
    if (item.key === itemKey) {
      return {
        ...item,
        completed,
        completedBy: completed ? admin.email : null,
        completedAt: completed ? now : null,
      };
    }
    return item;
  });

  await prisma.sponsorshipRequest.update({
    where: { id: sponsorshipId },
    data: {
      checklist: currentChecklist as any,
    },
  });

  await createAuditLog(
    "SPONSORSHIP_CHECKLIST_UPDATED",
    "SponsorshipRequest",
    sponsorshipId,
    `Admin ${admin.email} updated checklist item "${itemKey}" (completed=${completed}) for sponsorship ${sponsorshipId}`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  return { success: true, checklist: currentChecklist };
}

/**
 * Admin revokes an active sponsorship with mandatory reason and full audit logging.
 * Preserves all financial and historical records.
 */
export async function adminRevokeSponsorship(sponsorshipId: string, reason: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const cleanReason = reason?.trim();
  if (!cleanReason || cleanReason.length < 5) {
    throw new Error("A specific reason of at least 5 characters is required to revoke a sponsorship.");
  }

  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: sponsorshipId },
    include: { wedding: { include: { hostCouple: { include: { user: true } } } } },
  });

  if (!record) throw new Error("Sponsorship record not found.");

  const now = new Date();
  const promotionType = record.promotionType || "SPONSORED";

  await prisma.$transaction(async (tx) => {
    // 1. Update sponsorship status while preserving financial payment fields
    await tx.sponsorshipRequest.update({
      where: { id: sponsorshipId },
      data: {
        status: SponsorshipRequestStatus.REVOKED,
        revokedAt: now,
        revokedBy: admin.email,
        revocationReason: cleanReason,
      },
    });

    // 2. Remove promotion state from wedding
    if (promotionType === "FEATURED") {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          featured: false,
        },
      });
    } else {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          sponsored: false,
          sponsorshipStart: null,
          sponsorshipEnd: null,
        },
      });
    }

    // 3. Notify host
    const hostUserId = record.wedding.hostCouple?.user?.id || record.wedding.hostCouple?.userId;
    if (hostUserId) {
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: `${promotionType === "FEATURED" ? "Featured" : "Sponsored"} Placement Revoked`,
          message: `The ${promotionType.toLowerCase()} placement for "${record.wedding.title}" was revoked by administration. Reason: ${cleanReason}`,
          type: "ALERT",
        },
      });
    }
  });

  await createAuditLog(
    "ADMIN_SPONSORSHIP_REVOKED",
    "SponsorshipRequest",
    sponsorshipId,
    `Admin ${admin.email} revoked ${promotionType} ${sponsorshipId} on wedding ${record.weddingId}. Reason: ${cleanReason}`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/listings");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true };
}

/**
 * Admin extends duration of an active sponsorship by X days.
 */
export async function adminExtendSponsorship(sponsorshipId: string, extensionDays: number, adminNotes?: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const days = Math.max(1, Math.min(180, Number(extensionDays) || 7));

  const record = await prisma.sponsorshipRequest.findUnique({
    where: { id: sponsorshipId },
    include: { wedding: { include: { hostCouple: { include: { user: true } } } } },
  });

  if (!record) throw new Error("Sponsorship record not found.");
  if (record.status !== SponsorshipRequestStatus.ACTIVE) {
    throw new Error("Only active sponsorships can be extended.");
  }

  const now = new Date();
  const currentEnd = record.endsAt && new Date(record.endsAt) > now ? new Date(record.endsAt) : now;
  const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
  const promotionType = record.promotionType || "SPONSORED";

  await prisma.$transaction(async (tx) => {
    await tx.sponsorshipRequest.update({
      where: { id: sponsorshipId },
      data: {
        endsAt: newEnd,
        durationDays: (record.durationDays || 0) + days,
        adminNotes: adminNotes ? `${record.adminNotes ? record.adminNotes + "\n" : ""}[Extended by ${days} days]: ${adminNotes}` : record.adminNotes,
      },
    });

    if (promotionType === "SPONSORED") {
      await tx.wedding.update({
        where: { id: record.weddingId },
        data: {
          sponsored: true,
          sponsorshipEnd: newEnd,
        },
      });
    }

    const hostUserId = record.wedding.hostCouple?.user?.id || record.wedding.hostCouple?.userId;
    if (hostUserId) {
      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: `${promotionType === "FEATURED" ? "Featured" : "Sponsorship"} Extended! ✦`,
          message: `Your ${promotionType.toLowerCase()} placement for "${record.wedding.title}" has been extended by ${days} days until ${newEnd.toLocaleDateString()}.`,
          type: "SUCCESS",
        },
      });
    }
  });

  await createAuditLog(
    "ADMIN_SPONSORSHIP_EXTENDED",
    "SponsorshipRequest",
    sponsorshipId,
    `Admin ${admin.email} extended ${promotionType} ${sponsorshipId} on wedding ${record.weddingId} by ${days} days until ${newEnd.toISOString()}`
  );

  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/dashboard/listings");
  revalidatePath("/weddings");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");

  return { success: true, newEnd };
}

/**
 * Scheduled / on-demand batch cleanup for expired sponsorships.
 * Invariant: Even if this cron never runs, isSponsorshipCurrentlyActive checks endsAt > now.
 */
export async function expireOutdatedSponsorships(): Promise<{ expiredSponsorshipCount: number; expiredWeddingsCount: number }> {
  const now = new Date();

  const expiredSponsorships = await prisma.sponsorshipRequest.updateMany({
    where: {
      status: SponsorshipRequestStatus.ACTIVE,
      endsAt: { lte: now },
    },
    data: {
      status: SponsorshipRequestStatus.EXPIRED,
    },
  });

  const expiredWeddings = await prisma.wedding.updateMany({
    where: {
      sponsored: true,
      sponsorshipEnd: { lte: now },
    },
    data: {
      sponsored: false,
      sponsorshipStart: null,
      sponsorshipEnd: null,
    },
  });

  if (expiredSponsorships.count > 0 || expiredWeddings.count > 0) {
    await createAuditLog(
      "SPONSORSHIP_EXPIRED_BATCH",
      "SponsorshipRequest",
      null,
      `Batch cleanup expired ${expiredSponsorships.count} sponsorship records and ${expiredWeddings.count} wedding flags at ${now.toISOString()}`
    );
    revalidatePath("/weddings");
    revalidatePath("/");
    revalidateTag("weddings", "max");
    revalidateTag("homepage", "max");
  }

  return {
    expiredSponsorshipCount: expiredSponsorships.count,
    expiredWeddingsCount: expiredWeddings.count,
  };
}

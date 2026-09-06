/**
 * lib/services/refunds.ts
 *
 * Centralized service for processing traveler refunds, maintaining database/ledger consistency,
 * and orchestrating interactions with the Stripe API.
 */

import { prisma } from "../prisma";
import { BookingStatus, PaymentStatus, CancellationStatus, CancellationReasonCode, CancellationActor, ReputationEntityType, ReputationEventType } from "@prisma/client";
import { calculateCancellationPolicy } from "./cancellation-policy";
import { sendRefundConfirmationEmail } from "../email";
import { logReputationEvent } from "./reputation";

export interface RefundEligibilityResult {
  eligible: boolean;
  totalPaid: number;
  eligibleRefundAmount: number;
  explanation: string;
}

/**
 * Calculates if a booking is eligible for cancellation and refund.
 */
export async function calculateRefundEligibility(
  bookingId: string,
  actor: CancellationActor,
  reasonCode: CancellationReasonCode
): Promise<RefundEligibilityResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      wedding: true,
      payments: {
        where: { status: PaymentStatus.PAID },
      },
    },
  });

  if (!booking) {
    return { eligible: false, totalPaid: 0, eligibleRefundAmount: 0, explanation: "Booking not found." };
  }

  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);

  const policy = calculateCancellationPolicy({
    eventDate: booking.wedding.date,
    totalAmount: totalPaid,
    actor,
    status: booking.status,
    reasonCode,
    cancellationDate: new Date(),
  });

  return {
    eligible: policy.eligible,
    totalPaid,
    eligibleRefundAmount: policy.refundableAmount,
    explanation: policy.explanation,
  };
}

/**
 * Creates a formal CancellationRequest inside a transaction.
 */
export async function createCancellationRequest({
  bookingId,
  requestedById,
  actorRole,
  reasonCode,
  reasonText,
}: {
  bookingId: string;
  requestedById: string;
  actorRole: CancellationActor;
  reasonCode: CancellationReasonCode;
  reasonText?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        wedding: true,
        payments: {
          where: { status: PaymentStatus.PAID },
        },
      },
    });

    if (!booking) throw new Error("Booking not found.");

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REFUNDED) {
      const existing = await tx.cancellationRequest.findFirst({
        where: { bookingId },
      });
      if (existing) return existing;
    }

    // Run policies in transaction context
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
    const policy = calculateCancellationPolicy({
      eventDate: booking.wedding.date,
      totalAmount: totalPaid,
      actor: actorRole,
      status: booking.status,
      reasonCode,
      cancellationDate: new Date(),
    });

    if (!policy.eligible) {
      throw new Error(`Cancellation denied: ${policy.explanation}`);
    }

    // Set Booking status to CANCELLED (or keep PAID/UNDER_REVIEW depending on approval status)
    // If traveler-initiated with $0 refund or host-initiated, it auto-approves.
    // If under 30 days and requires review, set to UNDER_REVIEW.
    const requiresReview = actorRole === CancellationActor.TRAVELER && policy.refundableAmount > 0;
    const initialStatus = requiresReview ? CancellationStatus.REQUESTED : CancellationStatus.AUTO_APPROVED;

    const request = await tx.cancellationRequest.create({
      data: {
        bookingId,
        requestedById,
        actorRole,
        reasonCode,
        reasonText,
        status: initialStatus,
        originalAmount: totalPaid,
        eligibleRefundAmount: policy.refundableAmount,
        approvedRefundAmount: policy.refundableAmount,
        currency: "USD",
        policySnapshot: JSON.stringify(policy),
      },
    });

    if (initialStatus === CancellationStatus.AUTO_APPROVED && booking.status !== BookingStatus.PAID) {
      // Auto-update booking state
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // Authoritative Invariant: Revoke all active guest passes for the cancelled booking
      await tx.guestPass.updateMany({
        where: { bookingId, status: "ACTIVE" },
        data: { status: "REVOKED" },
      });
    }

    return request;
  });
}

/**
 * Persists refund intent and initiates Stripe refund asynchronously.
 */
/**
 * Persists refund intent and completes approved refund.
 */
export async function processApprovedRefund(cancellationRequestId: string, adminUserId: string) {
  const request = await prisma.cancellationRequest.findUnique({
    where: { id: cancellationRequestId },
    include: {
      booking: {
        include: {
          payments: { where: { status: PaymentStatus.PAID } },
          traveler: { include: { user: true } },
          wedding: true,
        },
      },
    },
  });

  if (!request) throw new Error("Cancellation request not found.");
  if (request.status !== CancellationStatus.REQUESTED && request.status !== CancellationStatus.AUTO_APPROVED) {
    throw new Error("Cancellation request is already resolved or processed.");
  }

  const payment = request.booking.payments[0];
  if (!payment) {
    // If not paid (e.g. status AWAITING_PAYMENT), just complete request directly
    await prisma.cancellationRequest.update({
      where: { id: cancellationRequestId },
      data: {
        status: CancellationStatus.COMPLETED,
        reviewedById: adminUserId,
        completedAt: new Date(),
      },
    });
    return { success: true, message: "Booking cancelled. No payments refunded." };
  }

  const refundTxnId = `REF-CANCEL-${Date.now()}`;

  const refundRecord = await prisma.$transaction(async (tx) => {
    // Check if already processed
    const existing = await tx.refund.findFirst({
      where: { paymentId: payment.id, cancellationRequestId },
    });
    if (existing) return existing;

    // Transition cancellation request state to COMPLETED
    await tx.cancellationRequest.update({
      where: { id: cancellationRequestId },
      data: {
        status: CancellationStatus.COMPLETED,
        reviewedById: adminUserId,
        completedAt: new Date(),
      },
    });

    // Update payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundStatus: "REFUNDED",
        refundedAt: new Date(),
        refundTransactionId: refundTxnId,
      },
    });

    // Update booking
    await tx.booking.update({
      where: { id: request.bookingId },
      data: {
        status: BookingStatus.REFUNDED,
      },
    });

    // Authoritative Invariant: Revoke all active guest passes for the refunded booking
    if (tx.guestPass?.updateMany) {
      await tx.guestPass.updateMany({
        where: {
          bookingId: request.bookingId,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
        },
      });
    }

    // Record Transaction
    await tx.transaction.create({
      data: {
        paymentId: payment.id,
        type: "REFUND",
        amount: request.approvedRefundAmount,
        status: "SUCCESS",
        referenceId: refundTxnId,
      },
    });

    return await tx.refund.create({
      data: {
        paymentId: payment.id,
        cancellationRequestId,
        amount: request.approvedRefundAmount,
        reason: request.reasonText || `Refund for cancellation request: ${cancellationRequestId}`,
        refundTransactionId: refundTxnId,
        status: "SUCCESS",
      },
    });
  });

  try {
    await sendRefundConfirmationEmail(
      request.booking.traveler.user.email,
      request.booking.traveler.fullName,
      request.booking.wedding.title,
      refundTxnId,
      request.approvedRefundAmount
    );
  } catch (emailErr) {
    console.error("[refunds] Failed to send email:", emailErr);
  }

  return { success: true, refundId: refundRecord.id, refundTxnId };
}

/**
 * Classifies a refund reason string into a typed policy category.
 */
export function classifyRefundReason(
  reason: string | null
): "HOST_CAUSED" | "TRAVELER_POLICY" | "SAFETY" | "PLATFORM_ERROR" | "ADMIN_GOODWILL" | "PAYMENT_ERROR" {
  if (!reason) return "TRAVELER_POLICY";
  const normalized = reason.toUpperCase().trim();
  if (normalized.includes("HOST_CAUSED") || normalized.includes("HOST_CANCEL") || normalized.includes("HOST")) {
    return "HOST_CAUSED";
  }
  if (normalized.includes("SAFETY") || normalized.includes("DISPUTE") || normalized.includes("HARASSMENT")) {
    return "SAFETY";
  }
  if (normalized.includes("PLATFORM_ERROR") || normalized.includes("SYSTEM_ERROR") || normalized.includes("BUG")) {
    return "PLATFORM_ERROR";
  }
  if (normalized.includes("ADMIN_GOODWILL") || normalized.includes("GOODWILL") || normalized.includes("COURTESY")) {
    return "ADMIN_GOODWILL";
  }
  if (normalized.includes("PAYMENT_ERROR") || normalized.includes("CHARGEBACK") || normalized.includes("DOUBLE_CHARGE")) {
    return "PAYMENT_ERROR";
  }
  return "TRAVELER_POLICY";
}

/**
 * Handles Webhook refund success confirmation to finalize database records.
 */
export async function handleStripeRefundSucceeded(stripeRefundId: string, stripePaymentIntentId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.findFirst({
      where: {
        OR: [
          { stripeRefundId },
          {
            payment: {
              stripePaymentIntentId,
            },
            status: "PENDING",
          },
        ],
      },
      include: {
        cancellationRequest: true,
        payment: {
          include: {
            booking: {
              include: {
                traveler: { include: { user: true } },
                wedding: true,
              },
            },
          },
        },
      },
    });

    if (!refund) return null;
    if (refund.status === "SUCCESS") return null; // Idempotent

    // 1. Finalize Refund record
    await tx.refund.update({
      where: { id: refund.id },
      data: {
        status: "SUCCESS",
        stripeRefundId,
      },
    });

    // 2. Finalize Payment status
    await tx.payment.update({
      where: { id: refund.paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    // 3. Finalize Booking status
    await tx.booking.update({
      where: { id: refund.payment.bookingId },
      data: { status: BookingStatus.REFUNDED },
    });

    // 4. Create Transaction Ledger entry
    await tx.transaction.create({
      data: {
        paymentId: refund.paymentId,
        type: "REFUND",
        amount: refund.amount,
        status: "SUCCESS",
        referenceId: stripeRefundId,
      },
    });

    // 5. Finalize CancellationRequest if linked
    if (refund.cancellationRequestId) {
      await tx.cancellationRequest.update({
        where: { id: refund.cancellationRequestId },
        data: {
          status: CancellationStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    // 6. Reverse Agent Referrals Commissions
    try {
      const { reverseBookingCommissionAction } = require("../actions/referrals");
      await reverseBookingCommissionAction(tx, refund.paymentId, refund.id);
    } catch (commErr) {
      console.error("[refunds] Failed to reverse commission:", commErr);
    }

    // 7. Send confirmation email
    try {
      await sendRefundConfirmationEmail(
        refund.payment.booking.traveler.user.email,
        refund.payment.booking.traveler.fullName,
        refund.payment.booking.wedding.title,
        stripeRefundId,
        refund.amount
      );
    } catch (emailErr) {
      console.error("[refunds] Failed to send email:", emailErr);
    }

    return {
      cancellationRequest: refund.cancellationRequest,
      booking: refund.payment.booking,
      refundId: refund.id,
      refundReason: refund.reason
    };
  });

  if (result) {
    const { cancellationRequest, booking, refundId, refundReason } = result;
    const classification = classifyRefundReason(refundReason);

    const shouldPenalizeWedding = classification === "HOST_CAUSED" || classification === "TRAVELER_POLICY";

    if (shouldPenalizeWedding) {
      // Log REFUND_ISSUED for the wedding
      await logReputationEvent({
        entityType: ReputationEntityType.WEDDING,
        entityId: booking.weddingId,
        type: ReputationEventType.REFUND_ISSUED,
        scoreEffect: -2,
        referenceId: refundId,
        idempotencyKey: `REFUND_ISSUED:WEDDING:${refundId}`
      });
    }

    if (cancellationRequest) {
      if (cancellationRequest.actorRole === "HOST" || classification === "HOST_CAUSED") {
        await logReputationEvent({
          entityType: ReputationEntityType.HOST,
          entityId: booking.wedding.hostCoupleId,
          type: ReputationEventType.HOST_CANCELLED,
          scoreEffect: -30,
          referenceId: cancellationRequest.id,
          idempotencyKey: `HOST_CANCELLED:HOST:${cancellationRequest.id}`
        });

        await logReputationEvent({
          entityType: ReputationEntityType.WEDDING,
          entityId: booking.weddingId,
          type: ReputationEventType.HOST_CANCELLED,
          scoreEffect: -30,
          referenceId: cancellationRequest.id,
          idempotencyKey: `HOST_CANCELLED:WEDDING:${cancellationRequest.id}`
        });
      } else if (cancellationRequest.actorRole === "TRAVELER" && classification === "TRAVELER_POLICY") {
        await logReputationEvent({
          entityType: ReputationEntityType.TRAVELER,
          entityId: booking.travelerId,
          type: ReputationEventType.TRAVELER_CANCELLED,
          scoreEffect: -5,
          referenceId: cancellationRequest.id,
          idempotencyKey: `TRAVELER_CANCELLED:TRAVELER:${cancellationRequest.id}`
        });
      }
    }
  }
}

/**
 * Handles Webhook refund failure notification.
 */
export async function handleStripeRefundFailed(stripeRefundId: string) {
  return await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.findFirst({
      where: { stripeRefundId },
    });

    if (!refund) return;

    await tx.refund.update({
      where: { id: refund.id },
      data: { status: "FAILED" },
    });

    if (refund.cancellationRequestId) {
      await tx.cancellationRequest.update({
        where: { id: refund.cancellationRequestId },
        data: { status: CancellationStatus.FAILED },
      });
    }
  });
}

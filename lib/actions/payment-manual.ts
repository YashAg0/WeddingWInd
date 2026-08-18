/**
 * lib/actions/payment-manual.ts
 *
 * Server Actions for Manual PayPal Payment Lifecycle:
 * - Admin Payment Request creation & updates
 * - Admin Manual Transaction Verification & Confirmation (Mark as Paid)
 * - Admin Manual Refund Recording
 * - Traveler Payment Request Details Retrieval
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { UserRole } from "@prisma/client";
import {
  createOrUpdatePaymentRequestAtomic,
  markPaymentPaidAtomic,
  recordManualRefundAtomic,
  calculatePaymentBreakdown,
  getPaymentSystemConfig,
  validatePaymentLink,
} from "../services/payments";
import { createAuditLog } from "./admin";
import { sendHostApprovalWithPaymentLinkEmail } from "../email";
import { sendRefundConfirmationEmail, sendInvoiceEmail } from "../email";

/**
 * 1. Admin creates or sends a payment request to a customer with PayPal payment/invoice URL.
 */
export async function adminRequestPaymentAction(params: {
  bookingId: string;
  baseAmount?: number;
  feePercent?: number | null;
  feeFixedAmount?: number | null;
  currency?: string;
  paymentLink: string;
  paymentNotes?: string | null;
  allowOverride?: boolean;
  overrideReason?: string;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  const result = await prisma.$transaction(async (tx) => {
    return await createOrUpdatePaymentRequestAtomic(tx, {
      bookingId: params.bookingId,
      baseAmount: params.baseAmount,
      feePercent: params.feePercent,
      feeFixedAmount: params.feeFixedAmount,
      currency: params.currency,
      paymentLink: params.paymentLink,
      paymentNotes: params.paymentNotes,
      allowOverride: params.allowOverride,
      adminUserId: admin.id,
      adminEmail: admin.email,
    });
  });

  const auditNote = params.allowOverride
    ? `Admin (${admin.email}) requested OVERRIDDEN payment of ${result.currency} $${result.breakdown.totalAmount} (Reason: ${params.overrideReason || "Manual override"}) for Booking ${params.bookingId}`
    : `Admin (${admin.email}) requested payment of ${result.currency} $${result.breakdown.totalAmount} for Booking ${params.bookingId}`;

  await createAuditLog(
    params.allowOverride ? "PAYMENT_REQUEST_OVERRIDE" : "PAYMENT_REQUESTED",
    "Payment",
    result.payment.id,
    auditNote
  );

  // Dispatch Email Notification to Traveler
  const travelerEmail = result.booking?.traveler?.user?.email;
  const travelerName = result.booking?.traveler?.fullName || "Guest";
  const weddingTitle = result.booking?.wedding?.title || "Wedding Celebration";
  if (travelerEmail) {
    try {
      await sendHostApprovalWithPaymentLinkEmail(
        travelerEmail,
        travelerName,
        weddingTitle,
        result.payment.paymentLink || "https://paypal.com"
      );
    } catch (emailErr) {
      console.error("[adminRequestPaymentAction] Failed to dispatch payment request email:", emailErr);
    }
  }

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");

  return {
    success: true,
    payment: JSON.parse(JSON.stringify(result.payment)),
    booking: JSON.parse(JSON.stringify(result.booking)),
    bookingStatus: result.booking.status,
    breakdown: result.breakdown,
  };
}

/**
 * 2. Admin edits or updates an existing payment request before confirmation.
 */
export async function adminUpdatePaymentRequestAction(params: {
  paymentId: string;
  baseAmount: number;
  feePercent?: number | null;
  feeFixedAmount?: number | null;
  currency?: string;
  paymentLink: string;
  paymentNotes?: string | null;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { booking: true },
  });

  if (!payment) throw new Error("Payment record not found.");
  if (payment.status === "PAID") {
    throw new Error("Cannot modify a payment request that has already been verified and marked PAID.");
  }

  const sysConfig = await getPaymentSystemConfig();
  const urlCheck = validatePaymentLink(params.paymentLink, sysConfig.domainAllowlist);
  if (!urlCheck.valid) {
    throw new Error(urlCheck.reason || "Invalid payment URL.");
  }

  const breakdown = calculatePaymentBreakdown({
    baseAmount: params.baseAmount,
    feePercent: params.feePercent ?? sysConfig.feePercent,
    feeFixedAmount: params.feeFixedAmount ?? sysConfig.feeFixed,
  });

  const currency = (params.currency || payment.currency || "USD").toUpperCase();

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({
      where: { id: params.paymentId },
      data: {
        amount: breakdown.totalAmount,
        baseAmount: breakdown.baseAmount,
        processingFeePercent: breakdown.processingFeePercent,
        processingFeeAmount: breakdown.processingFeeAmount,
        totalAmount: breakdown.totalAmount,
        currency,
        paymentLink: urlCheck.normalizedUrl,
        paymentNotes: params.paymentNotes || null,
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        totalAmount: breakdown.totalAmount,
      },
    });

    return p;
  });

  await createAuditLog(
    "PAYMENT_REQUEST_UPDATED",
    "Payment",
    params.paymentId,
    `Admin (${admin.email}) updated payment request to ${currency} $${breakdown.totalAmount}`
  );

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/bookings");

  return { success: true, payment: JSON.parse(JSON.stringify(updated)), breakdown };
}

/**
 * 3. Admin manually verifies external PayPal transaction and confirms payment (Mark as Paid).
 * Atomic & Idempotent.
 */
export async function adminMarkPaymentPaidAction(params: {
  paymentId: string;
  transactionId: string;
  paymentNotes?: string | null;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  const cleanTxnId = params.transactionId?.trim();
  if (!cleanTxnId) {
    throw new Error("PayPal Transaction ID is required to confirm payment.");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      return await markPaymentPaidAtomic(tx, {
        paymentId: params.paymentId,
        transactionId: cleanTxnId,
        paymentNotes: params.paymentNotes,
        adminUserId: admin.id,
        adminEmail: admin.email,
      });
    },
    { maxWait: 10000, timeout: 15000 }
  );

  if (!result.alreadyPaid) {
    await createAuditLog(
      "PAYMENT_MARKED_PAID",
      "Payment",
      params.paymentId,
      `Admin (${admin.email}) verified PayPal transaction "${cleanTxnId}" for $${result.payment.amount} ${result.payment.currency}. GuestPass generated: ${result.guestPassCreated}`
    );

    // Send confirmation email asynchronously outside transaction
    if (result.emailData) {
      try {
        await sendInvoiceEmail(
          result.emailData.email,
          result.emailData.fullName,
          result.emailData.weddingTitle,
          cleanTxnId,
          result.emailData.totalAmount,
          result.emailData.guestsCount,
          result.emailData.bookingDateStr
        );
      } catch (emailErr) {
        console.error("[adminMarkPaymentPaidAction] Email dispatch note:", emailErr);
      }
    }
  }

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/event-hub");
  revalidatePath("/dashboard");

  return {
    success: true,
    alreadyPaid: result.alreadyPaid,
    payment: JSON.parse(JSON.stringify(result.payment)),
  };
}

/**
 * 4. Admin records a manual refund executed outside the platform via PayPal.
 */
export async function adminRecordManualRefundAction(params: {
  paymentId: string;
  refundAmount?: number;
  reason?: string;
  refundTransactionId?: string;
  refundNotes?: string;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  const result = await prisma.$transaction(
    async (tx) => {
      return await recordManualRefundAtomic(tx, {
        paymentId: params.paymentId,
        refundAmount: params.refundAmount,
        reason: params.reason,
        refundTransactionId: params.refundTransactionId,
        refundNotes: params.refundNotes,
        adminUserId: admin.id,
        adminEmail: admin.email,
      });
    },
    { maxWait: 10000, timeout: 15000 }
  );

  await createAuditLog(
    "PAYMENT_REFUNDED",
    "Payment",
    params.paymentId,
    `Admin (${admin.email}) recorded manual PayPal refund of $${result.refundAmount} (Ref: ${result.refundTxnId}). Reason: ${params.reason || "Manual refund"}`
  );

  // Send refund confirmation email outside transaction
  try {
    await sendRefundConfirmationEmail(
      result.travelerEmail,
      result.travelerName,
      result.weddingTitle,
      result.refundTxnId,
      result.refundAmount
    );
  } catch (emailErr) {
    console.error("[adminRecordManualRefundAction] Email dispatch note:", emailErr);
  }

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");

  return { success: true, refund: JSON.parse(JSON.stringify(result.refund)) };
}

/**
 * 5. Traveler retrieves payment request details for their booking.
 */
export async function travelerGetPaymentDetailsAction(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: true,
      wedding: { select: { id: true, title: true, location: true, mainImageUrl: true, date: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) throw new Error("Booking not found.");

  const isOwner = booking.traveler?.userId === user.id;
  const isAdmin = user.role === UserRole.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new Error("Forbidden: You do not have permission to view payment details for this booking.");
  }

  const latestPayment = booking.payments[0] || null;

  return {
    success: true,
    booking: {
      id: booking.id,
      status: booking.status,
      date: booking.date instanceof Date ? booking.date.toISOString().split("T")[0] : String(booking.date || ""),
      guestsCount: booking.guestsCount || 1,
      weddingTitle: booking.wedding?.title || "Wedding Celebration",
      weddingLocation: booking.wedding?.location || "India",
    },
    payment: latestPayment
      ? {
          id: latestPayment.id,
          provider: latestPayment.provider,
          status: latestPayment.status,
          currency: latestPayment.currency,
          amount: latestPayment.amount,
          baseAmount: latestPayment.baseAmount ?? latestPayment.amount,
          processingFeePercent: latestPayment.processingFeePercent ?? 0,
          processingFeeAmount: latestPayment.processingFeeAmount ?? 0,
          totalAmount: latestPayment.totalAmount ?? latestPayment.amount,
          paymentLink: latestPayment.paymentLink,
          paymentNotes: latestPayment.paymentNotes,
          transactionId: latestPayment.transactionId,
          paymentRequestedAt: latestPayment.paymentRequestedAt?.toISOString() || null,
          paidAt: latestPayment.paidAt?.toISOString() || null,
        }
      : null,
  };
}

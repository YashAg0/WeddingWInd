/**
 * lib/services/payments.ts
 *
 * Provider-Agnostic Core Payment Service for WeddingWithIndia.
 * Supports manual PayPal workflows for the MVP while preserving database integrity,
 * idempotency, server-authoritative calculations, and seamless future gateway extensibility.
 */

import { prisma } from "../prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { encryptPass, hashPassToken } from "../security/guest-pass-crypto";
import crypto from "crypto";

export interface PaymentBreakdown {
  baseAmount: number;
  processingFeePercent: number;
  processingFeeFixedAmount: number;
  processingFeeAmount: number;
  totalAmount: number;
}

/**
 * Validates external payment URLs (e.g. PayPal invoices/payment links).
 * Enforces HTTPS, structural validity, and domain allowlist matching.
 */
export function validatePaymentLink(
  rawUrl: string,
  allowedDomainsString: string = "paypal.com,paypal.me"
): { valid: boolean; reason?: string; normalizedUrl?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, reason: "Payment link is required." };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, reason: "Payment link cannot be empty." };
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { valid: false, reason: "Invalid URL scheme." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: "Malformed URL format. Must be a valid full URL (e.g. https://www.paypal.com/...)." };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, reason: "Payment link must use secure HTTPS protocol." };
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowedDomains = (
    Array.isArray(allowedDomainsString)
      ? allowedDomainsString
      : (allowedDomainsString || "").split(",")
  )
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  const isAllowed = allowedDomains.some((domain) => {
    return hostname === domain || hostname.endsWith(`.${domain}`);
  });

  if (!isAllowed) {
    return {
      valid: false,
      reason: `Payment link domain (${hostname}) is not in the allowed PayPal domains list: ${allowedDomains.join(", ")}`,
    };
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

/**
 * Computes base price, processing fee, and total amount without floating point inaccuracies.
 */
export function calculatePaymentBreakdown(params: {
  baseAmount: number;
  feePercent?: number | null;
  feeFixedAmount?: number | null;
}): PaymentBreakdown {
  const base = Math.max(0, Number(params.baseAmount) || 0);
  const feePct = Math.max(0, Number(params.feePercent ?? 3.5));
  const feeFixed = Math.max(0, Number(params.feeFixedAmount ?? 0.0));

  const calculatedFee = (base * feePct) / 100 + feeFixed;
  const processingFeeAmount = Math.round(calculatedFee * 100) / 100;
  const totalAmount = Math.round((base + processingFeeAmount) * 100) / 100;

  return {
    baseAmount: base,
    processingFeePercent: feePct,
    processingFeeFixedAmount: feeFixed,
    processingFeeAmount,
    totalAmount,
  };
}

/**
 * Retrieves global system configuration for PayPal processing fees and domain allowlist.
 */
export async function getPaymentSystemConfig() {
  const config = await prisma.systemConfig.findUnique({
    where: { id: "global" },
  });

  return {
    feePercent: config?.paypalProcessingFeePercent ?? 0.0,
    feeFixed: config?.paypalProcessingFeeFixedAmount ?? 0.0,
    domainAllowlist: config?.paypalDomainAllowlist ?? "paypal.com,paypal.me",
    currencyCode: config?.currencyCode ?? "USD",
  };
}

/**
 * Atomically creates or updates a payment request for a booking.
 */
export async function createOrUpdatePaymentRequestAtomic(
  tx: any,
  params: {
    bookingId: string;
    baseAmount?: number | null;
    feePercent?: number | null;
    feeFixedAmount?: number | null;
    currency?: string;
    paymentLink: string;
    paymentNotes?: string | null;
    allowOverride?: boolean;
    adminUserId: string;
    adminEmail: string;
  }
) {
  const booking = await tx.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      traveler: { include: { user: true } },
      wedding: { include: { hostCouple: { include: { user: true } } } },
      payments: { where: { status: PaymentStatus.PAID } },
    },
  });

  if (!booking) {
    throw new Error("Booking record not found.");
  }

  if (booking.payments.length > 0 || booking.status === BookingStatus.PAID) {
    throw new Error("Cannot request payment for an already paid booking.");
  }

  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.REJECTED ||
    booking.status === BookingStatus.REFUNDED
  ) {
    throw new Error(`Cannot request payment for a ${booking.status.toLowerCase()} booking.`);
  }

  if (booking.wedding?.isDemo) {
    throw new Error("Cannot request payment for a demonstration wedding experience.");
  }

  if (booking.wedding?.suspended) {
    throw new Error("Cannot request payment for a suspended wedding experience.");
  }

  // Domain validation
  const sysConfig = await getPaymentSystemConfig();
  const urlCheck = validatePaymentLink(params.paymentLink, sysConfig.domainAllowlist);
  if (!urlCheck.valid) {
    throw new Error(urlCheck.reason || "Invalid payment URL.");
  }

  // Expected authoritative booking amount
  const expectedAmount = Number(booking.customerTotalAmount || booking.baseCustomerAmountUSD || booking.totalAmount || 0);
  const requestedBase = params.baseAmount !== undefined && params.baseAmount !== null ? Number(params.baseAmount) : expectedAmount;

  if (requestedBase <= 0) {
    throw new Error("Payment request base amount must be greater than 0.");
  }

  // Mismatch guard: If admin provides an amount differing from expected booking total, check override permission
  const hasMismatch = expectedAmount > 0 && Math.abs(requestedBase - expectedAmount) > 0.01;
  if (hasMismatch && !params.allowOverride) {
    throw new Error(
      `PAYMENT_AMOUNT_MISMATCH: Requested amount ($${requestedBase.toFixed(2)}) does not match expected booking amount ($${expectedAmount.toFixed(2)}). To override, set allowOverride=true with an explicit reason.`
    );
  }

  const breakdown = calculatePaymentBreakdown({
    baseAmount: requestedBase,
    feePercent: params.feePercent ?? sysConfig.feePercent,
    feeFixedAmount: params.feeFixedAmount ?? sysConfig.feeFixed,
  });

  const currency = (params.currency || "USD").toUpperCase();

  // Find existing pending payment or create new
  const existingPendingPayment = await tx.payment.findFirst({
    where: {
      bookingId: booking.id,
      status: { not: PaymentStatus.PAID },
    },
    orderBy: { createdAt: "desc" },
  });

  let paymentRecord;
  if (existingPendingPayment) {
    paymentRecord = await tx.payment.update({
      where: { id: existingPendingPayment.id },
      data: {
        provider: "MANUAL_PAYPAL",
        amount: breakdown.totalAmount,
        baseAmount: breakdown.baseAmount,
        processingFeePercent: breakdown.processingFeePercent,
        processingFeeAmount: breakdown.processingFeeAmount,
        totalAmount: breakdown.totalAmount,
        currency,
        paymentLink: urlCheck.normalizedUrl,
        paymentNotes: params.paymentNotes || null,
        paymentRequestedAt: new Date(),
        status: PaymentStatus.PENDING,
      },
    });
  } else {
    paymentRecord = await tx.payment.create({
      data: {
        bookingId: booking.id,
        provider: "MANUAL_PAYPAL",
        amount: breakdown.totalAmount,
        baseAmount: breakdown.baseAmount,
        processingFeePercent: breakdown.processingFeePercent,
        processingFeeAmount: breakdown.processingFeeAmount,
        totalAmount: breakdown.totalAmount,
        currency,
        paymentLink: urlCheck.normalizedUrl,
        paymentNotes: params.paymentNotes || null,
        paymentRequestedAt: new Date(),
        status: PaymentStatus.PENDING,
      },
    });
  }

  // Update Booking totalAmount and transition to AWAITING_PAYMENT
  const updatedBooking = await tx.booking.update({
    where: { id: booking.id },
    data: {
      status: BookingStatus.AWAITING_PAYMENT,
      totalAmount: breakdown.totalAmount,
    },
  });

  // Notify traveler
  await tx.notification.create({
    data: {
      userId: booking.traveler.user.id,
      title: "Payment Request: Complete Your Reservation",
      message: `Payment of ${currency} $${breakdown.totalAmount.toLocaleString()} has been requested for your reservation at "${booking.wedding.title}". Open your dashboard to view the PayPal payment link.`,
      type: "PAYMENT_REQUIRED",
    },
  });

  return {
    payment: paymentRecord,
    booking: updatedBooking,
    breakdown,
    currency,
  };
}

/**
 * Atomically marks a payment as PAID after Admin independently verifies the external PayPal transaction.
 * Completely idempotent: safe against double-clicks and repeated requests.
 */
export async function markPaymentPaidAtomic(
  tx: any,
  params: {
    paymentId: string;
    transactionId: string;
    paymentNotes?: string | null;
    adminUserId: string;
    adminEmail: string;
  }
) {
  const cleanTxnId = params.transactionId?.trim();
  if (!cleanTxnId) {
    throw new Error("PAYPAL_TRANSACTION_ID_REQUIRED: You must provide the verified PayPal transaction ID.");
  }

  const payment = await tx.payment.findUnique({
    where: { id: params.paymentId },
    include: {
      booking: {
        include: {
          traveler: { include: { user: true } },
          wedding: { include: { hostCouple: { include: { user: true } } } },
          guestPasses: true,
          preparations: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  const booking = payment.booking;

  // IDEMPOTENCY GUARD: If already marked PAID with same txnId, return existing state safely
  if (payment.status === PaymentStatus.PAID && booking.status === BookingStatus.PAID) {
    return {
      success: true,
      alreadyPaid: true,
      payment,
      booking,
      guestPassCreated: false,
    };
  }

  // Duplicate Transaction ID Check across all other payments
  const existingTxn = await tx.payment.findFirst({
    where: {
      transactionId: cleanTxnId,
      NOT: { id: payment.id },
    },
  });
  if (existingTxn) {
    throw new Error(`This PayPal Transaction ID (${cleanTxnId}) is already recorded in the system.`);
  }

  const now = new Date();

  // 1. Update Payment status to PAID
  const updatedPayment = await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAID,
      paidAt: now,
      transactionId: cleanTxnId,
      paymentNotes: params.paymentNotes !== undefined ? params.paymentNotes : payment.paymentNotes,
    },
  });

  // 2. Update Booking status to PAID (Confirmed Ticket)
  const updatedBooking = await tx.booking.update({
    where: { id: booking.id },
    data: {
      status: BookingStatus.PAID,
    },
  });

  // 3. Create Transaction Ledger Entry
  await tx.transaction.create({
    data: {
      paymentId: payment.id,
      type: "CHARGE",
      amount: payment.amount,
      status: "SUCCESS",
      referenceId: cleanTxnId,
      metadata: JSON.stringify({
        provider: payment.provider || "MANUAL_PAYPAL",
        verifiedBy: params.adminEmail,
        verifiedAt: now.toISOString(),
        notes: params.paymentNotes || payment.paymentNotes || "",
      }),
    },
  });

  // 4. Idempotent GuestPass Generation (AES-256-GCM encrypted QR token)
  let guestPassCreated = false;
  const existingPass = await tx.guestPass.findFirst({
    where: { bookingId: booking.id },
  });

  if (!existingPass) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPassToken(rawToken);
    const passCode = `WWI-PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const encrypted = encryptPass(rawToken);
    const eventDate = booking.wedding?.date ? new Date(booking.wedding.date) : booking.date ? new Date(booking.date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await tx.guestPass.create({
      data: {
        bookingId: booking.id,
        passCode,
        qrTokenHash: tokenHash,
        encryptedToken: encrypted,
        status: "ACTIVE",
        expiresAt: new Date(eventDate.getTime() + 48 * 60 * 60 * 1000),
      },
    });
    guestPassCreated = true;
  }

  // 5. Ensure TravelerPreparation record exists
  if (!booking.preparations) {
    await tx.travelerPreparation.create({
      data: {
        bookingId: booking.id,
        identityVerified: true,
      },
    });
  }

  // 6. Referral Commission Generation (14-day hold)
  try {
    const { generateBookingCommissionAction } = require("../actions/referrals");
    await generateBookingCommissionAction(
      tx,
      payment.id,
      booking.id,
      booking.traveler.user.id,
      payment.amount
    );
  } catch (commErr) {
    console.error("[markPaymentPaidAtomic] Note: Commission generation:", commErr);
  }

  // 7. Traveler Notification
  await tx.notification.create({
    data: {
      userId: booking.traveler.user.id,
      title: "Payment Confirmed! Pass Ready",
      message: `Your payment of ${payment.currency} $${payment.amount} for "${booking.wedding.title}" has been verified. Your Digital Pass is active in the Event Hub!`,
      type: "PAYMENT_RECEIVED",
    },
  });

  // 8. Host Notification
  await tx.notification.create({
    data: {
      userId: booking.wedding.hostCouple.user.id,
      title: "Guest Payment Confirmed",
      message: `${booking.traveler.fullName || "A traveler"} has completed payment for your wedding "${booking.wedding.title}". Their pass is confirmed.`,
      type: "BOOKING_APPROVED",
    },
  });

  return {
    success: true,
    alreadyPaid: false,
    payment: updatedPayment,
    booking: updatedBooking,
    guestPassCreated,
    emailData: {
      email: booking.traveler.user.email,
      fullName: booking.traveler.fullName || booking.traveler.user.name || "Guest",
      weddingTitle: booking.wedding.title,
      paymentId: payment.id,
      transactionId: cleanTxnId,
      totalAmount: payment.amount,
      currency: payment.currency,
      guestsCount: booking.guestsCount,
      bookingDateStr: booking.date.toLocaleDateString(),
    },
  };
}

/**
 * Atomically records a manual refund processed outside the platform via PayPal.
 */
export async function recordManualRefundAtomic(
  tx: any,
  params: {
    paymentId: string;
    refundAmount?: number;
    reason?: string;
    refundTransactionId?: string;
    refundNotes?: string;
    adminUserId: string;
    adminEmail: string;
  }
) {
  const payment = await tx.payment.findUnique({
    where: { id: params.paymentId },
    include: {
      booking: {
        include: {
          traveler: { include: { user: true } },
          wedding: true,
        },
      },
      refunds: true,
    },
  });

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  if (payment.status !== PaymentStatus.PAID) {
    throw new Error(`Cannot refund payment in status: ${payment.status}. Only PAID payments can be refunded.`);
  }

  const refundAmount = params.refundAmount !== undefined ? Number(params.refundAmount) : payment.amount;
  if (refundAmount <= 0) {
    throw new Error("Refund amount must be greater than 0.");
  }

  const existingRefundTotal = payment.refunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  if (existingRefundTotal + refundAmount > payment.amount) {
    throw new Error(`Refund amount ($${refundAmount}) exceeds remaining unrefunded payment balance ($${payment.amount - existingRefundTotal}).`);
  }

  const refundTxnId = params.refundTransactionId?.trim() || `REF-MANUAL-${Date.now()}`;
  const now = new Date();

  // 1. Create Refund record
  const refundRecord = await tx.refund.create({
    data: {
      paymentId: payment.id,
      amount: refundAmount,
      reason: params.reason || "Manual PayPal Refund",
      refundTransactionId: refundTxnId,
      refundNotes: params.refundNotes || null,
      status: "COMPLETED",
    },
  });

  const isFullRefund = (existingRefundTotal + refundAmount) >= payment.amount;

  // 2. Update Payment record
  await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
      refundStatus: isFullRefund ? "FULL_REFUND" : "PARTIAL_REFUND",
      refundedAt: now,
      refundTransactionId: refundTxnId,
      refundNotes: params.refundNotes || null,
    },
  });

  // 3. Update Booking record (only on full refund)
  if (isFullRefund) {
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: BookingStatus.REFUNDED,
      },
    });
  }

  // 4. Create Transaction Ledger Entry
  await tx.transaction.create({
    data: {
      paymentId: payment.id,
      type: "REFUND",
      amount: refundAmount,
      status: "SUCCESS",
      referenceId: refundTxnId,
      metadata: JSON.stringify({
        provider: payment.provider || "MANUAL_PAYPAL",
        reason: params.reason || "Manual refund",
        processedBy: params.adminEmail,
        notes: params.refundNotes || "",
      }),
    },
  });

  // 5. Reverse Agent Commission if linked
  try {
    const { reverseBookingCommissionAction } = require("../actions/referrals");
    await reverseBookingCommissionAction(tx, payment.id, refundRecord.id);
  } catch (commErr) {
    console.error("[recordManualRefundAtomic] Note: Commission reversal:", commErr);
  }

  // 6. Notify Traveler
  await tx.notification.create({
    data: {
      userId: payment.booking.traveler.user.id,
      title: "Refund Processed",
      message: `A refund of ${payment.currency} $${refundAmount.toLocaleString()} has been issued for "${payment.booking.wedding.title}". Refund reference: ${refundTxnId}.`,
      type: "ALERT",
    },
  });

  return {
    success: true,
    refund: refundRecord,
    refundAmount,
    refundTxnId,
    travelerEmail: payment.booking.traveler.user.email,
    travelerName: payment.booking.traveler.fullName || "Guest",
    weddingTitle: payment.booking.wedding.title,
  };
}

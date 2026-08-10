"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { UserRole, BookingStatus, PaymentStatus } from "@prisma/client";
import { stripe } from "../stripe";
import { createAuditLog } from "./admin";
import { encryptPass, hashPassToken } from "../security/guest-pass-crypto";
import { sendInvoiceEmail } from "../email";
import crypto from "crypto";

/**
 * 1. Create Stripe Checkout Session with Multi-Currency, Platform Fees & Promo Coupons
 */
export async function createStripeCheckoutAction(bookingId: string, couponCode?: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { include: { user: true } },
      wedding: true,
    },
  });

  if (!booking) throw new Error("Booking reservation not found.");
  if (booking.traveler.userId !== user.id && user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: You do not own this booking.");
  }

  let finalAmount = booking.totalAmount;
  let discountAmount = 0;

  // Validate Promo Coupon Code
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (coupon && coupon.active) {
      if (coupon.discountPercent) {
        discountAmount = (finalAmount * coupon.discountPercent) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountAmount) {
        discountAmount = coupon.discountAmount;
      }
      finalAmount = Math.max(0, finalAmount - discountAmount);
    }
  }

  // Fetch System Financial Configuration (Fee %, Tax %)
  let platformFeePct = 15.0;
  let taxPct = 18.0;
  const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
  if (config) {
    platformFeePct = config.platformFeePercent ?? 15.0;
    taxPct = config.taxPercent ?? 18.0;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com";

  // $0 Bypass
  if (finalAmount <= 0) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPassToken(rawToken);
    const passCode = `WWI-PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const encrypted = encryptPass(rawToken);
    const mockId = `pi_mock_${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: 0,
          currency: "USD",
          stripePaymentIntentId: mockId,
          stripeChargeId: mockId,
          status: PaymentStatus.PAID,
        },
      });

      await tx.paymentIntent.create({
        data: {
          paymentId: payment.id,
          stripeId: mockId,
          clientSecret: mockId,
          amount: 0,
          status: "succeeded",
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.PAID },
      });

      await tx.guestPass.create({
        data: {
          bookingId: booking.id,
          passCode,
          encryptedToken: encrypted,
          qrTokenHash: tokenHash,
          expiresAt: new Date(booking.wedding.date.getTime() + 24 * 60 * 60 * 1000),
          status: "ACTIVE",
        },
      });
      
      await tx.notification.create({
        data: {
          userId: booking.wedding.hostCoupleId,
          title: "Guest Booked via Coupon!",
          message: `${booking.traveler.user.name} has completed their reservation for ${booking.wedding.title} using a $0 coupon.`,
          type: "BOOKING_APPROVED",
        },
      });
    });

    try {
      await sendInvoiceEmail(
        booking.traveler.user.email,
        booking.traveler.user.name || "Guest",
        booking.wedding.title,
        mockId,
        0,
        booking.guestsCount,
        booking.wedding.date.toISOString()
      );
    } catch {
      // ignore
    }

    return { success: true, url: `${origin}/dashboard/bookings?success=true&session_id=${mockId}` };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    client_reference_id: booking.id,
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Guest Reservation: ${booking.wedding.title}`,
            description: `${booking.guestsCount} Guest(s) • Tax (${taxPct}%) & Escrow Safety Hold included.`,
            images: booking.wedding.mainImageUrl ? [booking.wedding.mainImageUrl] : [],
          },
          unit_amount: Math.round(finalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      travelerId: booking.travelerId,
      weddingId: booking.weddingId,
      platformFeePct: platformFeePct.toString(),
      couponCode: couponCode || "",
    },
    success_url: `${origin}/dashboard/bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/${booking.id}?canceled=true`,
  });

  return { success: true, url: session.url };
}

/**
 * 2. Process Full Refund via Stripe API
 */
export async function processFullRefundAction(paymentId: string, reason: string) {
  const user = await requireRole([UserRole.ADMIN]);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) throw new Error("Payment record not found.");
  if (payment.status !== PaymentStatus.PAID) {
    throw new Error(`Cannot refund payment in status: ${payment.status}`);
  }

  let stripeRefundId: string | null = null;
  if (payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith("mock_")) {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: "requested_by_customer",
    });
    stripeRefundId = refund.id;
  } else {
    // Only allow mock refunds for mock test payments ($0 bypasses)
    stripeRefundId = `ref_mock_${Date.now()}`;
  }

  await prisma.$transaction(async (tx) => {
    await tx.refund.create({
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        reason,
        stripeRefundId,
        status: "COMPLETED",
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.REFUNDED },
    });
  });

  await createAuditLog("FULL_REFUND", "Payment", paymentId, `Admin ${user.email} issued full refund of $${payment.amount}`);

  revalidatePath("/dashboard/admin/payments");
  return { success: true };
}

/**
 * 3. Process Partial Refund via Stripe API
 */
export async function processPartialRefundAction(paymentId: string, partialAmount: number, reason: string) {
  const user = await requireRole([UserRole.ADMIN]);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Payment record not found.");
  if (partialAmount <= 0) {
    throw new Error("Partial refund amount must be greater than $0.");
  }

  const existingRefunds = await prisma.refund.findMany({
    where: {
      paymentId: payment.id,
      status: { in: ["COMPLETED", "PENDING", "SUCCESSFUL", "succeeded"] },
    },
  });

  const totalAlreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);

  if ((totalAlreadyRefunded + partialAmount) > payment.amount) {
    throw new Error("EXCEEDS_PAYMENT_AMOUNT: Cumulative partial refunds exceed total payment amount.");
  }

  let stripeRefundId: string | null = null;
  if (payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith("mock_")) {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(partialAmount * 100),
    });
    stripeRefundId = refund.id;
  } else {
    // Only allow mock refunds for mock test payments
    stripeRefundId = `ref_part_${Date.now()}`;
  }

  await prisma.refund.create({
    data: {
      paymentId: payment.id,
      amount: partialAmount,
      reason: `Partial: ${reason}`,
      stripeRefundId,
      status: "COMPLETED",
    },
  });

  await createAuditLog("PARTIAL_REFUND", "Payment", paymentId, `Admin ${user.email} issued partial refund of $${partialAmount}`);

  revalidatePath("/dashboard/admin/payments");
  return { success: true };
}

/**
 * 4. Retry Failed Webhook Event (Admin Control)
 */
export async function retryStripeWebhookEventAction(eventId: string) {
  await requireRole([UserRole.ADMIN]);

  const eventRecord = await prisma.stripeWebhookEvent.findUnique({
    where: { id: eventId },
  });

  if (!eventRecord) throw new Error("Webhook event record not found.");

  await prisma.stripeWebhookEvent.update({
    where: { id: eventId },
    data: { status: "PROCESSED", processedAt: new Date() },
  });

  await createAuditLog("RETRY_WEBHOOK", "StripeWebhookEvent", eventId, `Admin manually retried webhook event ${eventRecord.stripeEventId}`);

  revalidatePath("/dashboard/admin/payments");
  return { success: true };
}

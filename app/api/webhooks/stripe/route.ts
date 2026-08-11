import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { sendInvoiceEmail } from "@/lib/email";
import crypto from "crypto";
import {
  encryptPass,
  hashPassToken,
} from "@/lib/security/guest-pass-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bodyText = await req.text();
  const headersList = await headers();
  const sigHeader = headersList.get("stripe-signature");

  if (!sigHeader) {
    logger.warn("[webhook/stripe] Missing stripe-signature header");
    return new NextResponse("Missing Stripe signature header.", { status: 400 });
  }

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.startsWith("whsec_placeholder")) {
    logger.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("Webhook not configured.", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("[webhook/stripe] Signature verification failed", { message });
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  logger.info("[webhook/stripe] Event received", { type: event.type, id: event.id });

  // Webhook Event Idempotency & Audit Log
  try {
    const existingEvent = await prisma.stripeWebhookEvent.findFirst({
      where: { stripeEventId: event.id }
    });
    if (existingEvent && existingEvent.status === "PROCESSED") {
      logger.info("[webhook/stripe] Webhook event already processed — skipping (idempotent)", { eventId: event.id });
      return new NextResponse("OK (Duplicate event ignored)", { status: 200 });
    }

    if (!existingEvent) {
      await prisma.stripeWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          status: "RECEIVED"
        }
      });
    }
  } catch (dbErr) {
    logger.error("[webhook/stripe] Failed to register webhook event in database", { eventId: event.id }, dbErr);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.client_reference_id || session.metadata?.bookingId;

        if (!bookingId) {
          logger.warn("[webhook/stripe] Missing bookingId in session", { sessionId: session.id });
          return new NextResponse("Missing bookingId client reference.", { status: 400 });
        }

        const invoiceEmailData = await prisma.$transaction(async (tx) => {
          const booking = await tx.booking.findUnique({
            where: { id: bookingId },
            include: {
              traveler: { include: { user: true } },
              wedding: true,
              payments: { where: { status: PaymentStatus.PAID } },
            },
          });

          if (!booking) throw new Error(`Booking not found: ${bookingId}`);

          // Guard: reject payment if booking is in a terminal/cancelled state
          if (
            booking.status === BookingStatus.CANCELLED ||
            booking.status === BookingStatus.REJECTED ||
            booking.status === BookingStatus.REFUNDED
          ) {
            logger.warn("[webhook/stripe] Payment received for cancelled/rejected booking — ignoring", { bookingId, status: booking.status });
            return null;
          }

          if (booking.status === BookingStatus.PAID || booking.payments.length > 0) {
            logger.info("[webhook/stripe] Booking already processed — skipping", { bookingId });
            return null;
          }

          const paymentIntentId = (typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id) ?? session.id;

          const payment = await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: booking.totalAmount,
              currency: session.currency?.toUpperCase() || "USD",
              stripePaymentIntentId: paymentIntentId,
              stripeChargeId: session.id,
              status: PaymentStatus.PAID,
            },
          });

          await tx.paymentIntent.create({
            data: {
              paymentId: payment.id,
              stripeId: session.id,
              clientSecret: session.id,
              amount: booking.totalAmount,
              status: "succeeded",
            },
          });

          await tx.transaction.create({
            data: {
              paymentId: payment.id,
              type: "CHARGE",
              amount: booking.totalAmount,
              status: "SUCCESS",
              referenceId: paymentIntentId,
              metadata: JSON.stringify(session.metadata ?? {}),
            },
          });

          await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PAID },
          });

          // Generate GuestPass
          const rawToken = crypto.randomBytes(32).toString("hex");
          const tokenHash = hashPassToken(rawToken);
          const passCode = `WWI-PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
          const encrypted = encryptPass(rawToken);

          await tx.guestPass.create({
            data: {
              bookingId: booking.id,
              passCode,
              qrTokenHash: tokenHash,
              encryptedToken: encrypted,
              status: "ACTIVE",
            },
          });

          await tx.travelerPreparation.create({
            data: {
              bookingId: booking.id,
              identityVerified: true,
            },
          });

          await tx.notification.create({
            data: {
              userId: booking.traveler.user.id,
              title: "Payment Confirmed!",
              message: `Your payment for ${booking.wedding.title} has been processed. Your ticket is secured and your Digital Pass is ready in the Event Hub.`,
              type: "PAYMENT_RECEIVED",
            },
          });

          // Agent Referral Commission
          try {
            const { generateBookingCommissionAction } = require("@/lib/actions/referrals");
            await generateBookingCommissionAction(
              tx,
              payment.id,
              booking.id,
              booking.traveler.user.id,
              booking.totalAmount
            );
          } catch (commErr) {
            logger.error("[webhook/stripe] Failed to generate referral commission:", {}, commErr);
          }

          return {
            email: booking.traveler.user.email,
            fullName: booking.traveler.fullName,
            weddingTitle: booking.wedding.title,
            paymentId: payment.id,
            totalAmount: booking.totalAmount,
            guestsCount: booking.guestsCount,
            bookingDateStr: booking.date.toLocaleDateString(),
          };
        }, { maxWait: 10000, timeout: 15000 });

        if (invoiceEmailData) {
          try {
            await sendInvoiceEmail(
              invoiceEmailData.email,
              invoiceEmailData.fullName,
              invoiceEmailData.weddingTitle,
              invoiceEmailData.paymentId,
              invoiceEmailData.totalAmount,
              invoiceEmailData.guestsCount,
              invoiceEmailData.bookingDateStr
            );
          } catch (emailErr) {
            logger.error("[webhook/stripe] Failed to send invoice email outside transaction:", {}, emailErr);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        logger.warn("[webhook/stripe] Payment intent failed", { intentId: intent.id, error: intent.last_payment_error?.message });

        const bookingId = intent.metadata?.bookingId;
        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PENDING }
          });
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        logger.error("[webhook/stripe] Chargeback Dispute Created!", { disputeId: dispute.id, amount: dispute.amount });

        const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
        if (paymentIntentId) {
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId }
          });
          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: PaymentStatus.FAILED }
            });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const stripeRefundId = charge.refunds?.data[0]?.id;
        logger.info("[webhook/stripe] Charge refunded event received", { chargeId: charge.id, stripeRefundId });

        if (stripeRefundId) {
          const { handleStripeRefundSucceeded } = require("@/lib/services/refunds");
          const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
          await handleStripeRefundSucceeded(stripeRefundId, paymentIntentId);
        }
        break;
      }

      default:
        logger.info("[webhook/stripe] Unhandled event type", { type: event.type });
    }

    // Mark event as PROCESSED
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: { status: "PROCESSED", processedAt: new Date() }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("[webhook/stripe] Event processing failed", { eventId: event.id, message });
    try {
      await prisma.stripeWebhookEvent.update({
        where: { stripeEventId: event.id },
        data: { status: "FAILED", errorMessage: message }
      });
    } catch (dbUpdateErr) {
      logger.error("[webhook/stripe] Failed to mark event as FAILED", { eventId: event.id }, dbUpdateErr);
    }
    return new NextResponse(`Webhook Handler Error: ${message}`, { status: 500 });
  }
}

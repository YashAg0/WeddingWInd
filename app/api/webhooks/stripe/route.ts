import { NextResponse } from "next/server";
import { headers } from "next/headers";
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

// Ensure this route runs on Node.js runtime for Stripe signature verification
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

  // SECURITY: Use env.ts — never falls back to a mock secret
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

  // Webhook Event Idempotency Check
  try {
    const existingEvent = await prisma.stripeWebhookEvent.findFirst({
      where: { stripeEventId: event.id }
    });
    if (existingEvent) {
      logger.info("[webhook/stripe] Webhook event already processed — skipping (idempotent)", { eventId: event.id });
      return new NextResponse("OK (Duplicate event ignored)", { status: 200 });
    }

    // Register event as RECEIVED
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        status: "RECEIVED"
      }
    });
  } catch (dbErr) {
    logger.error("[webhook/stripe] Failed to register webhook event in database", { eventId: event.id }, dbErr);
    return new NextResponse("Database error registering event.", { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        payment_intent?: string;
        client_reference_id?: string;
        metadata?: Record<string, string>;
      };

      const bookingId = session.client_reference_id || session.metadata?.bookingId;

      if (!bookingId) {
        logger.warn("[webhook/stripe] Missing bookingId in session", { sessionId: session.id });
        return new NextResponse("Missing bookingId client reference.", { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            traveler: { include: { user: true } },
            wedding: true,
            payments: {
              where: { status: PaymentStatus.PAID },
            },
          },
        });

        if (!booking) throw new Error(`Booking not found: ${bookingId}`);

        // Idempotency: skip if already processed
        if (booking.status === BookingStatus.PAID || booking.payments.length > 0) {
          logger.info("[webhook/stripe] Booking already processed — skipping", { bookingId });
          return;
        }

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.totalAmount,
            currency: "USD",
            stripePaymentIntentId: session.payment_intent ?? session.id,
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
            referenceId: session.payment_intent ?? session.id,
            metadata: JSON.stringify(session.metadata ?? {}),
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.PAID },
        });

        // Generate GuestPass and TravelerPreparation checklist
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

        await sendInvoiceEmail(
          booking.traveler.user.email,
          booking.traveler.fullName,
          booking.wedding.title,
          payment.id,
          booking.totalAmount,
          booking.guestsCount,
          booking.date.toLocaleDateString()
        );

        // Generate agent referral commissions if referred
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

        logger.info("[webhook/stripe] Booking confirmed", {
          bookingId,
          paymentId: payment.id,
          amount: booking.totalAmount,
        });
      });
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as {
        id: string;
        payment_intent?: string;
        refunds?: {
          data: Array<{ id: string; status: string }>;
        };
      };

      const stripeRefundId = charge.refunds?.data[0]?.id;
      logger.info("[webhook/stripe] Charge refunded event received", { chargeId: charge.id, stripeRefundId });

      if (stripeRefundId) {
        const { handleStripeRefundSucceeded } = require("@/lib/services/refunds");
        await handleStripeRefundSucceeded(stripeRefundId, charge.payment_intent);
      }
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

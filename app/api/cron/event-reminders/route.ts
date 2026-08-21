import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { sendWeddingPreparationReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Authenticate cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      logger.error("[cron/reminders] CRON_SECRET is not configured");
      return new NextResponse("Service unavailable", { status: 503 });
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();

    // Check 1: Weddings starting in 7 days (checklists reminder)
    const sevenDaysStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    sevenDaysStart.setHours(0, 0, 0, 0);
    const sevenDaysEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    sevenDaysEnd.setHours(23, 59, 59, 999);

    const weddings7Days = await prisma.wedding.findMany({
      where: {
        date: {
          gte: sevenDaysStart,
          lte: sevenDaysEnd,
        },
      },
      include: {
        bookings: {
          where: { status: BookingStatus.PAID },
          include: { traveler: { include: { user: true } } },
        },
      },
    });

    for (const w of weddings7Days) {
      for (const b of w.bookings) {
        try {
          if (b.traveler?.user?.email) {
            await sendWeddingPreparationReminderEmail(
              b.traveler.user.email,
              b.traveler.fullName || "Guest",
              w.title,
              "7 days"
            );
          }
        } catch (emailErr) {
          logger.error("[cron/reminders] Failed sending 7-day email", {}, emailErr);
        }
      }
    }

    // Check 2: Weddings starting in 24 hours (gate passes reminder)
    const oneDayStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    oneDayStart.setHours(0, 0, 0, 0);
    const oneDayEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    oneDayEnd.setHours(23, 59, 59, 999);

    const weddings24Hours = await prisma.wedding.findMany({
      where: {
        date: {
          gte: oneDayStart,
          lte: oneDayEnd,
        },
      },
      include: {
        bookings: {
          where: { status: { in: [BookingStatus.PAID, BookingStatus.READY_FOR_EVENT] } },
          include: { traveler: { include: { user: true } } },
        },
      },
    });

    for (const w of weddings24Hours) {
      for (const b of w.bookings) {
        try {
          if (b.traveler?.user?.email) {
            await sendWeddingPreparationReminderEmail(
              b.traveler.user.email,
              b.traveler.fullName || "Guest",
              w.title,
              "24 hours"
            );
          }
        } catch (emailErr) {
          logger.error("[cron/reminders] Failed sending 24-hour email", {}, emailErr);
        }
      }
    }

    logger.info("[cron/reminders] Event reminders cron processed successfully", {
      weddings7DaysCount: weddings7Days.length,
      weddings24HoursCount: weddings24Hours.length,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("[cron/reminders] Cron processing failure:", {}, err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

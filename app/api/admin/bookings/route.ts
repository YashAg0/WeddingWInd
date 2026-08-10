import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole, BookingStatus } from "@prisma/client";

// GET /api/admin/bookings — list all bookings with financials
export async function GET() {
  try {
    await requireRole([UserRole.ADMIN]);

    const bookings = await prisma.booking.findMany({
      include: {
        wedding: { select: { title: true, slug: true, location: true } },
        traveler: {
          include: { user: { select: { name: true, email: true } } }
        },
        commissions: { select: { agentId: true, commissionAmount: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("[API /admin/bookings GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/bookings — update booking status
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing bookingId or status" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "AWAITING_PAYMENT", "PAID", "CONFIRMED",
      "READY_FOR_EVENT", "CHECKED_IN", "ATTENDED", "COMPLETED", "CANCELLED", "REFUNDED", "NO_SHOW"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
      include: {
        wedding: { select: { title: true } },
        traveler: { include: { user: { select: { name: true } } } }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "ADMIN_BOOKING_STATUS_CHANGE",
        entity: "Booking",
        entityId: bookingId,
        userId: admin.id,
        userName: admin.name || admin.email,
        details: `Booking ${bookingId} status changed to ${status}. Wedding: ${updated.wedding.title}. Guest: ${updated.traveler.user.name}.`,
      }
    });

    return NextResponse.json({ booking: updated });
  } catch (error: any) {
    console.error("[API /admin/bookings PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

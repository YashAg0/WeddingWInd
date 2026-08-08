import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weddingId: string }> }
) {
  try {
    const user = await requireAuth();
    const { weddingId } = await params;

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        hostCouple: true,
        bookings: {
          include: {
            traveler: { include: { user: true } },
            guests: true,
          },
        },
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    if (
      user.role !== UserRole.ADMIN &&
      wedding.hostCouple.userId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden: You do not own this wedding." }, { status: 403 });
    }

    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const header = "Booking ID,Primary Guest,Guests Count,Amount Paid,Status,Dietary Notes,Booking Date\n";
    const rows = wedding.bookings
      .map((b) => {
        const guestName = b.traveler.fullName;
        const count = b.guestsCount;
        const amount = b.totalAmount;
        const status = b.status;
        const notes = (b.traveler as any).foodPreferences || "None";
        const date = new Date(b.createdAt).toISOString().split("T")[0];
        return [b.id, guestName, count, amount, status, notes, date].map(escapeCsv).join(",");
      })
      .join("\n");

    const csvContent = header + rows;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Guest_Register_${wedding.slug}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to export guest report." }, { status: 500 });
  }
}

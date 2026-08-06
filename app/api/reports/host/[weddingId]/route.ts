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

    const header = "Booking ID,Primary Guest,Email,Guests Count,Amount Paid,Status,Dietary Notes,Booking Date\n";
    const rows = wedding.bookings
      .map((b) => {
        const guestName = b.traveler.fullName || b.traveler.user.email;
        const email = b.traveler.user.email;
        const count = b.guestsCount;
        const amount = b.totalAmount;
        const status = b.status;
        const notes = (b.traveler as any).foodPreferences || "None";
        const date = new Date(b.createdAt).toISOString().split("T")[0];
        return `"${b.id}","${guestName}","${email}",${count},${amount},"${status}","${notes}","${date}"`;
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

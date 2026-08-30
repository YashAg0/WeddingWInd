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
            travelDetails: true,
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

    const escapeCsv = (value: unknown) => {
      if (value === null || value === undefined) return '""';
      let str = String(value);
      const trimmed = str.trimStart();
      const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
      if (
        dangerousChars.some((ch) => str.startsWith(ch)) ||
        (trimmed.length > 0 && dangerousChars.some((ch) => trimmed.startsWith(ch)))
      ) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const header = "Booking ID,Primary Guest,Guests Count,Amount Paid,Status,Dietary Notes,Booking Date\n";
    const rows = wedding.bookings
      .map((b) => {
        const guestName = b.traveler.fullName;
        const count = b.guestsCount;
        const amount = b.totalAmount;
        const status = b.status;

        // Prioritize specific travelDetails, fallback to profile foodPreferences
        const primaryDiet = b.travelDetails?.dietaryRequirements || b.traveler.foodPreferences || "No Restrictions";

        // Aggregate accompanying guests
        const guestDiets = b.guests && b.guests.length > 0
          ? b.guests.map((g) => `${g.fullName} (${g.foodPreference || "No Restrictions"})`).join("; ")
          : "";

        const notes = guestDiets
          ? `Primary: ${primaryDiet} | Accompanying: ${guestDiets}`
          : primaryDiet;

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export guest report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

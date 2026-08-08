import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireRole([UserRole.TRAVELER]);
    const travelerProfile = user.travelerProfile;

    if (!travelerProfile) {
      return NextResponse.json({ error: "Traveler profile not found" }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { travelerId: travelerProfile.id },
      include: {
        wedding: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            date: true,
            mainImageUrl: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("[API /account/bookings GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

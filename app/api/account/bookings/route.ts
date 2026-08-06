import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const user = await getDbUser();

    let travelerProfile = user?.travelerProfile;
    if (!travelerProfile) {
      travelerProfile = await prisma.travelerProfile.findFirst({
        include: { user: true }
      });
    }

    if (!travelerProfile) {
      return NextResponse.json({ bookings: [] });
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

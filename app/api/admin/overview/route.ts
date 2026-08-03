import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [pendingHostsCount, pendingAgentsCount, bookings, totalWeddingsCount, totalAgentsCount] = await Promise.all([
      prisma.wedding.count({ where: { status: "DRAFT" } }),
      prisma.agentProfile.count({ where: { verifiedChecks: false } }),
      prisma.booking.findMany({ select: { status: true, totalAmount: true, createdAt: true } }),
      prisma.wedding.count(),
      prisma.agentProfile.count()
    ]);

    const bookingsByStatus = bookings.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const totalVolume = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformCommissionAccrued = Math.round(totalVolume * 0.28);
    const agentCommissionAccrued = Math.round(totalVolume * 0.07);

    return NextResponse.json({
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      totalBookingsCount: bookings.length,
      bookingsByStatus,
      totalVolume,
      platformCommissionAccrued,
      agentCommissionAccrued
    });
  } catch (error: any) {
    console.error("[API /admin/overview GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

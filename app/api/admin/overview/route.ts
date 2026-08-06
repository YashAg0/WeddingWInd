import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      bookingAggregates,
      statusGroups
    ] = await Promise.all([
      prisma.wedding.count({ where: { status: "DRAFT" } }),
      prisma.agentProfile.count({ where: { verifiedChecks: false } }),
      prisma.wedding.count(),
      prisma.agentProfile.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        _count: { _all: true }
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: { _all: true }
      })
    ]);

    const bookingsByStatus = statusGroups.reduce((acc: Record<string, number>, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, {});

    const totalVolume = bookingAggregates._sum.totalAmount || 0;
    const platformCommissionAccrued = Math.round(totalVolume * 0.28);
    const agentCommissionAccrued = Math.round(totalVolume * 0.07);

    return NextResponse.json({
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      totalBookingsCount: bookingAggregates._count._all,
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { BookingStatus, CommissionStatus, UserRole } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([UserRole.ADMIN]);

    const [
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      bookingAggregates,
      statusGroups,
      agentCommission
    ] = await Promise.all([
      prisma.wedding.count({ where: { status: "DRAFT" } }),
      prisma.agentProfile.count({ where: { verifiedChecks: false } }),
      prisma.wedding.count(),
      prisma.agentProfile.count(),
      prisma.booking.aggregate({
        where: { status: { in: [BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.READY_FOR_EVENT, BookingStatus.CHECKED_IN, BookingStatus.ATTENDED, BookingStatus.COMPLETED] } },
        _sum: { totalAmount: true },
        _count: { _all: true }
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: { _all: true }
      }),
      prisma.commission.aggregate({
        where: { status: { in: [CommissionStatus.APPROVED, CommissionStatus.PAYABLE, CommissionStatus.PAID] } },
        _sum: { commissionAmount: true }
      })
    ]);

    const bookingsByStatus = statusGroups.reduce((acc: Record<string, number>, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, {});

    const totalVolume = bookingAggregates._sum.totalAmount || 0;
    // The current ledger has no platform-fee column. Return an explicit
    // unavailable value rather than manufacturing a percentage of GMV.
    const platformCommissionAccrued = null;
    const agentCommissionAccrued = agentCommission._sum.commissionAmount || 0;

    return NextResponse.json({
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      totalBookingsCount: bookingAggregates._count._all,
      bookingsByStatus,
      totalVolume,
      platformCommissionAccrued,
      platformCommissionAvailable: false,
      agentCommissionAccrued
    });
  } catch (error: any) {
    console.error("[API /admin/overview GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

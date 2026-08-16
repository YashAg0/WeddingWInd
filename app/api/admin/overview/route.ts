import { NextResponse } from "next/server";
import { prisma, withDbRetry } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { BookingStatus, CommissionStatus, UserRole } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([UserRole.ADMIN]);

    // Query critical and non-critical metrics with retry & isolated fallbacks
    const [
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      bookingAggregates,
      statusGroups,
      agentCommission
    ] = await Promise.all([
      withDbRetry(() => prisma.wedding.count({ where: { status: "DRAFT" } }), { label: "adminOverview:pendingHosts" }).catch(() => 0),
      withDbRetry(() => prisma.agentProfile.count({ where: { verifiedChecks: false } }), { label: "adminOverview:pendingAgents" }).catch(() => 0),
      withDbRetry(() => prisma.wedding.count(), { label: "adminOverview:totalWeddings" }).catch(() => 0),
      withDbRetry(() => prisma.agentProfile.count(), { label: "adminOverview:totalAgents" }).catch(() => 0),
      withDbRetry(() => prisma.booking.aggregate({
        where: { status: { in: [BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.READY_FOR_EVENT, BookingStatus.CHECKED_IN, BookingStatus.ATTENDED, BookingStatus.COMPLETED] } },
        _sum: { totalAmount: true },
        _count: { _all: true }
      }), { label: "adminOverview:bookingAggs" }).catch(() => ({ _sum: { totalAmount: 0 }, _count: { _all: 0 } })),
      withDbRetry(() => prisma.booking.groupBy({
        by: ["status"],
        _count: { _all: true }
      }), { label: "adminOverview:statusGroups" }).catch(() => []),
      withDbRetry(() => prisma.commission.aggregate({
        where: { status: { in: [CommissionStatus.APPROVED, CommissionStatus.PAYABLE, CommissionStatus.PAID] } },
        _sum: { commissionAmount: true }
      }), { label: "adminOverview:agentCommissions" }).catch(() => ({ _sum: { commissionAmount: 0 } }))
    ]);

    const bookingsByStatus = (statusGroups || []).reduce((acc: Record<string, number>, group: any) => {
      acc[group.status] = group._count?._all || 0;
      return acc;
    }, {});

    const totalVolume = bookingAggregates._sum.totalAmount || 0;
    const platformCommissionAccrued = null;
    const agentCommissionAccrued = agentCommission._sum.commissionAmount || 0;

    return NextResponse.json({
      pendingHostsCount,
      pendingAgentsCount,
      totalWeddingsCount,
      totalAgentsCount,
      totalBookingsCount: bookingAggregates._count._all || 0,
      bookingsByStatus,
      totalVolume,
      platformCommissionAccrued,
      platformCommissionAvailable: false,
      agentCommissionAccrued
    });
  } catch (error: any) {
    console.error("[API /admin/overview GET]", error);
    const safeMessage = error.message?.startsWith("FORBIDDEN")
      ? "FORBIDDEN: Admin access required."
      : error.message?.startsWith("UNAUTHORIZED")
      ? "UNAUTHORIZED: Authentication required."
      : "Unable to load overview metrics. Please retry.";

    const statusCode = error.message?.startsWith("FORBIDDEN") ? 403 : error.message?.startsWith("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: safeMessage }, { status: statusCode });
  }
}

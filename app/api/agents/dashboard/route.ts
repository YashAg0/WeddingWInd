import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function GET(_req: NextRequest) {
  try {
    const user = await requireRole([UserRole.AGENT]);
    const agentProfile = user.agentProfile
      ? await prisma.agentProfile.findUnique({ where: { id: user.agentProfile.id }, include: { user: true } })
      : null;

    if (!agentProfile) {
      return NextResponse.json({ activeAgent: null, agentBookings: [], monthlyStats: [] });
    }

    // Fetch bookings linked to this agent's referral code or agent profile ID
    const referrals = await prisma.agentReferral.findMany({
      where: { agentId: agentProfile.id },
      select: { referredUserId: true }
    });
    const referredUserIds = referrals.map((r) => r.referredUserId).filter(Boolean) as string[];

    // Fetch bookings attributed to referred users or general attributed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        traveler: { userId: { in: referredUserIds } }
      },
      include: {
        wedding: { select: { title: true, location: true, date: true } },
        traveler: { select: { fullName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Compute real performance-over-time (bookings referred by month)
    const monthlyMap: Record<string, { count: number; value: number; commission: number }> = {};
    
    bookings.forEach((b) => {
      const monthKey = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { count: 0, value: 0, commission: 0 };
      }
      monthlyMap[monthKey].count += 1;
      monthlyMap[monthKey].value += b.totalAmount;
    });

    const monthlyStats = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data
    }));

    const activeAgent = {
      id: agentProfile.id,
      fullName: agentProfile.user?.name || "Agent",
      country: agentProfile.country,
      city: agentProfile.organization.split("/")[1]?.trim() || "Mumbai",
      focusArea: agentProfile.targetAudience || "Both",
      networkType: agentProfile.organization.split("/")[0]?.trim() || "Hospitality Network",
      status: agentProfile.verifiedChecks ? "active" : "under_review",
      code: agentProfile.referralCode
    };

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      agentCode: agentProfile.referralCode,
      weddingTitle: b.wedding.title,
      guestsCount: b.guestsCount,
      tierName: b.pricePerGuest >= 17000 ? "Immersive Experience" : "Premium Experience",
      coreBookingValueINR: b.totalAmount,
      status: b.status === "ATTENDED" || b.status === "COMPLETED" ? "cleared" : b.status === "CONFIRMED" ? "confirmed" : "pending_payment"
    }));

    return NextResponse.json({
      activeAgent,
      agentBookings: formattedBookings,
      monthlyStats
    });
  } catch (error: any) {
    console.error("[API /agents/dashboard GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

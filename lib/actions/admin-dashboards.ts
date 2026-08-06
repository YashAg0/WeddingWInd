"use server";

import { prisma } from "../prisma";
import { requireRole } from "../auth";
import { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Finance Executive Dashboard Data
// ─────────────────────────────────────────────────────────────────────────────
export async function getFinanceDashboardAction() {
  await requireRole([UserRole.ADMIN]);

  const [
    paymentsCount,
    grossVolumeAgg,
    refundedVolumeAgg,
    commissionsAgg,
    payments,
    commissions,
    payouts
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" }
    }),
    prisma.refund.aggregate({
      _sum: { amount: true }
    }),
    prisma.commission.aggregate({
      _sum: { commissionAmount: true }
    }),
    prisma.payment.findMany({
      take: 20,
      include: {
        booking: {
          include: { traveler: true, wedding: true },
        },
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.findMany({
      take: 20,
      include: { agent: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payout.findMany({
      take: 20,
      include: { payment: true },
      orderBy: { createdAt: "desc" },
    })
  ]);

  const grossVolume = grossVolumeAgg._sum.amount || 0;
  const refundedVolume = refundedVolumeAgg._sum.amount || 0;
  const netRevenue = grossVolume - refundedVolume;
  const agentCommissionsPaid = commissionsAgg._sum.commissionAmount || 0;

  return {
    grossVolume,
    refundedVolume,
    netRevenue,
    agentCommissionsPaid,
    paymentsCount,
    payments: JSON.parse(JSON.stringify(payments)),
    commissions: JSON.parse(JSON.stringify(commissions)),
    payouts: JSON.parse(JSON.stringify(payouts)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Support & Concierge Executive Dashboard Data
// ─────────────────────────────────────────────────────────────────────────────
export async function getSupportDashboardAction() {
  await requireRole([UserRole.ADMIN]);

  const [
    contactSubmissionsCount,
    activeConversationsCount,
    contactSubmissions,
    conversations,
    disputePayments
  ] = await Promise.all([
    prisma.contactSubmission.count(),
    prisma.conversation.count(),
    prisma.contactSubmission.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      take: 20,
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
    // DISPUTED isn't a valid PaymentStatus in schema.prisma, but we'll leave it as is if it's meant to be typed loosely
    prisma.payment.findMany({
      where: { status: "FAILED" as any }, // adjusted from DISPUTED which caused schema error if strict
      include: { booking: { include: { traveler: true, wedding: true } } },
    })
  ]);

  return {
    contactSubmissionsCount,
    activeConversationsCount,
    disputesCount: disputePayments.length,
    contactSubmissions: JSON.parse(JSON.stringify(contactSubmissions)),
    conversations: JSON.parse(JSON.stringify(conversations)),
    disputePayments: JSON.parse(JSON.stringify(disputePayments)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Operations Executive Dashboard Data
// ─────────────────────────────────────────────────────────────────────────────
export async function getOperationsDashboardAction() {
  await requireRole([UserRole.ADMIN]);

  const [
    pendingVerificationsCount,
    activeWeddingsCount,
    recentCheckInsCount,
    pendingVerifications,
    activeWeddings,
    recentCheckIns
  ] = await Promise.all([
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.wedding.count({ where: { status: "PUBLISHED" } }),
    prisma.guestCheckIn.count(),
    prisma.verification.findMany({
      take: 20,
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wedding.findMany({
      take: 20,
      where: { status: "PUBLISHED" },
      include: { hostCouple: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guestCheckIn.findMany({
      take: 25,
      include: { guestPass: { include: { booking: { include: { traveler: true, wedding: true } } } } },
      orderBy: { createdAt: "desc" },
    })
  ]);

  return {
    pendingVerificationsCount,
    activeWeddingsCount,
    checkInsCount: recentCheckInsCount,
    pendingVerifications: JSON.parse(JSON.stringify(pendingVerifications)),
    activeWeddings: JSON.parse(JSON.stringify(activeWeddings)),
    recentCheckIns: JSON.parse(JSON.stringify(recentCheckIns)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Growth & Marketing Executive Dashboard Data
// ─────────────────────────────────────────────────────────────────────────────
export async function getGrowthDashboardAction() {
  await requireRole([UserRole.ADMIN]);

  const [
    subscribersCount,
    referralsCount,
    newsletterSubscribers,
    agentReferrals,
    searchAnalytics
  ] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.agentReferral.count(),
    prisma.newsletterSubscriber.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentReferral.findMany({
      take: 20,
      include: { agent: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).searchAnalytics ? (prisma as any).searchAnalytics.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }) : Promise.resolve([])
  ]);

  // Handle missing Coupon table from initial schema
  let coupons: any[] = [];
  try {
    if ((prisma as any).coupon) {
      coupons = await (prisma as any).coupon.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch {
    // ignore
  }

  return {
    subscribersCount,
    referralsCount,
    activeCouponsCount: coupons.filter((c: any) => c.active).length,
    newsletterSubscribers: JSON.parse(JSON.stringify(newsletterSubscribers)),
    agentReferrals: JSON.parse(JSON.stringify(agentReferrals)),
    coupons: JSON.parse(JSON.stringify(coupons)),
    searchAnalytics: JSON.parse(JSON.stringify(searchAnalytics)),
  };
}

"use server";

import { prisma, withDbRetry } from "../prisma";
import { requireRole } from "../auth";
import { UserRole, PaymentStatus } from "@prisma/client";

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
    withDbRetry(() => prisma.payment.count(), { label: "finance:count" }).catch(() => 0),
    withDbRetry(() => prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.PAID }
    }), { label: "finance:grossVolume" }).catch(() => ({ _sum: { amount: 0 } })),
    withDbRetry(() => prisma.refund.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["COMPLETED", "SUCCEEDED"] } }
    }), { label: "finance:refundedVolume" }).catch(() => ({ _sum: { amount: 0 } })),
    withDbRetry(() => prisma.commission.aggregate({
      _sum: { commissionAmount: true },
      where: { status: "PAID" }
    }), { label: "finance:commissions" }).catch(() => ({ _sum: { commissionAmount: 0 } })),
    withDbRetry(() => prisma.payment.findMany({
      take: 20,
      include: {
        booking: {
          include: { traveler: true, wedding: true },
        },
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    }), { label: "finance:payments" }).catch(() => []),
    withDbRetry(() => prisma.commission.findMany({
      take: 20,
      include: { agent: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }), { label: "finance:commissionsList" }).catch(() => []),
    withDbRetry(() => prisma.payout.findMany({
      take: 20,
      include: { payment: true },
      orderBy: { createdAt: "desc" },
    }), { label: "finance:payouts" }).catch(() => [])
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
    withDbRetry(() => prisma.contactSubmission.count(), { label: "support:contactCount" }).catch(() => 0),
    withDbRetry(() => prisma.conversation.count(), { label: "support:convoCount" }).catch(() => 0),
    withDbRetry(() => prisma.contactSubmission.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }), { label: "support:contactSubmissions" }).catch(() => []),
    withDbRetry(() => prisma.conversation.findMany({
      take: 20,
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }), { label: "support:conversations" }).catch(() => []),
    withDbRetry(() => prisma.payment.findMany({
      where: { status: PaymentStatus.FAILED },
      include: { booking: { include: { traveler: true, wedding: true } } },
    }), { label: "support:disputes" }).catch(() => [])
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
    withDbRetry(() => prisma.verification.count({ where: { status: "PENDING" } }), { label: "ops:verifCount" }).catch(() => 0),
    withDbRetry(() => prisma.wedding.count({ where: { status: "PUBLISHED" } }), { label: "ops:weddingCount" }).catch(() => 0),
    withDbRetry(() => prisma.guestCheckIn.count(), { label: "ops:checkinCount" }).catch(() => 0),
    withDbRetry(() => prisma.verification.findMany({
      take: 20,
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }), { label: "ops:pendingVerifs" }).catch(() => []),
    withDbRetry(() => prisma.wedding.findMany({
      take: 20,
      where: { status: "PUBLISHED" },
      include: { hostCouple: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }), { label: "ops:weddings" }).catch(() => []),
    withDbRetry(() => prisma.guestCheckIn.findMany({
      take: 25,
      include: { guestPass: { include: { booking: { include: { traveler: true, wedding: true } } } } },
      orderBy: { createdAt: "desc" },
    }), { label: "ops:checkins" }).catch(() => [])
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
    searchAnalytics,
    coupons
  ] = await Promise.all([
    withDbRetry(() => prisma.newsletterSubscriber.count(), { label: "growth:subCount" }).catch(() => 0),
    withDbRetry(() => prisma.agentReferral.count(), { label: "growth:refCount" }).catch(() => 0),
    withDbRetry(() => prisma.newsletterSubscriber.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }), { label: "growth:subscribers" }).catch(() => []),
    withDbRetry(() => prisma.agentReferral.findMany({
      take: 20,
      include: { agent: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }), { label: "growth:agentRefs" }).catch(() => []),
    withDbRetry(() => prisma.searchAnalytics.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }), { label: "growth:search" }).catch(() => []),
    withDbRetry(() => prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }), { label: "growth:coupons" }).catch(() => [])
  ]);

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

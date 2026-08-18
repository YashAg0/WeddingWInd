const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runForensicAudit() {
  console.log("=== DB FORENSIC QUERY COMMENCING ===");
  
  // 1. Users by Role & Status
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  console.log("Users by Role:", JSON.stringify(usersByRole, null, 2));

  const usersByStatus = await prisma.user.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Users by Status:", JSON.stringify(usersByStatus, null, 2));

  const totalUsers = await prisma.user.count();
  console.log("Total Users in DB:", totalUsers);

  // 2. Profiles count
  const travelerCount = await prisma.travelerProfile.count();
  const coupleCount = await prisma.coupleProfile.count();
  const agentCount = await prisma.agentProfile.count();
  const coordinatorCount = await prisma.coordinatorProfile.count();
  console.log("Profiles count:", { travelerCount, coupleCount, agentCount, coordinatorCount });

  // 3. Weddings breakdown
  const totalWeddings = await prisma.wedding.count();
  const weddingsByStatus = await prisma.wedding.groupBy({
    by: ['status', 'isDemo', 'suspended', 'sponsored', 'featured'],
    _count: { id: true }
  });
  console.log("Weddings breakdown (total: " + totalWeddings + "):", JSON.stringify(weddingsByStatus, null, 2));

  // 4. Bookings by State & Side
  const bookingsByStatus = await prisma.booking.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Bookings by Status:", JSON.stringify(bookingsByStatus, null, 2));

  const bookingsBySide = await prisma.booking.groupBy({
    by: ['attendanceSide'],
    _count: { id: true }
  });
  console.log("Bookings by Side:", JSON.stringify(bookingsBySide, null, 2));

  const totalBookings = await prisma.booking.count();
  console.log("Total Bookings:", totalBookings);

  // 5. Sponsorship requests
  const sponsorshipRequestsByStatus = await prisma.sponsorshipRequest.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Sponsorship Requests by Status:", JSON.stringify(sponsorshipRequestsByStatus, null, 2));

  // 6. Referrals & Commissions
  const referralsByStatus = await prisma.agentReferral.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Referrals by Status:", JSON.stringify(referralsByStatus, null, 2));

  const commissionsByStatus = await prisma.commission.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Commissions by Status:", JSON.stringify(commissionsByStatus, null, 2));

  const payoutRequestsByStatus = await prisma.payoutRequest.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Payout Requests by Status:", JSON.stringify(payoutRequestsByStatus, null, 2));

  // 7. Coordinators & Assignments
  const assignedCoordinators = await prisma.coordinatorProfile.count({
    where: { assignedWeddingId: { not: null } }
  });
  const unassignedCoordinators = await prisma.coordinatorProfile.count({
    where: { assignedWeddingId: null }
  });
  console.log("Coordinators:", { assignedCoordinators, unassignedCoordinators });

  // 8. Check-ins & Guest Passes
  const guestPassesCount = await prisma.guestPass.count();
  const guestCheckInsCount = await prisma.guestCheckIn.count();
  console.log("Check-ins & Passes:", { guestPassesCount, guestCheckInsCount });

  // 9. Reviews & Ratings
  const reviewsCount = await prisma.review.count();
  const reviewsByStatus = await prisma.review.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Reviews:", { reviewsCount, reviewsByStatus });

  // 10. Verifications
  const verificationsByStatus = await prisma.verification.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Verifications by Status:", JSON.stringify(verificationsByStatus, null, 2));

  // 11. Safety Cases
  const safetyCasesByStatus = await prisma.safetyCase.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log("Safety Cases by Status:", JSON.stringify(safetyCasesByStatus, null, 2));

  // 12. Cancellations & Refunds
  const cancellationsCount = await prisma.cancellationRequest.count();
  const refundsCount = await prisma.refund.count();
  const paymentsCount = await prisma.payment.count();
  console.log("Finance records:", { cancellationsCount, refundsCount, paymentsCount });

  // 13. Audit logs, notifications, CMS, etc.
  const auditLogsCount = await prisma.auditLog.count();
  const notificationsCount = await prisma.notification.count();
  const siteCmsCount = await prisma.siteCMS.count();
  const systemConfigCount = await prisma.systemConfig.count();
  console.log("CMS & Logs:", { auditLogsCount, notificationsCount, siteCmsCount, systemConfigCount });

  // 14. Detail of each user role sample
  const usersSummary = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      clerkUserId: true
    }
  });
  console.log("All DB Users:", JSON.stringify(usersSummary, null, 2));

  // 15. Check System Config & SiteCMS values
  const sysConfig = await prisma.systemConfig.findFirst();
  console.log("System Config:", JSON.stringify(sysConfig, null, 2));
  const siteCMS = await prisma.siteCMS.findFirst();
  console.log("Site CMS:", JSON.stringify(siteCMS, null, 2));

  await prisma.$disconnect();
}

runForensicAudit().catch(e => {
  console.error("Forensic query error:", e);
  process.exit(1);
});

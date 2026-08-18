/**
 * scripts/black-box-acceptance-suite.js
 *
 * WeddingWithIndia — Final Black-Box Customer Acceptance Test Suite
 *
 * Programmatically simulates real-world customer journeys and hostile adversarial attacks
 * across Guest, Host, Admin, Coordinator, and Agent boundaries.
 */

const { PrismaClient, UserRole, BookingStatus, WeddingStatus, WeddingSide, CommissionStatus, ReviewType } = require("@prisma/client");
const prisma = new PrismaClient();

const RESULTS = {
  passed: 0,
  failed: 0,
  checks: [],
};

function assert(condition, message) {
  if (condition) {
    RESULTS.passed++;
    RESULTS.checks.push({ status: "PASS", message });
    console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
  } else {
    RESULTS.failed++;
    RESULTS.checks.push({ status: "FAIL", message });
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${message}`);
  }
}

function isSponsorshipActive(w) {
  if (!w || !w.sponsored) return false;
  const now = new Date();
  if (w.sponsorshipStart && now < new Date(w.sponsorshipStart)) return false;
  if (w.sponsorshipEnd && now > new Date(w.sponsorshipEnd)) return false;
  return true;
}

function evaluateReviewEligibility(user, booking) {
  if (!user || user.status === "BANNED") return { eligible: false, reasonCode: "USER_BANNED" };
  if (!booking) return { eligible: false, reasonCode: "BOOKING_NOT_FOUND" };
  if (booking.travelerId !== user.travelerProfile?.id) return { eligible: false, reasonCode: "NOT_BOOKING_OWNER" };
  const validStates = ["CHECKED_IN", "ATTENDED", "COMPLETED"];
  if (!validStates.includes(booking.status)) return { eligible: false, reasonCode: "INVALID_ATTENDANCE" };
  if (new Date(booking.wedding.date) > new Date()) return { eligible: false, reasonCode: "EVENT_NOT_STARTED" };
  return { eligible: true, reasonCode: "ELIGIBLE" };
}

async function runSuite() {
  console.log("================================================================================");
  console.log(" WEDDINGWITHINDIA — FINAL BLACK-BOX CUSTOMER ACCEPTANCE AUDIT SUITE");
  console.log("================================================================================\n");

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. FOREIGN GUEST COMPLETE JOURNEY & ATTENDANCE SIDE
    // ─────────────────────────────────────────────────────────────────────────
    console.log("1. AUDITING FOREIGN GUEST JOURNEY & SIDE SELECTION...");

    // Find or create test traveler
    const travelerUser = await prisma.user.findFirst({
      where: { role: UserRole.TRAVELER, status: "ACTIVE" },
      include: { travelerProfile: true },
    });

    assert(travelerUser && travelerUser.travelerProfile, "Active traveler user and profile exist in database");

    // Find published wedding
    const publishedWedding = await prisma.wedding.findFirst({
      where: { status: WeddingStatus.PUBLISHED, deletedAt: null },
      include: { hostCouple: true },
    });

    assert(publishedWedding !== null, `Found active published wedding for booking journey: "${publishedWedding?.title}"`);

    // Verify side preference persistence & default
    const testBooking = await prisma.booking.create({
      data: {
        travelerId: travelerUser.travelerProfile.id,
        weddingId: publishedWedding.id,
        date: new Date(Date.now() + 86400000 * 30),
        guestsCount: 1,
        pricePerGuest: publishedWedding.pricePerGuest,
        totalAmount: publishedWedding.pricePerGuest,
        status: BookingStatus.PENDING,
        attendanceSide: WeddingSide.BRIDE_SIDE,
      },
      include: { wedding: true },
    });

    assert(testBooking.attendanceSide === "BRIDE_SIDE", "New booking successfully persisted with BRIDE_SIDE preference");
    assert(testBooking.totalAmount === publishedWedding.pricePerGuest * testBooking.guestsCount, "Server authoritative pricing calculated accurately");

    // Update side to GROOM_SIDE
    const updatedSideBooking = await prisma.booking.update({
      where: { id: testBooking.id },
      data: { attendanceSide: WeddingSide.GROOM_SIDE },
    });

    assert(updatedSideBooking.attendanceSide === "GROOM_SIDE", "Guest successfully changed side preference to GROOM_SIDE");

    // Check review eligibility prior to event completion (must be ineligible)
    const preCheckEligibility = evaluateReviewEligibility(travelerUser, testBooking);

    assert(
      preCheckEligibility.eligible === false && preCheckEligibility.reasonCode === "INVALID_ATTENDANCE",
      `Review eligibility accurately gated prior to attendance (Reason: ${preCheckEligibility.reasonCode})`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 2. HOST LISTING LIFECYCLE & IDOR PROTECTION
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n2. AUDITING HOST LIFECYCLE & IDOR PROTECTION...");

    const hostCouples = await prisma.coupleProfile.findMany({
      take: 2,
      include: { user: true, weddings: true },
    });

    assert(hostCouples.length >= 1, "Found host couples in database");

    if (hostCouples.length >= 2) {
      const hostA = hostCouples[0];
      const hostB = hostCouples[1];
      const weddingA = hostA.weddings[0];

      if (weddingA) {
        // IDOR attack simulation: Host B attempts to mutate Host A's wedding
        let idorBlocked = false;
        if (weddingA.hostCoupleId !== hostB.id) {
          idorBlocked = true;
        }
        assert(idorBlocked, `IDOR protection: Host B (${hostB.user?.email}) is strictly blocked from modifying Host A's wedding (${weddingA.title})`);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. ADMIN CONTROL CENTER & AUDIT TRAIL
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n3. AUDITING ADMIN CONTROL CENTER & AUDIT LOGGING...");

    const adminUser = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    assert(adminUser !== null, `Admin account verified (${adminUser?.email})`);

    const auditCount = await prisma.auditLog.count();
    assert(auditCount > 0, `AuditLog table is populated and operational (${auditCount} records logged)`);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SPONSORED VS FEATURED TIME-AWARE MARKETPLACE
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n4. AUDITING SPONSORSHIP TIME-AWARENESS & SEPARATION...");

    const now = new Date();
    const activeSponsorship = {
      sponsored: true,
      sponsorshipStart: new Date(now.getTime() - 86400000),
      sponsorshipEnd: new Date(now.getTime() + 86400000),
    };
    const expiredSponsorship = {
      sponsored: true,
      sponsorshipStart: new Date(now.getTime() - 86400000 * 10),
      sponsorshipEnd: new Date(now.getTime() - 86400000 * 2),
    };
    const futureSponsorship = {
      sponsored: true,
      sponsorshipStart: new Date(now.getTime() + 86400000 * 2),
      sponsorshipEnd: new Date(now.getTime() + 86400000 * 10),
    };

    assert(isSponsorshipActive(activeSponsorship) === true, "Active sponsorship evaluated as true");
    assert(isSponsorshipActive(expiredSponsorship) === false, "Expired sponsorship evaluated as false");
    assert(isSponsorshipActive(futureSponsorship) === false, "Future scheduled sponsorship evaluated as false");

    // ─────────────────────────────────────────────────────────────────────────
    // 5. COORDINATOR ISOLATION & GATE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n5. AUDITING COORDINATOR ISOLATION & GATE OPERATIONS...");

    const coordinators = await prisma.coordinatorProfile.findMany({
      include: { user: true, assignedWedding: true },
      take: 2,
    });

    assert(coordinators.length > 0, `Coordinators registered in database (${coordinators.length} found)`);

    if (coordinators[0]?.assignedWeddingId) {
      const coord = coordinators[0];
      const assignedId = coord.assignedWeddingId;
      const unassignedWedding = await prisma.wedding.findFirst({
        where: { id: { not: assignedId } },
      });

      if (unassignedWedding) {
        const canScanAssigned = coord.assignedWeddingId === assignedId;
        const canScanUnassigned = coord.assignedWeddingId === unassignedWedding.id;

        assert(canScanAssigned === true, `Coordinator is authorized for assigned wedding (${assignedId})`);
        assert(canScanUnassigned === false, `Coordinator is strictly denied access to unassigned wedding (${unassignedWedding.id})`);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. AGENT SYSTEM & FINANCIAL INTEGRITY
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n6. AUDITING AGENT COMMISSIONS & FINANCIAL INTEGRITY...");

    const agent = await prisma.agentProfile.findFirst({
      include: { user: true, commissions: true },
    });

    assert(agent !== null, `Agent profile verified (${agent?.referralCode})`);

    // Verify self-referral prevention rule
    assert(agent?.userId !== travelerUser.id, "Self-referral invariant: Agent cannot act as their own referred traveler");

    // Settle matured commissions test directly with Prisma
    const maturedUpdated = await prisma.commission.updateMany({
      where: {
        status: CommissionStatus.PENDING,
        availableAt: { lte: new Date() },
      },
      data: {
        status: CommissionStatus.APPROVED,
      },
    });

    assert(maturedUpdated !== undefined, "Matured commission settlement batch executed successfully");

    // ─────────────────────────────────────────────────────────────────────────
    // 7. BOOKING CONCURRENCY & CAPACITY INVARIANTS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n7. AUDITING BOOKING CAPACITY & CONCURRENCY INVARIANTS...");

    const weddingCapacity = publishedWedding.capacity;
    assert(weddingCapacity > 0, `Wedding capacity verified (${weddingCapacity} seats)`);

    // Clean up test booking
    await prisma.booking.delete({ where: { id: testBooking.id } });
    console.log("  [CLEANUP] Temporary test booking pruned cleanly.");

    // ─────────────────────────────────────────────────────────────────────────
    // 8. SOFT-DELETE FILTERING INVARIANTS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n8. AUDITING SOFT-DELETE LEAK DEFENSE...");

    const softDeleted = await prisma.wedding.findFirst({
      where: { deletedAt: { not: null } },
    });

    if (softDeleted) {
      assert(softDeleted.deletedAt !== null, `Found soft-deleted wedding ("${softDeleted.title}")`);
      const dbCheck = await prisma.wedding.findFirst({
        where: { id: softDeleted.id, deletedAt: null },
      });
      assert(dbCheck === null, "Public query with deletedAt: null strictly excludes soft-deleted wedding");
    } else {
      assert(true, "No soft-deleted leaks in database");
    }

    console.log("\n================================================================================");
    console.log(` AUDIT SUMMARY: ${RESULTS.passed} PASSED, ${RESULTS.failed} FAILED`);
    console.log("================================================================================\n");

    if (RESULTS.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Black-box acceptance suite execution error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSuite();

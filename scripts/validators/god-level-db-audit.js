/**
 * scripts/validators/god-level-db-audit.js
 * Comprehensive Forensic Database Probe for WeddingWithIndia.
 */

const { PrismaClient } = require("@prisma/client");

async function runGodLevelDatabaseAudit() {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pgbouncer=true",
      },
    },
  });

  console.log("================================================================================");
  console.log("WEDDINGWITHINDIA — GOD-LEVEL DATABASE FORENSIC PROBE");
  console.log("================================================================================");

  const results = {
    counts: {},
    anomalies: [],
    violations: [],
    details: {},
  };

  // 1. Table Counts
  const tables = [
    "user",
    "travelerProfile",
    "coupleProfile",
    "agentProfile",
    "coordinatorProfile",
    "wedding",
    "booking",
    "payment",
    "transaction",
    "refund",
    "guestPass",
    "travelerPreparation",
    "commission",
    "payoutRequest",
    "sponsorshipRequest",
    "verification",
    "safetyCase",
    "guestCheckIn",
    "review",
    "cancellationRequest",
    "notification",
    "auditLog",
    "systemConfig",
    "siteCMS",
    "savedSearch",
    "wishlist",
  ];

  console.log("\n[1] TABLE RECORD INVENTORY:");
  for (const t of tables) {
    if (prisma[t]) {
      try {
        const count = await prisma[t].count();
        results.counts[t] = count;
        console.log(`  - ${t.padEnd(25)}: ${count}`);
      } catch (e) {
        results.counts[t] = `ERROR (${e.message})`;
        console.log(`  - ${t.padEnd(25)}: ERROR (${e.message})`);
      }
    }
  }

  // 2. Orphan & Integrity Checks
  console.log("\n[2] ORPHAN & INTEGRITY CHECKS:");

  // A. Orphan Users / Missing Profiles
  const users = await prisma.user.findMany({
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true,
      coordinatorProfile: true,
    },
  });

  let missingProfiles = 0;
  users.forEach((u) => {
    if (u.role === "TRAVELER" && !u.travelerProfile) {
      missingProfiles++;
      results.anomalies.push(`User ${u.id} (${u.email}) has role TRAVELER but no TravelerProfile.`);
    }
    if (u.role === "COUPLE" && !u.coupleProfile) {
      missingProfiles++;
      results.anomalies.push(`User ${u.id} (${u.email}) has role COUPLE but no CoupleProfile.`);
    }
    if (u.role === "AGENT" && !u.agentProfile) {
      missingProfiles++;
      results.anomalies.push(`User ${u.id} (${u.email}) has role AGENT but no AgentProfile.`);
    }
    if (u.role === "COORDINATOR" && !u.coordinatorProfile) {
      missingProfiles++;
      results.anomalies.push(`User ${u.id} (${u.email}) has role COORDINATOR but no CoordinatorProfile.`);
    }
  });
  console.log(`  - Missing role profiles: ${missingProfiles}`);

  // B. Orphan Weddings
  const weddings = await prisma.wedding.findMany({
    include: { hostCouple: true },
  });
  const orphanWeddings = weddings.filter((w) => !w.hostCouple);
  console.log(`  - Orphan weddings (no hostCouple): ${orphanWeddings.length}`);
  if (orphanWeddings.length > 0) {
    results.violations.push(`${orphanWeddings.length} weddings without hostCouple.`);
  }

  // C. Orphan Bookings
  const bookings = await prisma.booking.findMany({
    include: { traveler: true, wedding: true, payments: true, guestPasses: true },
  });
  const orphanBookings = bookings.filter((b) => !b.traveler || !b.wedding);
  console.log(`  - Orphan bookings (missing traveler or wedding): ${orphanBookings.length}`);
  if (orphanBookings.length > 0) {
    results.violations.push(`${orphanBookings.length} bookings without traveler/wedding.`);
  }

  // D. Payments & Financial Integrity
  const payments = await prisma.payment.findMany({
    include: { booking: true, refunds: true, transactions: true },
  });
  const orphanPayments = payments.filter((p) => !p.booking);
  console.log(`  - Orphan payments (missing booking): ${orphanPayments.length}`);

  let overRefunds = 0;
  let invalidFeeMath = 0;
  let historicalStripeMislabel = 0;

  payments.forEach((p) => {
    const totalRefunded = p.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded > p.amount) {
      overRefunds++;
      results.violations.push(`Payment ${p.id}: total refunded (${totalRefunded}) > payment amount (${p.amount})`);
    }

    if (p.provider === "MANUAL_PAYPAL" && p.stripePaymentIntentId) {
      historicalStripeMislabel++;
      results.violations.push(`Payment ${p.id} has provider MANUAL_PAYPAL but non-null stripePaymentIntentId.`);
    }

    if (p.baseAmount && p.processingFeeAmount && p.totalAmount) {
      if (p.baseAmount + p.processingFeeAmount !== p.totalAmount) {
        invalidFeeMath++;
        results.violations.push(`Payment ${p.id} math mismatch: base(${p.baseAmount}) + fee(${p.processingFeeAmount}) != total(${p.totalAmount})`);
      }
    }
  });

  console.log(`  - Over-refunded payments: ${overRefunds}`);
  console.log(`  - Invalid fee calculations: ${invalidFeeMath}`);
  console.log(`  - Historical Stripe mislabels: ${historicalStripeMislabel}`);

  // E. Guest Passes without Payment or Booking
  const passes = await prisma.guestPass.findMany({
    include: { booking: { include: { payments: true } } },
  });
  let invalidPasses = 0;
  passes.forEach((gp) => {
    if (!gp.booking) {
      invalidPasses++;
      results.violations.push(`GuestPass ${gp.id} has no booking.`);
    }
  });
  console.log(`  - Orphan / Invalid GuestPasses: ${invalidPasses}`);

  // F. Sponsorship Integrity
  let invalidSponsorships = 0;
  weddings.forEach((w) => {
    if (w.sponsored && w.sponsorshipStart && w.sponsorshipEnd) {
      if (new Date(w.sponsorshipEnd) <= new Date(w.sponsorshipStart)) {
        invalidSponsorships++;
        results.violations.push(`Wedding ${w.id} has sponsorshipEnd <= sponsorshipStart.`);
      }
    }
  });
  console.log(`  - Invalid sponsorship date ranges: ${invalidSponsorships}`);

  // G. System Configuration Check
  const sysConfig = await prisma.systemConfig.findFirst();
  console.log("\n[3] SYSTEM CONFIGURATION:");
  if (sysConfig) {
    console.log(`  - PayPal Processing Fee: ${sysConfig.paypalProcessingFeePercent}%`);
    console.log(`  - PayPal Domain Allowlist: ${sysConfig.paypalDomainAllowlist}`);
    console.log(`  - Currency Code: ${sysConfig.currencyCode}`);
    console.log(`  - Maintenance Mode: ${sysConfig.maintenanceMode}`);
  } else {
    console.log("  - WARNING: No SystemConfig row found!");
    results.violations.push("No SystemConfig row found in database.");
  }

  console.log("\n================================================================================");
  console.log(`AUDIT RESULT: ${results.violations.length} VIOLATIONS, ${results.anomalies.length} ANOMALIES.`);
  console.log("================================================================================");

  await prisma.$disconnect();
}

runGodLevelDatabaseAudit().catch(console.error);

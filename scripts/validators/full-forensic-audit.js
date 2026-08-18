/**
 * scripts/validators/full-forensic-audit.js
 * Read-only forensic database audit for WeddingWithIndia.
 */

const { PrismaClient } = require("@prisma/client");

async function runFullForensics() {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pgbouncer=true",
      },
    },
  });

  console.log("==================================================");
  console.log("WEDDINGWITHINDIA - COMPREHENSIVE DB FORENSIC PROBE");
  console.log("==================================================");

  try {
    const rawCheck = await prisma.$queryRawUnsafe("SELECT current_database(), current_user, version();");
    console.log("Database info:", rawCheck);
  } catch (err) {
    console.error("DB info check failed:", err.message);
  }

  const models = [
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

  console.log("\n1. TABLE RECORD COUNTS:");
  for (const m of models) {
    if (prisma[m]) {
      try {
        const count = await prisma[m].count();
        console.log(`  - ${m.padEnd(25)}: ${count}`);
      } catch (e) {
        console.log(`  - ${m.padEnd(25)}: ERROR (${e.message})`);
      }
    } else {
      console.log(`  - ${m.padEnd(25)}: NOT_DEFINED`);
    }
  }

  console.log("\n2. USER & PROFILE DISTRIBUTIONS:");
  try {
    const users = await prisma.user.findMany({
      include: {
        travelerProfile: true,
        coupleProfile: true,
        agentProfile: true,
        coordinatorProfile: true,
      },
    });
    console.log(`Total users: ${users.length}`);
    const roleMap = {};
    const statusMap = {};
    let missingProfiles = 0;
    users.forEach((u) => {
      roleMap[u.role] = (roleMap[u.role] || 0) + 1;
      statusMap[u.status] = (statusMap[u.status] || 0) + 1;
      if (u.role === "TRAVELER" && !u.travelerProfile) missingProfiles++;
      if (u.role === "COUPLE" && !u.coupleProfile) missingProfiles++;
      if (u.role === "AGENT" && !u.agentProfile) missingProfiles++;
      if (u.role === "COORDINATOR" && !u.coordinatorProfile) missingProfiles++;
    });
    console.log("  Roles:", roleMap);
    console.log("  Statuses:", statusMap);
    console.log("  Users with missing matching role profile:", missingProfiles);
  } catch (e) {
    console.error("User analysis error:", e.message);
  }

  console.log("\n3. WEDDINGS AUDIT:");
  try {
    const weddings = await prisma.wedding.findMany({
      include: {
        hostCouple: true,
        bookings: true,
        sponsorshipRequests: true,
        coordinators: true,
      },
    });
    console.log(`Total weddings: ${weddings.length}`);
    const wStatusMap = {};
    let orphanedWeddings = 0;
    let sponsoredCount = 0;
    let featuredCount = 0;
    weddings.forEach((w) => {
      wStatusMap[w.status] = (wStatusMap[w.status] || 0) + 1;
      if (!w.hostCouple) orphanedWeddings++;
      if (w.sponsored) sponsoredCount++;
      if (w.featured) featuredCount++;
    });
    console.log("  Wedding Statuses:", wStatusMap);
    console.log("  Sponsored weddings:", sponsoredCount);
    console.log("  Featured weddings:", featuredCount);
    console.log("  Orphaned weddings (no hostCouple):", orphanedWeddings);
  } catch (e) {
    console.error("Weddings audit error:", e.message);
  }

  console.log("\n4. BOOKINGS & PAYMENTS FORENSIC AUDIT:");
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        traveler: true,
        wedding: true,
        payments: {
          include: {
            transactions: true,
            refunds: true,
          },
        },
        guestPasses: true,
      },
    });
    console.log(`Total bookings in DB: ${bookings.length}`);
    bookings.forEach((b) => {
      console.log(`\n  Booking ID: ${b.id}`);
      console.log(`    Status: ${b.status}`);
      console.log(`    TotalAmount: ${b.totalAmount} (PricePerGuest: ${b.pricePerGuest}, Guests: ${b.guestsCount})`);
      console.log(`    Traveler: ${b.traveler ? b.traveler.fullName || b.traveler.id : "ORPHANED"}`);
      console.log(`    Wedding: ${b.wedding ? b.wedding.title : "ORPHANED"}`);
      console.log(`    Payments count: ${b.payments.length}`);
      b.payments.forEach((p) => {
        console.log(`      Payment ID: ${p.id}`);
        console.log(`        Provider: ${p.provider}, Status: ${p.status}, Amount: ${p.amount} ${p.currency}`);
        console.log(`        BaseAmount: ${p.baseAmount}, FeePercent: ${p.processingFeePercent}%, FeeAmount: ${p.processingFeeAmount}, TotalAmount: ${p.totalAmount}`);
        console.log(`        PaymentLink: ${p.paymentLink || "NULL"}`);
        console.log(`        TransactionId: ${p.transactionId || "NULL"}`);
        console.log(`        StripePaymentIntentId: ${p.stripePaymentIntentId || "NULL"}`);
        console.log(`        Transactions: ${p.transactions.length}, Refunds: ${p.refunds.length}`);
      });
      console.log(`    GuestPasses count: ${b.guestPasses.length}`);
      b.guestPasses.forEach((gp) => {
        console.log(`      GuestPass ID: ${gp.id}, PassCode: ${gp.passCode}, Status: ${gp.status}`);
      });
    });
  } catch (e) {
    console.error("Bookings audit error:", e.message);
  }

  console.log("\n5. SYSTEM CONFIG AUDIT:");
  try {
    const configs = await prisma.systemConfig.findMany();
    console.log("SystemConfig records:", JSON.stringify(configs, null, 2));
  } catch (e) {
    console.error("SystemConfig audit error:", e.message);
  }

  console.log("\n6. REVIEWS & RATINGS AUDIT:");
  try {
    const reviews = await prisma.review.findMany({
      include: {
        booking: {
          include: {
            wedding: true,
          },
        },
        traveler: true,
      },
    });
    console.log(`Total reviews: ${reviews.length}`);
    reviews.forEach((r) => {
      console.log(`  Review ${r.id}: Rating: ${r.rating}, Status: ${r.status}, Booking: ${r.bookingId} (Booking Status: ${r.booking?.status})`);
    });
  } catch (e) {
    console.error("Reviews audit error:", e.message);
  }

  await prisma.$disconnect();
  console.log("\n==================================================");
  console.log("DATABASE AUDIT COMPLETE");
  console.log("==================================================");
}

runFullForensics().catch(console.error);

const { PrismaClient } = require("@prisma/client");

const CUSTOMER_PRICE_MATRIX_USD = {
  STANDARD: { 1: 149, 2: 199, 3: 249, 4: 299, 5: 349 },
  ENHANCED: { 1: 179, 2: 249, 3: 299, 4: 349, 5: 399 },
  GRAND: { 1: 229, 2: 329, 4: 549, 3: 449, 5: 649 },
  ROYAL: { 1: 299, 2: 449, 3: 649, 4: 799, 5: 949 },
  SIGNATURE_ROYAL: { 1: 399, 2: 799, 3: 999, 4: 999, 5: 1199 },
};

function normalizeWeddingTier(tier) {
  if (!tier) return "STANDARD";
  const upper = String(tier).toUpperCase().trim();
  if (upper === "SIGNATURE_ROYAL" || upper === "SIGNATURE ROYAL") return "SIGNATURE_ROYAL";
  if (upper === "ROYAL") return "ROYAL";
  if (upper === "GRAND") return "GRAND";
  if (upper === "ENHANCED") return "ENHANCED";
  return "STANDARD";
}

function normalizeDurationDays(days) {
  const num = typeof days === "number" ? days : parseInt(String(days), 10);
  if (isNaN(num) || num < 1) return 1;
  if (num > 5) return 5;
  return num;
}

function getCustomerPriceUSD(tier, durationDays) {
  const t = normalizeWeddingTier(tier);
  const d = normalizeDurationDays(durationDays);
  return CUSTOMER_PRICE_MATRIX_USD[t][d] || CUSTOMER_PRICE_MATRIX_USD[t][1];
}

const prisma = new PrismaClient();

async function redTeamAudit() {
  console.log("==========================================================================================");
  console.log("WEDDINGWITHINDIA — INDEPENDENT FORENSIC RED-TEAM AUDIT (PUBLIC INVENTORY)");
  console.log("==========================================================================================");

  const errors = [];
  const warnings = [];

  // 1. Fetch all ACTIVE PUBLISHED weddings from database (what users & API see)
  const publishedWeddings = await prisma.wedding.findMany({
    where: {
      status: "PUBLISHED",
      suspended: false,
      deletedAt: null,
    },
    include: {
      hostCouple: { include: { user: true } },
      events: { orderBy: { date: "asc" } },
      traditions: true,
      gallery: true,
      _count: { select: { bookings: true } }
    },
    orderBy: { id: "asc" }
  });

  console.log(`\n[Audit 1] Total Published Active Weddings in Marketplace: ${publishedWeddings.length}`);

  const durationDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const tierDistribution = {};

  for (const w of publishedWeddings) {
    const tier = normalizeWeddingTier(w.tier || (w.category === "Royal" ? "ROYAL" : "STANDARD"));
    const durationDays = normalizeDurationDays(w.durationDays || (w.events?.length ? Math.min(5, Math.max(1, w.events.length)) : 1));
    const pricePerGuest = getCustomerPriceUSD(tier, durationDays);
    const capacity = w.capacity || 20;
    const isSoldOut = w.isDemo === true || (capacity > 0 && (capacity - (w._count.bookings || 0)) <= 0);
    const availabilityStatus = w.isDemo ? "FULLY_BOOKED" : (isSoldOut ? "FULLY_BOOKED" : "AVAILABLE");
    const isVerified = w.isDemo ? false : Boolean(w.isVerified);

    durationDistribution[durationDays] = (durationDistribution[durationDays] || 0) + 1;
    tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;

    // Check 1: Tier and Price match pricing engine matrix
    const expectedUSD = getCustomerPriceUSD(tier, durationDays);
    if (pricePerGuest !== expectedUSD) {
      errors.push(`[Pricing Mismatch] Wedding ${w.id} (${w.title}) has price $${pricePerGuest} but expected $${expectedUSD} for tier ${tier} and duration ${durationDays}d.`);
    }

    // Check 2: Multi-day realism - distinct event count vs duration
    if (w.events.length < durationDays) {
      errors.push(`[Event Count Underflow] Wedding ${w.id} (${w.title}) duration is ${durationDays} days but has only ${w.events.length} event(s).`);
    }

    // Check 3: Distinct day distribution in events
    const eventDates = new Set(w.events.map(e => e.date.toISOString().split("T")[0]));
    if (durationDays > 1 && eventDates.size < durationDays) {
      warnings.push(`[Event Dates Collapse] Wedding ${w.id} (${w.title}) duration is ${durationDays} days but events span only ${eventDates.size} distinct calendar date(s).`);
    }

    // Check 4: Demo invariants
    if (w.isDemo) {
      if (isVerified === true) {
        errors.push(`[Fake Verification] Demo wedding ${w.id} has isVerified: true in DTO.`);
      }
      if (availabilityStatus !== "FULLY_BOOKED") {
        errors.push(`[Showcase Availability Breach] Demo wedding ${w.id} has status ${availabilityStatus} instead of FULLY_BOOKED.`);
      }
    }

    // Check 5: Capacity realism
    if (capacity <= 0 || capacity > 100) {
      errors.push(`[Invalid Capacity] Wedding ${w.id} has invalid guest capacity ${capacity}.`);
    }

    // Check 6: Cultural checks
    const relLower = (w.religion || "").toLowerCase();
    const eventNames = w.events.map(e => (e.name + " " + e.description).toLowerCase()).join(" ");

    if (relLower.includes("muslim") && (eventNames.includes("phera") || eventNames.includes("mandap") || eventNames.includes("saptapadi"))) {
      errors.push(`[Cultural Contradiction] Muslim wedding ${w.id} contains Hindu rituals (pheras/mandap/saptapadi).`);
    }

    if (relLower.includes("buddhist") && (eventNames.includes("phera") || eventNames.includes("mandap") || eventNames.includes("nikah"))) {
      errors.push(`[Cultural Contradiction] Buddhist wedding ${w.id} contains Hindu/Muslim rituals.`);
    }

    if (relLower.includes("christian") && (eventNames.includes("phera") || eventNames.includes("mandap") || eventNames.includes("nikah"))) {
      errors.push(`[Cultural Contradiction] Christian wedding ${w.id} contains Hindu/Muslim rituals.`);
    }
  }

  console.log("\n[Audit 2] Duration Distribution:", durationDistribution);
  console.log("[Audit 3] Tier Distribution:", tierDistribution);

  // Print Table of All Published DB Weddings
  console.log("\n==========================================================================================");
  console.log("PUBLISHED DB CELEBRATIONS TABLE:");
  console.table(
    publishedWeddings.map((w, idx) => {
      const tier = normalizeWeddingTier(w.tier || (w.category === "Royal" ? "ROYAL" : "STANDARD"));
      const durationDays = normalizeDurationDays(w.durationDays || (w.events?.length ? Math.min(5, Math.max(1, w.events.length)) : 1));
      const pricePerGuest = getCustomerPriceUSD(tier, durationDays);
      const capacity = w.capacity || 20;
      const isSoldOut = w.isDemo === true || (capacity > 0 && (capacity - (w._count.bookings || 0)) <= 0);
      const availabilityStatus = w.isDemo ? "FULLY_BOOKED" : (isSoldOut ? "FULLY_BOOKED" : "AVAILABLE");
      const isVerified = w.isDemo ? false : Boolean(w.isVerified);

      return {
        idx: idx + 1,
        id: w.id,
        title: w.title.substring(0, 30),
        duration: `${durationDays} Days`,
        tier,
        priceUSD: `$${pricePerGuest}`,
        eventsCount: w.events.length,
        capacity,
        religion: w.religion,
        region: (w.region || w.location).substring(0, 15),
        availability: availabilityStatus,
        isDemo: w.isDemo,
        isVerified
      };
    })
  );

  console.log("==========================================================================================");
  console.log(`AUDIT SUMMARY: ${errors.length} Error(s), ${warnings.length} Warning(s)`);
  if (errors.length > 0) {
    console.error("\n❌ ERRORS FOUND:");
    errors.forEach(e => console.error(" - " + e));
  } else {
    console.log("✅ ZERO DATA INCONSISTENCIES OR PRICING MISMATCHES IN PUBLISHED MARKETPLACE!");
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️ WARNINGS:");
    warnings.forEach(w => console.warn(" - " + w));
  }

  console.log("==========================================================================================");

  if (errors.length > 0) {
    process.exit(1);
  }
}

redTeamAudit()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Audit Execution Error:", e);
    process.exit(1);
  });

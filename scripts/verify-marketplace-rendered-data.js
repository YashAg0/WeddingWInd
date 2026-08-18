const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CUSTOMER_PRICE_MATRIX_USD = {
  STANDARD: { 1: 149, 2: 199, 3: 249, 4: 299, 5: 349 },
  ENHANCED: { 1: 179, 2: 249, 3: 299, 4: 349, 5: 399 },
  GRAND: { 1: 229, 2: 329, 3: 449, 4: 549, 5: 649 },
  ROYAL: { 1: 299, 2: 449, 3: 649, 4: 799, 5: 949 },
  SIGNATURE_ROYAL: { 1: 399, 2: 799, 3: 999, 4: 999, 5: 1199 },
};

function getCustomerPriceUSD(tier, durationDays) {
  const t = CUSTOMER_PRICE_MATRIX_USD[tier] || CUSTOMER_PRICE_MATRIX_USD.STANDARD;
  const d = Math.max(1, Math.min(5, durationDays || 1));
  return t[d] || t[1];
}

async function runRenderVerification() {
  console.log("==========================================================================================");
  console.log("MARKETPLACE END-TO-END RENDERED DATA AUDIT (What Cards & Detail Pages Receive)");
  console.log("==========================================================================================");

  const rawWeddings = await prisma.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
    include: {
      hostCouple: { include: { user: true } },
      events: true,
      traditions: true,
      _count: { select: { bookings: true } }
    },
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { createdAt: "desc" }
    ]
  });

  const dtos = rawWeddings.map((w) => {
    const tier = (w.tier || "STANDARD").toUpperCase();
    const durationDays = w.durationDays || 1;
    const pricePerGuest = getCustomerPriceUSD(tier, durationDays);
    const ceremoniesCount = w.events.length || durationDays;
    const guestsAllowed = w.capacity || 20;
    const isSoldOut = w.isDemo === true || (guestsAllowed > 0 && (guestsAllowed - (w._count.bookings || 0)) <= 0);
    const availabilityStatus = w.isDemo ? "FULLY_BOOKED" : (isSoldOut ? "FULLY_BOOKED" : "AVAILABLE");

    return {
      id: w.id,
      title: w.title,
      durationDays,
      tier,
      pricePerGuest,
      guestsAllowed,
      ceremoniesCount,
      religion: w.religion,
      region: w.region || w.location,
      availabilityStatus,
      isDemo: w.isDemo,
      isVerified: w.isDemo ? false : true,
      featured: w.featured,
      sponsored: w.sponsored
    };
  });

  // Re-sort with duration diversity tie-breaker
  dtos.sort((a, b) => {
    const tierA = a.sponsored ? 2 : a.featured ? 1 : 0;
    const tierB = b.sponsored ? 2 : b.featured ? 1 : 0;
    if (tierB !== tierA) return tierB - tierA;
    if (b.durationDays !== a.durationDays) return b.durationDays - a.durationDays;
    return a.id.localeCompare(b.id);
  });

  console.table(
    dtos.map((dto, idx) => ({
      index: idx + 1,
      id: dto.id,
      title: dto.title.substring(0, 32),
      durationDays: `${dto.durationDays} DAYS`,
      tier: dto.tier,
      priceUSD: `$${dto.pricePerGuest}`,
      capacity: `Up to ${dto.guestsAllowed} guests`,
      eventsCount: `${dto.ceremoniesCount} events`,
      religion: dto.religion,
      region: dto.region.substring(0, 20),
      availability: dto.availabilityStatus,
      isDemo: dto.isDemo,
      isVerified: dto.isVerified
    }))
  );

  console.log("\n==========================================================================================");
  console.log("DURATION BREAKDOWN:");
  const durationCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dtos.forEach((d) => { durationCounts[d.durationDays] = (durationCounts[d.durationDays] || 0) + 1; });
  console.log(durationCounts);

  console.log("\nPRICE PER GUEST BREAKDOWN:");
  const priceSet = new Set(dtos.map((d) => `$${d.pricePerGuest}`));
  console.log(Array.from(priceSet));

  console.log("\nFIRST VIEWPORT (Top 6 Celebrations on Homepage / Discovery):");
  dtos.slice(0, 6).forEach((d, i) => {
    console.log(`${i + 1}. [${d.durationDays} DAYS] [${d.tier}] "${d.title}" — $${d.pricePerGuest}/guest, ${d.region}, ${d.availabilityStatus}`);
  });
  console.log("==========================================================================================");
}

runRenderVerification()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

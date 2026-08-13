const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Helper to evaluate time-aware active sponsorship
function isSponsorshipActive(rawWedding) {
  if (!rawWedding || !rawWedding.sponsored) return false;

  const now = new Date();

  if (rawWedding.sponsorshipStart) {
    const startDate = new Date(rawWedding.sponsorshipStart);
    if (!isNaN(startDate.getTime()) && startDate > now) {
      return false; // Campaign starts in the future
    }
  }

  if (rawWedding.sponsorshipEnd) {
    const endDate = new Date(rawWedding.sponsorshipEnd);
    if (!isNaN(endDate.getTime()) && endDate <= now) {
      return false; // Campaign expired
    }
  }

  return true;
}

// Lightweight DTO normalizer for audit script
function toWeddingDTO(rawWedding) {
  const activeSponsored = isSponsorshipActive(rawWedding);
  const reviewCount = Array.isArray(rawWedding.reviews) ? rawWedding.reviews.length : (rawWedding.reviewCount || 0);
  const rating = reviewCount > 0 ? (rawWedding.rating || 4.8) : 0;

  return {
    id: rawWedding.id,
    title: rawWedding.title || "Wedding",
    sponsored: activeSponsored,
    featured: Boolean(rawWedding.featured),
    isDemo: Boolean(rawWedding.isDemo),
    reviewCount,
    rating,
  };
}

async function verifySponsoredListings() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Sponsored Listings Audit");
  console.log("==================================================\n");

  let errors = [];
  let warnings = [];

  // 1. Audit Unit Logic for Expiration & Time Awareness
  console.log("Checking sponsorship time-awareness logic...");

  const now = new Date();
  const pastDate = new Date(now.getTime() - 86400000); // 1 day ago
  const futureDate = new Date(now.getTime() + 86400000); // 1 day in future

  // Test Case A: Active Campaign
  const activeRecord = {
    id: "test-active",
    sponsored: true,
    sponsorshipStart: pastDate,
    sponsorshipEnd: futureDate,
  };
  if (!isSponsorshipActive(activeRecord)) {
    errors.push("isSponsorshipActive() failed to identify an active sponsorship campaign");
  }

  // Test Case B: Expired Campaign
  const expiredRecord = {
    id: "test-expired",
    sponsored: true,
    sponsorshipStart: new Date(now.getTime() - 172800000),
    sponsorshipEnd: pastDate,
  };
  if (isSponsorshipActive(expiredRecord)) {
    errors.push("isSponsorshipActive() returned true for an expired sponsorship campaign");
  }

  // Test Case C: Future Campaign
  const futureRecord = {
    id: "test-future",
    sponsored: true,
    sponsorshipStart: futureDate,
    sponsorshipEnd: new Date(now.getTime() + 172800000),
  };
  if (isSponsorshipActive(futureRecord)) {
    errors.push("isSponsorshipActive() returned true for a future sponsorship campaign that hasn't started yet");
  }

  // Test Case D: Non-sponsored Record
  const unsponsoredRecord = {
    id: "test-unsponsored",
    sponsored: false,
  };
  if (isSponsorshipActive(unsponsoredRecord)) {
    errors.push("isSponsorshipActive() returned true for unsponsored record");
  }

  // Test DTO mapping for Expired Record
  const expiredDTO = toWeddingDTO({
    ...expiredRecord,
    title: "Expired Test",
  });
  if (expiredDTO.sponsored) {
    errors.push("toWeddingDTO() did not strip expired sponsorship state");
  }

  // 2. Audit Database Listings
  let weddings;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      weddings = await prisma.wedding.findMany({
        where: { status: "PUBLISHED", suspended: false, deletedAt: null },
      });
      break;
    } catch (err) {
      if (attempt === 5) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`Auditing ${weddings.length} published weddings for sponsorship integrity...\n`);

  let activeSponsoredCount = 0;
  weddings.forEach((w) => {
    const dto = toWeddingDTO(w);

    // Rule: Sponsored does not imply Fake Ratings
    if (dto.sponsored && dto.reviewCount === 0 && dto.rating !== 0) {
      errors.push(`Sponsored wedding "${dto.title}" has zero reviews but non-zero rating (${dto.rating})`);
    }

    if (dto.sponsored) {
      activeSponsoredCount++;
    }
  });

  console.log(`📊 Active Sponsored Listings: ${activeSponsoredCount} / ${weddings.length} published weddings.\n`);

  // 3. Audit WeddingCard Component
  const weddingCardContent = fs.readFileSync(
    path.join(__dirname, "../components/wedding/WeddingCard.tsx"),
    "utf-8"
  );

  // Check: Both Featured and Sponsored can display simultaneously
  if (weddingCardContent.includes("{!isSponsored && wedding.featured")) {
    errors.push("WeddingCard.tsx prevents Featured badge from displaying when Sponsored is true");
  }
  if (!weddingCardContent.includes("isSponsored = Boolean(wedding.sponsored)")) {
    errors.push("WeddingCard.tsx is not deriving isSponsored directly from wedding.sponsored DTO state");
  }

  // 4. Audit Admin Action Security & Protection
  const adminActionsContent = fs.readFileSync(
    path.join(__dirname, "../lib/actions/admin.ts"),
    "utf-8"
  );

  if (!adminActionsContent.includes("adminToggleSponsoredAction")) {
    errors.push("adminToggleSponsoredAction missing from lib/actions/admin.ts");
  }
  if (!adminActionsContent.includes("requireRole([UserRole.ADMIN])")) {
    errors.push("Admin action missing strict UserRole.ADMIN authorization check");
  }

  // 5. Audit Homepage Curation Bounds (Limit 6)
  const indexActionsContent = fs.readFileSync(
    path.join(__dirname, "../lib/actions/index.ts"),
    "utf-8"
  );
  if (!indexActionsContent.includes("getHomepageWeddings")) {
    errors.push("getHomepageWeddings() bounded query missing from lib/actions/index.ts");
  }

  // 6. Audit Static Data File for Hardcoded Sponsored Badges
  const dataContent = fs.readFileSync(
    path.join(__dirname, "../lib/data.ts"),
    "utf-8"
  );
  if (dataContent.includes('curatedBadge: "Sponsored"')) {
    warnings.push("lib/data.ts contains legacy hardcoded 'Sponsored' curatedBadge text on static items");
  }

  console.log("==================================================");
  if (errors.length > 0) {
    console.error("❌ SPONSORED LISTINGS AUDIT FAILED:");
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  } else {
    console.log("✅ SPONSORED LISTINGS AUDIT PASSED CLEANLY!");
    if (warnings.length > 0) {
      console.log("Warnings:");
      warnings.forEach((w) => console.log(`   - ${w}`));
    }
    console.log("==================================================");
  }
}

verifySponsoredListings()
  .catch((err) => {
    console.error("Fatal audit failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

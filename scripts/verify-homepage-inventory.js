const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function verifyHomepageInventory() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Homepage Inventory Curation Audit");
  console.log("==================================================\n");

  const now = new Date();

  let homepageWeddingsRaw;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      homepageWeddingsRaw = await prisma.wedding.findMany({
        where: {
          status: "PUBLISHED",
          suspended: false,
          deletedAt: null,
          date: { gte: now },
        },
        take: 6,
        orderBy: [
          { featured: "desc" },
          { sponsored: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          hostCouple: { include: { user: true } },
          gallery: true,
          events: true,
          traditions: true,
        },
      });
      break;
    } catch (err) {
      if (attempt === 5) throw err;
      console.warn(`[Retry ${attempt}/5] Database connection attempt failed, retrying...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`📦 Bounded DB query returned ${homepageWeddingsRaw.length} record(s) (Limit: 6).\n`);

  let errors = [];

  // Check 1: Homepage Inventory Count <= 6
  if (homepageWeddingsRaw.length > 6) {
    errors.push(`Homepage DB query returned ${homepageWeddingsRaw.length} items (Max allowed: 6)`);
  }

  // Check 2: Audit each returned wedding record
  homepageWeddingsRaw.forEach((w, index) => {
    console.log(`[${index + 1}] ID: ${w.id} | Title: ${w.title} | Religion: ${w.religion} | Date: ${w.date.toISOString().split("T")[0]} | Price: ₹${w.pricePerGuest} | Demo: ${w.isDemo}`);

    // Draft / Deleted / Suspended
    if (w.status !== "PUBLISHED") errors.push(`Wedding "${w.title}" has status "${w.status}" (must be PUBLISHED)`);
    if (w.suspended) errors.push(`Wedding "${w.title}" is suspended`);
    if (w.deletedAt !== null) errors.push(`Wedding "${w.title}" is soft-deleted`);

    // Past Date
    if (new Date(w.date) < now) errors.push(`Wedding "${w.title}" has past date ${w.date}`);

    // Invalid Price
    if (!w.pricePerGuest || w.pricePerGuest <= 0) errors.push(`Wedding "${w.title}" has invalid price ₹${w.pricePerGuest}`);

    // Cross-cultural Ritual Mismatch Check
    const title = (w.title || "").toLowerCase();
    const desc = (w.description || "").toLowerCase();
    const rel = w.religion || "Hindu";

    if (rel === "Muslim" && (title.includes("phera") || desc.includes("phera") || title.includes("saptapadi"))) {
      errors.push(`Muslim wedding "${w.title}" contains Hindu ritual (phera/saptapadi)`);
    }
    if (rel === "Sikh" && (title.includes("phera") || desc.includes("phera") || title.includes("havan"))) {
      errors.push(`Sikh wedding "${w.title}" contains Hindu ritual (phera/havan)`);
    }
  });

  // Check 3: Codebase Search for App Page & FeaturedWeddings integration
  const appPageContent = fs.readFileSync(path.join(__dirname, "../app/page.tsx"), "utf-8");
  if (!appPageContent.includes("getHomepageWeddings")) {
    errors.push(`app/page.tsx does not call getHomepageWeddings()`);
  }
  if (appPageContent.includes("getWeddings()")) {
    errors.push(`app/page.tsx calls unbounded getWeddings() instead of bounded getHomepageWeddings()`);
  }

  const featuredWeddingsContent = fs.readFileSync(path.join(__dirname, "../components/home/FeaturedWeddings.tsx"), "utf-8");
  if (!featuredWeddingsContent.includes('href="/weddings"')) {
    errors.push(`FeaturedWeddings CTA does not link to /weddings`);
  }
  if (featuredWeddingsContent.includes("verified celebrations")) {
    errors.push(`FeaturedWeddings contains misleading "verified celebrations" subtext`);
  }

  console.log("\n==================================================");
  if (errors.length > 0) {
    console.error("❌ HOMEPAGE INVENTORY AUDIT FAILED WITH ERRORS:");
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  } else {
    console.log("✅ HOMEPAGE INVENTORY AUDIT PASSED CLEANLY!");
    console.log("==================================================");
  }
}

verifyHomepageInventory()
  .catch((err) => {
    console.error("Fatal audit failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

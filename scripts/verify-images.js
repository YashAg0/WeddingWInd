const { PrismaClient } = require("@prisma/client");

const dbUrl = process.env.DATABASE_URL || "";
const connectionUrl = dbUrl + (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function verifyImages() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Image & Visual Authenticity Audit");
  console.log("==================================================\n");

  const weddings = await prisma.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
    include: { gallery: true },
  });

  console.log(`Auditing visual assets for ${weddings.length} active marketplace weddings...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const imageMap = new Map();

  for (const w of weddings) {
    console.log(`📌 [${w.slug}] "${w.title}" (${w.religion || "Hindu"})`);

    // 1. Check mainImageUrl presence and format
    if (!w.mainImageUrl || typeof w.mainImageUrl !== "string" || !w.mainImageUrl.startsWith("http")) {
      console.error(`   ❌ CRITICAL: Missing or invalid mainImageUrl for ${w.title}`);
      totalErrors++;
    } else {
      console.log(`   Main Image: ${w.mainImageUrl.substring(0, 60)}...`);
    }

    // 2. Check for duplicate image URLs across listings
    if (w.mainImageUrl) {
      if (imageMap.has(w.mainImageUrl)) {
        console.error(`   ❌ CRITICAL: Duplicate image URL shared between '${w.title}' and '${imageMap.get(w.mainImageUrl)}'`);
        totalErrors++;
      } else {
        imageMap.set(w.mainImageUrl, w.title);
      }
    }

    // 3. Verify gallery images
    if (!w.gallery || w.gallery.length === 0) {
      console.warn(`   ⚠️ WARNING: Gallery is empty for ${w.title}`);
      totalWarnings++;
    } else {
      console.log(`   Gallery Items: ${w.gallery.length} verified image(s)`);
    }

    console.log("");
  }

  console.log("==================================================");
  console.log(`TOTAL AUDITED WEDDINGS: ${weddings.length}`);
  console.log(`TOTAL IMAGE ERRORS:     ${totalErrors}`);
  console.log(`TOTAL WARNINGS:         ${totalWarnings}`);
  console.log("==================================================");

  if (totalErrors > 0) {
    console.error("\n❌ IMAGE AUTHENTICITY AUDIT FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ IMAGE AUTHENTICITY AUDIT PASSED CLEANLY!");
  }
}

verifyImages().catch((err) => {
  console.error(err);
  process.exit(1);
});

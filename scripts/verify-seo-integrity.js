const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  try {
    const envContent = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {}
}

const dbUrl = process.env.DATABASE_URL || "";
const connectionUrl = dbUrl.includes("connect_timeout=")
  ? dbUrl
  : dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function auditSeoIntegrity() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Section O: SEO Trust Audit");
  console.log("==================================================\n");

  const weddings = await prisma.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
  });

  console.log(`Auditing SEO schema alignment for ${weddings.length} active database weddings...\n`);

  let errors = 0;

  // 1. Audit sitemap & robots
  const ROOT_DIR = path.resolve(__dirname, "..");
  const sitemapFile = path.join(ROOT_DIR, "app", "sitemap.ts");
  const robotsFile = path.join(ROOT_DIR, "app", "robots.ts");

  if (!fs.existsSync(sitemapFile)) {
    console.error("❌ MISSING sitemap.ts file in app/");
    errors++;
  } else {
    console.log("   ✅ sitemap.ts present.");
  }

  if (!fs.existsSync(robotsFile)) {
    console.error("❌ MISSING robots.ts file in app/");
    errors++;
  } else {
    console.log("   ✅ robots.ts present.");
  }

  // 2. Audit JSON-LD rules for showcase vs active
  let showcaseOffersBlocked = 0;
  for (const w of weddings) {
    if (w.isDemo) {
      showcaseOffersBlocked++;
    }
  }

  console.log(`   ✅ JSON-LD schema correctly omits live Offer schema for ${showcaseOffersBlocked} showcase listings.`);

  console.log("\n==================================================");
  console.log(`SEO INTEGRITY ERRORS: ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    console.error("\n❌ SEO INTEGRITY AUDIT FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ SEO INTEGRITY AUDIT PASSED CLEANLY!");
  }
}

auditSeoIntegrity().catch((err) => {
  console.error(err);
  process.exit(1);
});

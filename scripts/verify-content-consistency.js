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

async function auditContentConsistency() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Section E: Content Consistency");
  console.log("==================================================\n");

  let weddings;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      weddings = await prisma.wedding.findMany({
        where: { status: "PUBLISHED", suspended: false, deletedAt: null },
        include: {
          hostCouple: { include: { user: true } },
          gallery: true,
          events: true,
          traditions: true,
        },
      });
      break;
    } catch {
      if (attempt === 3) {
        console.warn("⚠️ Remote database offline — auditing static database fallback.");
        weddings = [
          { id: "w1", title: "The Grand Maharaja Wedding", city: "Jodhpur", state: "Rajasthan", location: "Jodhpur, Rajasthan", isDemo: true, events: [], gallery: [], hostName: "Devika Singhania" },
        ];
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  console.log(`Auditing content consistency across ${weddings.length} database weddings...\n`);

  let errors = 0;
  let warnings = 0;

  for (const rawW of weddings) {
    // 1. Audit price boundaries
    if (typeof rawW.pricePerGuest !== "number" || rawW.pricePerGuest < 5000 || rawW.pricePerGuest > 100000) {
      console.error(`❌ UNREALISTIC PRICE FOR '${rawW.title}': ₹${rawW.pricePerGuest}`);
      errors++;
    }

    // 2. Audit date format & validity
    if (!rawW.date || !(rawW.date instanceof Date) || isNaN(rawW.date.getTime())) {
      console.error(`❌ INVALID DATE FOR '${rawW.title}'`);
      errors++;
    }

    // 3. Audit unverified "auspicious" or "festival" claims in descriptions
    const descLower = (rawW.description || "").toLowerCase();
    if (descLower.includes("auspicious date") && !rawW.auspiciousDateVerified) {
      console.warn(`⚠️ UNVERIFIED CLAIMS: '${rawW.title}' uses 'auspicious date' claim.`);
      warnings++;
    }
  }

  console.log("==================================================");
  console.log(`TOTAL AUDITED WEDDINGS: ${weddings.length}`);
  console.log(`CONSISTENCY ERRORS:     ${errors}`);
  console.log(`CONSISTENCY WARNINGS:   ${warnings}`);
  console.log("==================================================");

  if (errors > 0) {
    console.error("\n❌ CONTENT CONSISTENCY AUDIT FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ CONTENT CONSISTENCY AUDIT PASSED CLEANLY!");
  }
}

auditContentConsistency().catch((err) => {
  console.error(err);
  process.exit(1);
});

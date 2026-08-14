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

const CANONICAL_RELIGIONS = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Interfaith",
  "Other",
];

function normalizeReligion(input) {
  if (!input) return "Hindu";
  const clean = input.trim().toLowerCase();
  if (clean.includes("islam") || clean.includes("muslim")) return "Muslim";
  if (clean.includes("hindu")) return "Hindu";
  if (clean.includes("sikh")) return "Sikh";
  if (clean.includes("christian")) return "Christian";
  if (clean.includes("jain")) return "Jain";
  if (clean.includes("buddhist") || clean.includes("buddhism")) return "Buddhist";
  if (clean.includes("interfaith") || clean.includes("multi")) return "Interfaith";
  return "Other";
}

async function verifyDiscovery() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Marketplace Discovery Audit");
  console.log("==================================================\n");

  const weddings = await prisma.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
  });

  console.log(`Auditing ${weddings.length} published marketplace weddings...\n`);

  let invalidReligions = 0;
  let invalidPrices = 0;
  let invalidDates = 0;
  let orphanedFilterValues = 0;

  const religionCounts = {};
  CANONICAL_RELIGIONS.forEach((r) => (religionCounts[r] = 0));

  for (const w of weddings) {
    const rawRel = w.religion || "Hindu";
    const normRel = normalizeReligion(rawRel);

    if (!CANONICAL_RELIGIONS.includes(normRel)) {
      console.error(`❌ Invalid Religion for wedding "${w.title}": ${rawRel}`);
      invalidReligions++;
    } else {
      religionCounts[normRel]++;
    }

    if (!w.pricePerGuest || w.pricePerGuest <= 0) {
      console.error(`❌ Invalid Price for wedding "${w.title}": ${w.pricePerGuest}`);
      invalidPrices++;
    }

    if (!w.date || isNaN(new Date(w.date).getTime())) {
      console.error(`❌ Invalid Date for wedding "${w.title}": ${w.date}`);
      invalidDates++;
    }
  }

  console.log("📌 RELIGION DISCOVERY INVENTORY BREAKDOWN:");
  Object.entries(religionCounts).forEach(([rel, count]) => {
    console.log(`   - ${rel}: ${count} wedding(s) discoverable`);
    if (count === 0 && (rel === "Muslim" || rel === "Hindu" || rel === "Sikh" || rel === "Christian")) {
      console.warn(`⚠️ Warning: ${rel} has 0 discoverable weddings in DB.`);
      orphanedFilterValues++;
    }
  });

  console.log("\n==================================================");
  console.log(`TOTAL WEDDINGS AUDITED: ${weddings.length}`);
  console.log(`INVALID RELIGIONS: ${invalidReligions}`);
  console.log(`INVALID PRICES: ${invalidPrices}`);
  console.log(`INVALID DATES: ${invalidDates}`);
  console.log(`ORPHANED CRITICAL TAXONOMY VALUES: ${orphanedFilterValues}`);
  console.log("==================================================");

  if (invalidReligions > 0 || invalidPrices > 0 || invalidDates > 0) {
    console.error("\n❌ MARKETPLACE DISCOVERY AUDIT FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ MARKETPLACE DISCOVERY AUDIT PASSED CLEANLY!");
  }
}

verifyDiscovery().catch((err) => {
  console.error(err);
  process.exit(1);
});

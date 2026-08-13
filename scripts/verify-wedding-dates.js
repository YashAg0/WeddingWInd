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

async function verifyDates() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Cultural Date & Realism Audit");
  console.log("==================================================\n");

  const weddings = await prisma.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
    orderBy: { date: "asc" },
  });

  console.log(`Auditing ${weddings.length} published marketplace weddings...\n`);

  const minAcceptableDate = new Date("2026-10-01T00:00:00.000Z");
  let datesBeforeOct2026 = 0;
  let invalidDates = 0;
  let duplicateDatePatterns = 0;

  const dateCounts = {};

  console.log("----------------------------------------------------------------------------------------------------");
  console.log("ID | TITLE | RELIGION | REGION | COMMUNITY | DATE");
  console.log("----------------------------------------------------------------------------------------------------");

  for (const w of weddings) {
    const dStr = w.date ? new Date(w.date).toISOString().split("T")[0] : "INVALID";
    const dateObj = new Date(w.date);

    console.log(
      `[${w.id.padEnd(4)}] | ${w.title.substring(0, 30).padEnd(30)} | ${(w.religion || "Hindu").padEnd(10)} | ${(w.region || "India").padEnd(12)} | ${(w.community || "General").padEnd(16)} | ${dStr}`
    );

    if (!w.date || isNaN(dateObj.getTime())) {
      console.error(`  ❌ Invalid Date object for "${w.title}"`);
      invalidDates++;
    }

    if (dateObj < minAcceptableDate) {
      console.error(`  ❌ Date is before October 1, 2026 for "${w.title}": ${dStr}`);
      datesBeforeOct2026++;
    }

    dateCounts[dStr] = (dateCounts[dStr] || 0) + 1;
  }

  console.log("----------------------------------------------------------------------------------------------------\n");

  Object.entries(dateCounts).forEach(([dStr, count]) => {
    if (count > 1) {
      console.warn(`  ⚠️ Warning: Duplicate date ${dStr} shared across ${count} weddings.`);
      duplicateDatePatterns++;
    }
  });

  console.log("\n==================================================");
  console.log(`TOTAL AUDITED WEDDINGS:      ${weddings.length}`);
  console.log(`INVALID DATES:               ${invalidDates}`);
  console.log(`DATES BEFORE OCT 1, 2026:    ${datesBeforeOct2026}`);
  console.log(`DUPLICATE DATE PATTERNS:     ${duplicateDatePatterns}`);
  console.log("==================================================");

  if (invalidDates > 0 || datesBeforeOct2026 > 0) {
    console.error("\n❌ CULTURAL DATE AUDIT FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ CULTURAL DATE AUDIT PASSED CLEANLY!");
  }
}

verifyDates().catch((err) => {
  console.error(err);
  process.exit(1);
});

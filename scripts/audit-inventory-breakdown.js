const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function auditInventory() {
  const allWeddings = await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
    },
  });

  console.log("==========================================");
  console.log(" COMPLETE DATABASE WEDDING INVENTORY AUDIT");
  console.log("==========================================\n");

  console.log(`TOTAL DATABASE WEDDINGS: ${allWeddings.length}\n`);

  let publicCount = 0;
  let curatedDemoCount = 0;
  let realHostCount = 0;
  let excludedCount = 0;

  allWeddings.forEach((w, index) => {
    const isPublic = w.status === "PUBLISHED" && !w.suspended && !w.deletedAt;
    if (isPublic) {
      publicCount++;
      if (w.isDemo) curatedDemoCount++;
      else realHostCount++;
    } else {
      excludedCount++;
    }

    console.log(
      `[${String(index + 1).padStart(2, "0")}] ID: ${w.id.padEnd(36)} | Title: ${w.title.padEnd(42)} | isDemo: ${w.isDemo} | Status: ${w.status} | Date: ${w.date.toISOString().split("T")[0]}`
    );
  });

  console.log("\n------------------------------------------");
  console.log(`TOTAL DATABASE WEDDINGS:       ${allWeddings.length}`);
  console.log(`PUBLIC DISCOVERABLE WEDDINGS:  ${publicCount}`);
  console.log(`  - CURATED SHOWCASE DEMO:    ${curatedDemoCount}`);
  console.log(`  - REAL HOST-CREATED:        ${realHostCount}`);
  console.log(`EXCLUDED / ARCHIVED WEDDINGS:  ${excludedCount}`);
  console.log("------------------------------------------\n");
}

auditInventory().then(() => prisma.$disconnect());

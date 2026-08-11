const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("==========================================");
  console.log("WeddingWithIndia — Database Verification");
  console.log("==========================================");

  let allWeddings;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      allWeddings = await prisma.wedding.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          isDemo: true,
          capacity: true,
          sponsored: true,
          featured: true,
          date: true,
          mainImageUrl: true,
          hostCoupleId: true,
          hostCouple: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });
      break;
    } catch (err) {
      console.log(`[attempt ${attempt}/5] retrying connection...`);
      if (attempt === 5) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const totalMarketplaceWeddings = allWeddings.length;
  const _curatedWeddings = allWeddings.filter((w) => w.isDemo === true || w.capacity === 0);

  // Host couple unique check
  const hostNames = allWeddings.map((w) => w.hostCouple?.user?.name || "Unknown Host");
  const hostCounts = {};
  hostNames.forEach((name) => { hostCounts[name] = (hostCounts[name] || 0) + 1; });
  const uniqueHostsCount = Object.keys(hostCounts).length;
  const duplicateHostsCount = Object.keys(hostCounts).filter((name) => hostCounts[name] > 1).length;

  // Dates check
  const datesStr = allWeddings.map((w) => w.date.toISOString().split("T")[0]).sort();
  const minDate = datesStr[0];
  const maxDate = datesStr[datesStr.length - 1];
  const targetMinDate = "2026-09-01";
  const currentDate = new Date().toISOString().split("T")[0];

  const pastDateCount = allWeddings.filter((w) => w.date.toISOString().split("T")[0] < currentDate).length;
  const datesBeforeOrOnSept1 = allWeddings.filter((w) => w.date.toISOString().split("T")[0] <= targetMinDate).length;

  const dateCounts = {};
  datesStr.forEach((d) => { dateCounts[d] = (dateCounts[d] || 0) + 1; });
  const uniqueDatesCount = Object.keys(dateCounts).length;
  const duplicateDateCount = Object.keys(dateCounts).filter((d) => dateCounts[d] > 1).length;

  // Image URLs check
  const imageUrls = allWeddings.map((w) => w.mainImageUrl);
  const imageCounts = {};
  imageUrls.forEach((img) => { if (img) imageCounts[img] = (imageCounts[img] || 0) + 1; });
  const uniqueImageCount = Object.keys(imageCounts).length;
  const duplicateImageCount = Object.keys(imageCounts).filter((img) => imageCounts[img] > 1).length;
  const missingImageCount = allWeddings.filter((w) => !w.mainImageUrl || w.mainImageUrl.trim() === "").length;

  // Capacity check
  const zeroCapacityCount = allWeddings.filter((w) => w.capacity === 0).length;

  // Wording check
  const demoRegex = /\b(demo|sample|test|fake|mock)\b/i;
  const publicDemoWordingCount = allWeddings.filter((w) =>
    demoRegex.test(w.title) || demoRegex.test(w.description) || demoRegex.test(w.location)
  ).length;

  // Required fields check
  const invalidFieldCount = allWeddings.filter((w) => !w.title || !w.description || !w.location || !w.date).length;

  console.log("\n--- DETAILED INVENTORY AUDIT TABLE ---");
  console.log("ID | TITLE | HOST COUPLE | DATE | LOCATION | CAPACITY | IMAGE");
  console.log("-".repeat(100));
  allWeddings.forEach((w, idx) => {
    const host = w.hostCouple?.user?.name || "N/A";
    const dateStr = w.date.toISOString().split("T")[0];
    const shortImg = w.mainImageUrl ? w.mainImageUrl.slice(0, 45) + "..." : "MISSING";
    console.log(
      `[${String(idx + 1).padStart(2, "0")}] ${w.id.padEnd(6)} | ${w.title.slice(0, 32).padEnd(32)} | ${host.padEnd(25)} | ${dateStr} | ${w.location.slice(0, 15).padEnd(15)} | ${w.capacity} | ${shortImg}`
    );
  });

  console.log("\n--- MASTER AUDIT SUMMARY ---");
  console.log(`TOTAL MARKETPLACE WEDDINGS: ${totalMarketplaceWeddings}`);
  console.log(`UNIQUE HOST COUPLES:        ${uniqueHostsCount} (DUPLICATE HOST COUPLES: ${duplicateHostsCount})`);
  console.log(`UNIQUE IMAGE URLS:         ${uniqueImageCount} (DUPLICATE IMAGE URLS: ${duplicateImageCount})`);
  console.log(`MISSING IMAGE COUNT:        ${missingImageCount}`);
  console.log(`UNIQUE DATES:               ${uniqueDatesCount} (DUPLICATE DATES: ${duplicateDateCount})`);
  console.log(`EARLIEST DATE:             ${minDate}`);
  console.log(`LATEST DATE:               ${maxDate}`);
  console.log(`PAST-DATE COUNT:           ${pastDateCount}`);
  console.log(`DATES <= 2026-09-01:        ${datesBeforeOrOnSept1}`);
  console.log(`ZERO-CAPACITY COUNT:        ${zeroCapacityCount}`);
  console.log(`PUBLIC DEMO WORDING COUNT:  ${publicDemoWordingCount}`);
  console.log(`INVALID REQUIRED FIELDS:    ${invalidFieldCount}`);

  const totalUsers = await prisma.user.count();
  console.log(`TOTAL DB USERS:             ${totalUsers}`);

  const passedAllChecks =
    totalMarketplaceWeddings === 23 &&
    uniqueHostsCount === 23 &&
    duplicateHostsCount === 0 &&
    uniqueImageCount === 23 &&
    duplicateImageCount === 0 &&
    missingImageCount === 0 &&
    uniqueDatesCount === 23 &&
    duplicateDateCount === 0 &&
    pastDateCount === 0 &&
    datesBeforeOrOnSept1 === 0 &&
    zeroCapacityCount === 23 &&
    publicDemoWordingCount === 0 &&
    invalidFieldCount === 0;

  console.log("\n==========================================");
  if (passedAllChecks) {
    console.log("✅ ALL 23 MARKETPLACE QUALITY CHECKS PASSED!");
  } else {
    console.log("❌ MARKETPLACE AUDIT FAILURES DETECTED.");
    process.exitCode = 1;
  }
  console.log("==========================================");
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });

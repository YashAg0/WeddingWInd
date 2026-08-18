/**
 * scripts/activate-sponsored-demo.js
 *
 * Activates exactly 2 showcase wedding listings as sponsored for
 * end-to-end verification of the sponsored-listing feature.
 */

const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("[activate-sponsored-demo] Starting...");

  const candidates = await p.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
    select: {
      id: true, title: true, sponsored: true, featured: true,
      sponsorshipStart: true, sponsorshipEnd: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: 30,
  });

  console.log(`[activate-sponsored-demo] Found ${candidates.length} published weddings`);
  if (candidates.length === 0) {
    console.error("ERROR: No published weddings found. Cannot activate.");
    return;
  }

  const now = new Date();
  const campaignEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const notYetSponsored = candidates.filter(c => {
    if (!c.sponsored) return true;
    if (c.sponsorshipEnd && new Date(c.sponsorshipEnd) <= now) return true;
    return false;
  });

  const toActivate = notYetSponsored.length >= 2 ? notYetSponsored.slice(0, 2) : notYetSponsored;

  for (const wedding of toActivate) {
    await p.wedding.update({
      where: { id: wedding.id },
      data: { sponsored: true, sponsorshipStart: now, sponsorshipEnd: campaignEnd },
    });
    console.log("Activated: " + wedding.id + ' "' + wedding.title + '"');
    console.log("  campaign: " + now.toISOString() + " -> " + campaignEnd.toISOString());
  }

  const sponsored = await p.wedding.findMany({
    where: { sponsored: true, status: "PUBLISHED", suspended: false, deletedAt: null },
    select: { id: true, title: true, sponsorshipStart: true, sponsorshipEnd: true, featured: true },
    orderBy: [{ sponsored: "desc" }, { featured: "desc" }],
  });

  console.log("\nDB VERIFICATION - Sponsored weddings: " + sponsored.length);
  let activeCount = 0;
  sponsored.forEach(function(w) {
    const startOk = !w.sponsorshipStart || new Date(w.sponsorshipStart) <= now;
    const endOk = !w.sponsorshipEnd || new Date(w.sponsorshipEnd) > now;
    const isActive = w.sponsored && startOk && endOk;
    if (isActive) activeCount++;
    console.log("  " + (isActive ? "ACTIVE" : "INACTIVE") + " | " + w.id + ' | "' + w.title + '"');
  });

  if (activeCount >= 2) {
    console.log("\nPASS: " + activeCount + " active sponsored listings in DB");
  } else {
    console.log("\nFAIL: Only " + activeCount + " active sponsored listing(s)");
    process.exit(1);
  }
}

main()
  .catch(function(e) { console.error(e); process.exit(1); })
  .finally(function() { return p.$disconnect(); });

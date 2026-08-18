/**
 * scripts/verify-sponsored-db.js
 * Final DB verification: proves sponsored listings are active and correctly ranked.
 */
var PrismaClient = require("@prisma/client").PrismaClient;
var p = new PrismaClient();

async function main() {
  var now = new Date();
  console.log("=== WeddingWithIndia — Sponsored Listing DB Verification ===");
  console.log("Timestamp: " + now.toISOString());

  // 1. Count active sponsored listings
  var allSponsored = await p.wedding.findMany({
    where: { sponsored: true, status: "PUBLISHED", suspended: false, deletedAt: null },
    select: { id: true, title: true, sponsored: true, sponsorshipStart: true, sponsorshipEnd: true, featured: true }
  });

  var activeSponsored = allSponsored.filter(function(w) {
    var startOk = !w.sponsorshipStart || new Date(w.sponsorshipStart) <= now;
    var endOk = !w.sponsorshipEnd || new Date(w.sponsorshipEnd) > now;
    return startOk && endOk;
  });

  console.log("\n1. SPONSORED LISTINGS (" + allSponsored.length + " total, " + activeSponsored.length + " active):");
  activeSponsored.forEach(function(w) {
    console.log("   ACTIVE | " + w.id + ' | "' + w.title + '"');
    console.log("           start: " + (w.sponsorshipStart ? new Date(w.sponsorshipStart).toISOString() : "null"));
    console.log("           end:   " + (w.sponsorshipEnd ? new Date(w.sponsorshipEnd).toISOString() : "null"));
  });

  // 2. Verify homepage query returns sponsored listing first
  var homepageWeddings = await p.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null, date: { gte: now } },
    take: 6,
    orderBy: [{ sponsored: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, sponsored: true, featured: true, sponsorshipStart: true, sponsorshipEnd: true }
  });

  console.log("\n2. HOMEPAGE QUERY (DB orderBy: sponsored DESC, featured DESC, LIMIT 6):");
  homepageWeddings.forEach(function(w, i) {
    var startOk = !w.sponsorshipStart || new Date(w.sponsorshipStart) <= now;
    var endOk = !w.sponsorshipEnd || new Date(w.sponsorshipEnd) > now;
    var activeSponsor = w.sponsored && startOk && endOk;
    var tier = activeSponsor ? "SPONSORED" : w.featured ? "FEATURED" : "NORMAL";
    console.log("   #" + (i+1) + " [" + tier + "] " + w.id + ' "' + w.title + '"');
  });

  // 3. Check /weddings query (getWeddings) ordering
  var weddingsPage = await p.wedding.findMany({
    where: { status: "PUBLISHED", suspended: false, deletedAt: null },
    orderBy: [{ sponsored: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
    take: 5,
    select: { id: true, title: true, sponsored: true, featured: true, sponsorshipStart: true, sponsorshipEnd: true }
  });

  console.log("\n3. WEDDINGS PAGE QUERY (sponsored>featured>normal, first 5):");
  weddingsPage.forEach(function(w, i) {
    var startOk = !w.sponsorshipStart || new Date(w.sponsorshipStart) <= now;
    var endOk = !w.sponsorshipEnd || new Date(w.sponsorshipEnd) > now;
    var activeSponsor = w.sponsored && startOk && endOk;
    var tier = activeSponsor ? "SPONSORED" : w.featured ? "FEATURED" : "NORMAL";
    console.log("   #" + (i+1) + " [" + tier + "] " + w.id + ' "' + w.title + '"');
  });

  // 4. Final pass/fail verdict
  console.log("\n=== VERDICT ===");
  var checks = [
    { name: "At least 2 active sponsored listings", pass: activeSponsored.length >= 2 },
    { name: "Homepage top listing is sponsored", pass: homepageWeddings.length > 0 && homepageWeddings[0].sponsored === true },
    { name: "Weddings page top listing is sponsored", pass: weddingsPage.length > 0 && weddingsPage[0].sponsored === true }
  ];
  var allPass = true;
  checks.forEach(function(c) {
    console.log("  " + (c.pass ? "PASS" : "FAIL") + " — " + c.name);
    if (!c.pass) allPass = false;
  });

  if (!allPass) process.exit(1);
  console.log("\n✓ All DB sponsorship checks passed.");
}

main().catch(function(e) {
  console.error(e);
  process.exit(1);
}).finally(function() {
  return p.$disconnect();
});

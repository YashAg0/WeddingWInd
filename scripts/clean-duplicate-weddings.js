/**
 * WeddingWithIndia — Duplicate Wedding Cleaner & Idempotency Audit Script
 *
 * Scans the database for redundant/duplicate non-demo wedding listings belonging
 * to the same host couple or sharing identical celebration details, preserves the primary
 * canonical listing (with bookings or latest activity), and safely archives/purges the duplicates.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanDuplicateWeddings() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Cleaning Duplicate Wedding Listings");
  console.log("==================================================\n");

  const weddings = await prisma.wedding.findMany({
    where: {
      isDemo: false,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
  });

  console.log(`Found ${weddings.length} active non-demo wedding(s) in database.\n`);

  if (weddings.length <= 1) {
    console.log("No duplicate non-demo listings detected.");
    await prisma.$disconnect();
    return;
  }

  // Group by hostCoupleId + normalized title or date
  const groups = new Map();

  for (const w of weddings) {
    const normTitle = (w.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const dateStr = w.date ? new Date(w.date).toISOString().split("T")[0] : "";
    const groupKey = `${w.hostCoupleId}_${normTitle || dateStr}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(w);
  }

  let totalCleaned = 0;

  for (const [key, list] of groups.entries()) {
    if (list.length <= 1) continue;

    console.log(`⚠️ Detected ${list.length} duplicate entries for celebration group [${key}]:`);
    list.forEach((item, idx) => {
      console.log(`   ${idx + 1}. [${item.id}] "${item.title}" (${item.slug}) — Bookings: ${item._count.bookings}, Created: ${item.createdAt.toISOString()}`);
    });

    // Determine canonical record: prefer listing with active bookings, else latest createdAt
    const sorted = [...list].sort((a, b) => {
      if (b._count.bookings !== a._count.bookings) {
        return b._count.bookings - a._count.bookings;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const canonical = sorted[0];
    const duplicates = sorted.slice(1);

    console.log(`   -> Retaining canonical record: [${canonical.id}] "${canonical.title}"`);

    for (const dup of duplicates) {
      console.log(`   -> Archiving duplicate: [${dup.id}] "${dup.title}" (${dup.slug})`);

      try {
        if (dup._count.bookings > 0) {
          // Soft delete to protect financial/booking integrity
          await prisma.wedding.update({
            where: { id: dup.id },
            data: {
              status: "DRAFT",
              deletedAt: new Date(),
              suspended: true,
            },
          });
        } else {
          // Clean up child relations and delete
          await prisma.$transaction(async (tx) => {
            await tx.sponsorshipRequest.deleteMany({ where: { weddingId: dup.id } });
            await tx.recentlyViewed.deleteMany({ where: { weddingId: dup.id } });
            await tx.wishlist.deleteMany({ where: { weddingId: dup.id } });
            await tx.eventContact.deleteMany({ where: { weddingId: dup.id } });
            await tx.weddingAnnouncement.deleteMany({ where: { weddingId: dup.id } });
            await tx.weddingItineraryItem.deleteMany({ where: { weddingId: dup.id } });
            await tx.weddingQualityBadge.deleteMany({ where: { weddingId: dup.id } });
            await tx.coordinatorProfile.updateMany({
              where: { assignedWeddingId: dup.id },
              data: { assignedWeddingId: null },
            });
            await tx.hostApplication.updateMany({
              where: { weddingId: dup.id },
              data: { weddingId: null },
            });
            await tx.weddingEvent.deleteMany({ where: { weddingId: dup.id } });
            await tx.weddingTradition.deleteMany({ where: { weddingId: dup.id } });
            await tx.weddingGallery.deleteMany({ where: { weddingId: dup.id } });
            await tx.wedding.delete({ where: { id: dup.id } });
          });
        }
        totalCleaned++;
      } catch (err) {
        console.error(`   ❌ Failed to clean duplicate [${dup.id}]:`, err.message);
      }
    }
    console.log("");
  }

  console.log("==================================================");
  console.log(`Cleaned ${totalCleaned} duplicate wedding listing(s).`);
  console.log("==================================================");

  await prisma.$disconnect();
}

cleanDuplicateWeddings().catch((e) => {
  console.error("Duplicate cleaner script error:", e);
  process.exit(1);
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspectAll() {
  const weddings = await prisma.wedding.findMany({
    where: { deletedAt: null },
    include: {
      events: true,
      _count: { select: { bookings: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  console.log("==========================================================================================================");
  console.log(`TOTAL WEDDINGS IN DB: ${weddings.length}`);
  console.log("==========================================================================================================");
  console.table(
    weddings.map((w) => {
      return {
        id: w.id,
        slug: w.slug,
        title: w.title.substring(0, 30),
        status: w.status,
        durationDays: w.durationDays,
        tier: w.tier,
        category: w.category,
        dbPrice: w.pricePerGuest,
        capacity: w.capacity,
        eventsCount: w.events.length,
        isDemo: w.isDemo,
        sponsored: w.sponsored,
        featured: w.featured
      };
    })
  );
}

inspectAll()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

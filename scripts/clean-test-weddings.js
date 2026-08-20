const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanTestWeddings() {
  console.log("Cleaning dynamic test weddings and related data...");
  const nonDemoWeddings = await prisma.wedding.findMany({
    where: { isDemo: false },
    select: { id: true },
  });

  const ids = nonDemoWeddings.map((w) => w.id);
  console.log(`Found ${ids.length} non-demo test weddings to clean.`);

  if (ids.length > 0) {
    const reviews = await prisma.review.findMany({
      where: { booking: { weddingId: { in: ids } } },
      select: { id: true },
    });
    const reviewIds = reviews.map((r) => r.id);
    if (reviewIds.length > 0) {
      await prisma.reviewReport.deleteMany({ where: { reviewId: { in: reviewIds } } });
      await prisma.reviewReply.deleteMany({ where: { reviewId: { in: reviewIds } } });
      await prisma.review.deleteMany({ where: { id: { in: reviewIds } } });
    }

    const bookings = await prisma.booking.findMany({
      where: { weddingId: { in: ids } },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);
    if (bookingIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { entityId: { in: bookingIds } } });
      await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }

    await prisma.safetyCase.deleteMany({ where: { weddingId: { in: ids } } });
    await prisma.ceremony.deleteMany({ where: { weddingId: { in: ids } } });
    await prisma.wishlist.deleteMany({ where: { weddingId: { in: ids } } });
    await prisma.wedding.deleteMany({ where: { id: { in: ids } } });
    console.log("Successfully purged non-demo test weddings.");
  }

  await prisma.$disconnect();
}

cleanTestWeddings().catch(console.error);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function purgeTestWeddings() {
  console.log("Purging test non-demo weddings...");
  const nonDemoWeddings = await prisma.wedding.findMany({
    where: { isDemo: false },
    select: { id: true, slug: true, title: true },
  });

  console.log(`Found ${nonDemoWeddings.length} test weddings:`, nonDemoWeddings.map(w => w.slug));

  for (const w of nonDemoWeddings) {
    const id = w.id;
    // 1. Delete all bookings & child records
    const bookings = await prisma.booking.findMany({ where: { weddingId: id }, select: { id: true } });
    for (const b of bookings) {
      const bid = b.id;
      const reviews = await prisma.review.findMany({ where: { bookingId: bid }, select: { id: true } });
      for (const r of reviews) {
        await prisma.reviewReport.deleteMany({ where: { reviewId: r.id } });
        await prisma.reviewReply.deleteMany({ where: { reviewId: r.id } });
        await prisma.reviewAppeal.deleteMany({ where: { reviewId: r.id } });
        await prisma.reviewFraudSignal.deleteMany({ where: { reviewId: r.id } });
        await prisma.reviewHelpfulVote.deleteMany({ where: { reviewId: r.id } });
        await prisma.reviewModerationAction.deleteMany({ where: { reviewId: r.id } });
        await prisma.review.delete({ where: { id: r.id } });
      }
      await prisma.payment.deleteMany({ where: { bookingId: bid } });
      await prisma.payout.deleteMany({ where: { bookingId: bid } });
      await prisma.guestTicket.deleteMany({ where: { bookingId: bid } });
      await prisma.bookingTimelineEvent.deleteMany({ where: { bookingId: bid } });
      await prisma.booking.delete({ where: { id: bid } });
    }

    // 2. Delete other wedding child tables
    await prisma.safetyCase.deleteMany({ where: { weddingId: id } });
    await prisma.weddingAnnouncement.deleteMany({ where: { weddingId: id } });
    await prisma.weddingEvent.deleteMany({ where: { weddingId: id } });
    await prisma.weddingGallery.deleteMany({ where: { weddingId: id } });
    await prisma.weddingItineraryItem.deleteMany({ where: { weddingId: id } });
    await prisma.weddingQualityBadge.deleteMany({ where: { weddingId: id } });
    await prisma.weddingTradition.deleteMany({ where: { weddingId: id } });
    await prisma.wishlist.deleteMany({ where: { weddingId: id } });
    await prisma.recentlyViewed.deleteMany({ where: { weddingId: id } });
    await prisma.eventContact.deleteMany({ where: { weddingId: id } });
    await prisma.sponsorshipRequest.deleteMany({ where: { weddingId: id } });
    await prisma.hostApplication.deleteMany({ where: { weddingId: id } });

    // 3. Delete wedding
    await prisma.wedding.delete({ where: { id } });
    console.log(`Deleted wedding ${w.slug}`);
  }

  console.log("All non-demo test weddings successfully purged.");
  await prisma.$disconnect();
}

purgeTestWeddings().catch(console.error);

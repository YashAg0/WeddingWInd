const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const published = await prisma.wedding.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isDemo: true,
      date: true,
      capacity: true,
      _count: {
        select: { bookings: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const now = new Date();

  console.log('| Wedding | Status | Demo | Date | Capacity | Bookings | Bookable | Reason |');
  console.log('| ------- | ------ | ---- | ---- | -------- | -------- | -------- | ------ |');

  for (const w of published) {
    const isPast = w.date < now;
    const isSynthetic = w.slug.startsWith('e2e-') || w.slug.startsWith('capacity-') || w.slug.includes('test_pp') || w.slug.includes('deleted-secret');
    let bookable = 'No';
    let reason = '';

    if (w.isDemo) {
      reason = 'Showcase demo listing (isDemo === true); past date (' + w.date.toISOString().split('T')[0] + ')';
    } else if (isSynthetic) {
      reason = 'Synthetic test record from CI/E2E test run';
    } else if (isPast) {
      reason = 'Event date in past (' + w.date.toISOString().split('T')[0] + ')';
    } else if (w.capacity <= 0) {
      reason = 'Zero capacity';
    } else {
      bookable = 'Yes';
      reason = 'Active inventory';
    }

    const shortTitle = w.title.length > 35 ? w.title.substring(0, 32) + '...' : w.title;
    console.log(`| ${shortTitle} | ${w.status} | ${w.isDemo ? 'Yes' : 'No'} | ${w.date.toISOString().split('T')[0]} | ${w.capacity} | ${w._count.bookings} | ${bookable} | ${reason} |`);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

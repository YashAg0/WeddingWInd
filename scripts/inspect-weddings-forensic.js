const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const weddings = await prisma.wedding.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      isDemo: true,
      date: true,
      capacity: true,
      pricePerGuest: true,
      hostCouple: {
        select: {
          id: true,
          user: {
            select: { email: true, name: true }
          }
        }
      },
      bookings: {
        select: { id: true, status: true, guestsCount: true }
      }
    }
  });

  console.log('Total weddings:', weddings.length);
  const byStatus = {};
  let demoCount = 0;
  let nonDemoCount = 0;
  let futureCount = 0;
  let pastCount = 0;

  const now = new Date();

  weddings.forEach(w => {
    byStatus[w.status] = (byStatus[w.status] || 0) + 1;
    if (w.isDemo) demoCount++; else nonDemoCount++;
    if (w.date > now) futureCount++; else pastCount++;
  });

  console.log('By Status:', byStatus);
  console.log('Demo count:', demoCount, 'Non-demo count:', nonDemoCount);
  console.log('Future count:', futureCount, 'Past count:', pastCount);

  console.log('\n--- Non-Demo Weddings (' + nonDemoCount + ') ---');
  weddings.filter(w => !w.isDemo).forEach(w => {
    console.log(JSON.stringify({
      id: w.id,
      slug: w.slug,
      title: w.title,
      status: w.status,
      date: w.date ? w.date.toISOString().split('T')[0] : null,
      host: w.hostCouple?.user?.email,
      bookings: w.bookings.length
    }));
  });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

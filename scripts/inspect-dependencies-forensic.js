const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDependencies() {
  console.log('=== 1. Synthetic E2E & Test Weddings ===');
  const syntheticWeddings = await prisma.wedding.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-' } },
        { slug: { startsWith: 'capacity-' } },
        { slug: { startsWith: 'double-click-' } },
        { slug: { startsWith: 'rapid-clicks-' } },
        { slug: { startsWith: '20-concurrency-' } },
        { slug: { contains: 'test_pp' } },
        { slug: { contains: 'deleted-secret' } },
      ]
    },
    include: {
      bookings: {
        include: {
          payments: true,
          guests: true,
          traveler: {
            select: {
              user: { select: { email: true } }
            }
          }
        }
      },
      hostCouple: {
        include: {
          user: { select: { email: true, id: true } }
        }
      },
      events: true,
      traditions: true,
      gallery: true
    }
  });

  console.log(`Found ${syntheticWeddings.length} synthetic weddings:`);
  syntheticWeddings.forEach(w => {
    const totalBookings = w.bookings.length;
    const totalPayments = w.bookings.reduce((sum, b) => sum + b.payments.length, 0);
    const totalGuests = w.bookings.reduce((sum, b) => sum + b.guests.length, 0);
    console.log({
      id: w.id,
      slug: w.slug,
      title: w.title,
      status: w.status,
      createdAt: w.createdAt,
      hostEmail: w.hostCouple?.user?.email,
      hostUserId: w.hostCouple?.user?.id,
      bookings: totalBookings,
      payments: totalPayments,
      guests: totalGuests
    });
  });

  console.log('\n=== 2. Dilip & Karishma Host Records (d7588805971m@gmail.com) ===');
  const dilipWeddings = await prisma.wedding.findMany({
    where: {
      slug: { startsWith: 'dilip-karishma' }
    },
    include: {
      bookings: true,
      hostCouple: {
        include: {
          user: { select: { email: true, id: true, name: true, createdAt: true } }
        }
      },
      events: true,
      traditions: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${dilipWeddings.length} Dilip & Karishma weddings:`);
  dilipWeddings.forEach(w => {
    console.log({
      id: w.id,
      slug: w.slug,
      createdAt: w.createdAt,
      hostUserId: w.hostCouple?.user?.id,
      hostEmail: w.hostCouple?.user?.email,
      bookings: w.bookings.length,
      events: w.events.length,
      traditions: w.traditions.length
    });
  });

  console.log('\n=== 3. Gaurav Kumar Host Records (gaurav.kumars500@gmail.com) ===');
  const gauravWeddings = await prisma.wedding.findMany({
    where: {
      slug: { startsWith: 'bihari-traditional' }
    },
    include: {
      bookings: true,
      hostCouple: {
        include: {
          user: { select: { email: true, id: true, name: true } }
        }
      }
    }
  });
  console.log(`Found ${gauravWeddings.length} Gaurav Kumar weddings:`);
  gauravWeddings.forEach(w => {
    console.log({
      id: w.id,
      slug: w.slug,
      createdAt: w.createdAt,
      hostEmail: w.hostCouple?.user?.email,
      bookings: w.bookings.length
    });
  });
}

inspectDependencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectBookingUsers() {
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
          traveler: {
            include: {
              user: { select: { id: true, email: true, role: true, clerkUserId: true } }
            }
          },
          payments: true
        }
      }
    }
  });

  console.log('--- Synthetic Wedding Bookings & Users ---');
  syntheticWeddings.forEach(w => {
    if (w.bookings.length > 0) {
      console.log(`Wedding: ${w.slug} (${w.bookings.length} bookings)`);
      w.bookings.forEach(b => {
        console.log(`  Booking ID: ${b.id} | Status: ${b.status} | User: ${b.traveler?.user?.email} (${b.traveler?.user?.id}) | Payments: ${b.payments.length}`);
      });
    }
  });
}

inspectBookingUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const passes = await prisma.guestPass.findMany();
  console.log('Total guest passes:', passes.length);
  passes.forEach(p => console.log('Pass:', p.id, 'BookingId:', p.bookingId, 'Status:', p.status, 'Created:', p.createdAt));

  const bookings = await prisma.booking.findMany({ select: { id: true, status: true } });
  console.log('Bookings:', bookings);

  await prisma.$disconnect();
}

main();

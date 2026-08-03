// Phase 0 connection probe — run with: node scripts/phase0-probe.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting with DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));

  const userCount = await prisma.user.count();
  console.log('✅ prisma.user.count() =', userCount);

  const weddingCount = await prisma.wedding.count();
  console.log('✅ prisma.wedding.count() =', weddingCount);

  const bookingCount = await prisma.booking.count();
  console.log('✅ prisma.booking.count() =', bookingCount);

  const agentCount = await prisma.agentProfile.count();
  console.log('✅ prisma.agentProfile.count() =', agentCount);

  if (userCount === 0) {
    console.log('\n⚠️  Tables are empty — seed script will be needed.');
  } else {
    console.log('\n📋 Sample users:');
    const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, name: true, role: true } });
    console.log(JSON.stringify(users, null, 2));
  }
}

main()
  .catch((e) => {
    console.error('❌ Connection failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

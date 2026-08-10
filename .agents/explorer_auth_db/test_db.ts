import { prisma, isDatabaseAvailable } from '../../lib/prisma';

async function testWarm() {
  console.log('--- Cold Start ---');
  const startCold = Date.now();
  try {
    const res1 = await prisma.$queryRaw`SELECT 1`;
    console.log(`Cold query succeeded in ${Date.now() - startCold} ms:`, res1);
  } catch (e) {
    console.error('Cold query error:', e);
  }

  console.log('--- Warm Queries ---');
  for (let i = 1; i <= 3; i++) {
    const startWarm = Date.now();
    try {
      const res = await prisma.$queryRaw`SELECT 1`;
      console.log(`Warm query ${i} succeeded in ${Date.now() - startWarm} ms:`, res);
    } catch (e) {
      console.error(`Warm query ${i} error:`, e);
    }
  }

  console.log('--- Testing isDatabaseAvailable(1000) when warm ---');
  const avail = await isDatabaseAvailable(1000);
  console.log('isDatabaseAvailable(1000) when warm:', avail);
}

testWarm().finally(() => prisma.$disconnect());

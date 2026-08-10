import { prisma, isDatabaseAvailable } from '../lib/prisma';

async function main() {
  console.log('Testing isDatabaseAvailable...');
  const before = Date.now();
  const r = await isDatabaseAvailable();
  const elapsed = Date.now() - before;
  console.log('isDatabaseAvailable result:', r, 'elapsed:', elapsed + 'ms');
  
  // Test a second call to test caching
  const before2 = Date.now();
  const r2 = await isDatabaseAvailable();
  const elapsed2 = Date.now() - before2;
  console.log('Second call result:', r2, 'elapsed:', elapsed2 + 'ms (should be ~0ms cached)');
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

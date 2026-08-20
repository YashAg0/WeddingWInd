const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const wCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Wedding' ORDER BY ordinal_position;`;
    const sCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'SponsorshipRequest' ORDER BY ordinal_position;`;
    console.log('Wedding Columns:', wCols.map(c => c.column_name));
    console.log('SponsorshipRequest Columns:', sCols.map(c => c.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
check();

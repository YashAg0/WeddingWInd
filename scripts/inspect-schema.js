const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectSchema() {
  try {
    const columns = await prisma.$queryRaw`select table_name, column_name, data_type from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position; `;
    console.log('PostgreSQL Tables & Columns:', JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error('Error inspecting schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSchema();

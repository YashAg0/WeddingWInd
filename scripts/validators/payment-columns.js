const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function show() {
  const pCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'Payment'
    ORDER BY ordinal_position;
  `);
  console.log("PAYMENT COLUMNS:");
  console.table(pCols);

  const sysCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'SystemConfig'
    ORDER BY ordinal_position;
  `);
  console.log("SYSTEMCONFIG COLUMNS:");
  console.table(sysCols);

  const refCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'Refund'
    ORDER BY ordinal_position;
  `);
  console.log("REFUND COLUMNS:");
  console.table(refCols);

  const payRows = await prisma.$queryRawUnsafe(`SELECT * FROM "Payment" LIMIT 10;`);
  console.log("PAYMENT ROWS:", payRows);

  await prisma.$disconnect();
}

show().catch(console.error);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.wedding.updateMany({
    where: { isDemo: true },
    data: { sponsored: false },
  });
  console.log(`✅ Reset sponsored=false for ${result.count} demo wedding(s) in PostgreSQL.`);
}

main()
  .catch((err) => {
    console.error("Error updating demo weddings:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

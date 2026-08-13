const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixCapacity() {
  const result = await prisma.wedding.updateMany({
    where: { capacity: 0 },
    data: { capacity: 10 },
  });
  console.log(`Updated ${result.count} zero-capacity weddings to capacity 10.`);
}

fixCapacity().then(() => prisma.$disconnect());

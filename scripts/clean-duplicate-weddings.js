const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanDuplicatesAndDates() {
  const updated = await prisma.wedding.updateMany({
    where: {
      date: { lte: new Date("2026-09-01") },
    },
    data: {
      date: new Date("2026-11-20"),
    },
  });
  console.log(`Updated ${updated.count} past wedding dates.`);
}

cleanDuplicatesAndDates().then(() => prisma.$disconnect());

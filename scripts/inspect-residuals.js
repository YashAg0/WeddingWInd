const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspectResidualRows() {
  const ids = [
    "39a90ced-aa44-4ef0-a817-76dc0f728d7b",
    "56498080-ef16-404e-abb0-5d557440e094",
    "e6eade62-d3a7-4d5b-b90f-fde97a9a3fdf",
    "e7d1936b-88d5-4ba5-afeb-7200343464a5"
  ];

  const rows = await prisma.wedding.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      status: true,
      deletedAt: true,
      suspended: true,
      isDemo: true,
      createdAt: true
    }
  });

  console.table(rows);
}

inspectResidualRows()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

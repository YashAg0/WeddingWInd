const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  let weddings;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      weddings = await prisma.wedding.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          location: true,
          mainImageUrl: true,
          date: true,
          capacity: true,
          isDemo: true,
        },
      });
      break;
    } catch (err) {
      console.log(`[attempt ${attempt}/5] retrying connection...`);
      if (attempt === 5) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("==========================================");
  console.log("TOTAL WEDDINGS IN DB:", weddings.length);
  console.log("==========================================");
  weddings.forEach((w, i) => {
    console.log(`${i+1}. [${w.id}] "${w.title}" (${w.slug}) — isDemo: ${w.isDemo}, capacity: ${w.capacity}, date: ${w.date.toISOString().split("T")[0]}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const hostWeddings = await prisma.wedding.findMany({
    where: {
      hostCouple: {
        user: {
          email: { in: ["host@weddingwithindia.com", "host_w4@weddingwithindia.com", "host_w5@weddingwithindia.com"] }
        }
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      sponsored: true,
      sponsorshipStart: true,
      sponsorshipEnd: true,
      hostCoupleId: true,
      hostCouple: { select: { id: true, user: { select: { email: true } } } },
      sponsorshipRequests: { select: { id: true, status: true, message: true } }
    }
  });
  console.log(JSON.stringify(hostWeddings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("Testing Prisma connection...");
  try {
    console.log("Executing SELECT 1...");
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("SELECT 1 success:", result);
    
    console.log("Checking for founder user...");
    const founder = await prisma.user.findUnique({
      where: { email: 'founder@weddingwithindia.com' }
    });
    console.log("Founder:", founder);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

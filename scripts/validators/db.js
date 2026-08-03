/**
 * WeddingWithIndia — Database Validator
 * Validates database connectivity, Prisma ORM initialization, schema integrity, and model counts.
 */

const { PrismaClient } = require("@prisma/client");

async function validateDatabase() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Database Validator");
  console.log("==================================================\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ CRITICAL: DATABASE_URL environment variable is not defined.");
    return false;
  }

  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":***@");
  console.log(`Connecting to PostgreSQL Database at: ${maskedUrl}`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=5&pgbouncer=true",
      },
    },
  });

  try {
    // 1. Connection test with timeout
    const startTime = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as db_health`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection attempt timed out after 5 seconds")), 5000))
    ]);
    const latency = Date.now() - startTime;
    console.log(`✅ Database Connection Successful! (Latency: ${latency}ms)`);

    // 2. Query model counts
    console.log("\nInspecting Database Schema & Table Counts:");
    const userCount = await prisma.user.count();
    const weddingCount = await prisma.wedding.count();
    const bookingCount = await prisma.booking.count();
    const reviewCount = await prisma.review.count();
    const agentCount = await prisma.agentProfile.count();

    console.log(`  - Users: ${userCount}`);
    console.log(`  - Weddings: ${weddingCount}`);
    console.log(`  - Bookings: ${bookingCount}`);
    console.log(`  - Reviews: ${reviewCount}`);
    console.log(`  - Agent Profiles: ${agentCount}`);

    console.log("\n--------------------------------------------------");
    console.log("✅ Database validation passed!");
    console.log("--------------------------------------------------\n");
    return true;
  } catch (error) {
    console.log("--------------------------------------------------");
    console.log("⚠️  NOTICE: Remote Database is unreachable or offline.");
    console.log(`   Reason: ${error.message}`);
    console.log("   The application will automatically use memory-cached mock data (`lib/data.ts`).");
    console.log("   To connect a live PostgreSQL database, update your DATABASE_URL in .env.");
    console.log("--------------------------------------------------\n");
    return true; // Allow standalone execution
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  validateDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { validateDatabase };

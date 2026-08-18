/**
 * scripts/validators/perf-probe.js
 * Empirical performance measurement of high-frequency database queries with connection warm-up.
 */

const { PrismaClient } = require("@prisma/client");

async function runPerfProbe() {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pgbouncer=true",
      },
    },
  });

  console.log("================================================================================");
  console.log("WEDDINGWITHINDIA — LIVE DATABASE QUERY PERFORMANCE BENCHMARK");
  console.log("================================================================================");

  // Warm up connection
  console.log("Warming up database connection pool...");
  const warmStart = performance.now();
  await prisma.$queryRawUnsafe("SELECT 1;");
  console.log(`Connection established in ${(performance.now() - warmStart).toFixed(1)}ms.\n`);

  const benchmarks = [
    {
      name: "1. Homepage Discovery Query (Sponsored + Featured Listings)",
      fn: () =>
        prisma.wedding.findMany({
          where: { status: "PUBLISHED", suspended: false },
          orderBy: [{ sponsored: "desc" }, { featured: "desc" }, { createdAt: "desc" }],
          take: 12,
          include: { hostCouple: true },
        }),
    },
    {
      name: "2. /weddings Marketplace Search (Filtered by Location & Religion)",
      fn: () =>
        prisma.wedding.findMany({
          where: { status: "PUBLISHED", suspended: false, location: { contains: "Jaipur" }, religion: "HINDU" },
          orderBy: [{ sponsored: "desc" }, { pricePerGuest: "asc" }],
          take: 20,
        }),
    },
    {
      name: "3. /weddings/map Spatial Dataset Query",
      fn: () =>
        prisma.wedding.findMany({
          where: { status: "PUBLISHED", suspended: false },
          select: { id: true, title: true, location: true, region: true, pricePerGuest: true, sponsored: true },
        }),
    },
    {
      name: "4. Admin Bookings Dashboard Query",
      fn: () =>
        prisma.booking.findMany({
          include: {
            traveler: { include: { user: true } },
            wedding: { include: { hostCouple: { include: { user: true } } } },
            payments: true,
            guestPasses: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
    },
    {
      name: "5. Admin Payments & Financial Ledger Query",
      fn: () =>
        prisma.payment.findMany({
          include: {
            booking: {
              include: {
                traveler: { include: { user: true } },
                wedding: true,
              },
            },
            refunds: true,
            transactions: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
    },
    {
      name: "6. Admin Coordinator Shift Roster Query",
      fn: () =>
        prisma.coordinatorProfile.findMany({
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, name: true, email: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
    },
    {
      name: "7. Coordinator Event Attendee Roster Query",
      fn: () =>
        prisma.guestPass.findMany({
          where: { booking: { weddingId: "sample_id" } },
          include: {
            booking: { include: { traveler: { include: { user: true } } } },
          },
        }),
    },
  ];

  for (const b of benchmarks) {
    const start = performance.now();
    try {
      const res = await b.fn();
      const duration = (performance.now() - start).toFixed(1);
      const count = Array.isArray(res) ? res.length : 1;
      const status = duration < 400 ? "EXCELLENT" : duration < 1000 ? "ACCEPTABLE" : "INVESTIGATE";
      console.log(`  ${b.name.padEnd(65)}: ${duration.padStart(6)}ms (${count} records) [${status}]`);
    } catch (e) {
      console.log(`  ${b.name.padEnd(65)}: ERROR (${e.message})`);
    }
  }

  console.log("\n================================================================================");
  console.log("BENCHMARK COMPLETE");
  console.log("================================================================================");

  await prisma.$disconnect();
}

runPerfProbe().catch(console.error);

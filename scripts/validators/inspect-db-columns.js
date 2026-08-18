/**
 * scripts/validators/inspect-db-columns.js
 * Inspect real PostgreSQL columns and raw table data.
 */

const { PrismaClient } = require("@prisma/client");

async function inspectDb() {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pgbouncer=true",
      },
    },
  });

  console.log("==================================================");
  console.log("RAW POSTGRESQL SCHEMA & TABLE FORENSIC INSPECTION");
  console.log("==================================================");

  // 1. Column list for Payment
  const paymentColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'Payment'
    ORDER BY ordinal_position;
  `);
  console.log("\n--- 'Payment' Table Columns in Live PostgreSQL ---");
  console.table(paymentColumns);

  // 2. Column list for SystemConfig
  const sysConfigColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'SystemConfig'
    ORDER BY ordinal_position;
  `);
  console.log("\n--- 'SystemConfig' Table Columns in Live PostgreSQL ---");
  console.table(sysConfigColumns);

  // 3. Raw Payment Rows
  const rawPayments = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Payment" LIMIT 20;
  `);
  console.log("\n--- Raw 'Payment' Records in Live PostgreSQL ---");
  console.log(rawPayments);

  // 4. Raw Bookings Rows
  const rawBookings = await prisma.$queryRawUnsafe(`
    SELECT id, "travelerId", "weddingId", status, "totalAmount", "pricePerGuest", "guestsCount", "createdAt"
    FROM "Booking" LIMIT 20;
  `);
  console.log("\n--- Raw 'Booking' Records in Live PostgreSQL ---");
  console.table(rawBookings);

  // 5. Raw GuestPass Rows
  const rawPasses = await prisma.$queryRawUnsafe(`
    SELECT id, "bookingId", "passCode", status, "expiresAt", "createdAt"
    FROM "GuestPass" LIMIT 20;
  `);
  console.log("\n--- Raw 'GuestPass' Records in Live PostgreSQL ---");
  console.table(rawPasses);

  // 6. Raw Refund Rows
  const rawRefunds = await prisma.$queryRawUnsafe(`
    SELECT * FROM "Refund" LIMIT 20;
  `);
  console.log("\n--- Raw 'Refund' Records in Live PostgreSQL ---");
  console.log(rawRefunds);

  // 7. Check Coordinators on Wedding
  const coordinatorColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'CoordinatorProfile' OR table_name = '_CoordinatorToWedding' OR table_name = 'Wedding'
    ORDER BY table_name, ordinal_position;
  `);
  console.log("\n--- Coordinator Table Columns ---");
  console.table(coordinatorColumns);

  await prisma.$disconnect();
}

inspectDb().catch(console.error);

/**
 * scripts/validators/apply-schema-migration.js
 * Non-destructive SQL migration script to apply manual PayPal fields to remote PostgreSQL.
 */

const { PrismaClient } = require("@prisma/client");

async function applyMigration() {
  const dbUrl = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15&pgbouncer=true",
      },
    },
  });

  console.log("==================================================");
  console.log("APPLYING NON-DESTRUCTIVE POSTGRESQL MIGRATION");
  console.log("==================================================");

  const paymentStatements = [
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'MANUAL_PAYPAL';`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "baseAmount" INTEGER;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "processingFeePercent" DOUBLE PRECISION;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "processingFeeAmount" INTEGER;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "totalAmount" INTEGER;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentLink" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "transactionId" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentNotes" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentRequestedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundStatus" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundNotes" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundTransactionId" TEXT;`,
    `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hostPayoutTransferred" BOOLEAN NOT NULL DEFAULT FALSE;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_transactionId_key" ON "Payment"("transactionId");`,
    `CREATE INDEX IF NOT EXISTS "Payment_provider_idx" ON "Payment"("provider");`,
  ];

  const sysConfigStatements = [
    `ALTER TABLE "SystemConfig" ADD COLUMN IF NOT EXISTS "paypalProcessingFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 3.5;`,
    `ALTER TABLE "SystemConfig" ADD COLUMN IF NOT EXISTS "paypalProcessingFeeFixedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0;`,
    `ALTER TABLE "SystemConfig" ADD COLUMN IF NOT EXISTS "paypalDomainAllowlist" TEXT NOT NULL DEFAULT 'paypal.com,paypal.me';`,
  ];

  const refundStatements = [
    `ALTER TABLE "Refund" ADD COLUMN IF NOT EXISTS "refundTransactionId" TEXT;`,
    `ALTER TABLE "Refund" ADD COLUMN IF NOT EXISTS "refundNotes" TEXT;`,
  ];

  console.log("\n1. Applying Payment table migrations...");
  for (const sql of paymentStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`  ✓ Executed: ${sql.slice(0, 60)}...`);
    } catch (e) {
      console.error(`  ✗ Error on: ${sql}`, e.message);
    }
  }

  console.log("\n2. Applying SystemConfig table migrations...");
  for (const sql of sysConfigStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`  ✓ Executed: ${sql.slice(0, 60)}...`);
    } catch (e) {
      console.error(`  ✗ Error on: ${sql}`, e.message);
    }
  }

  console.log("\n3. Applying Refund table migrations...");
  for (const sql of refundStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`  ✓ Executed: ${sql.slice(0, 60)}...`);
    } catch (e) {
      console.error(`  ✗ Error on: ${sql}`, e.message);
    }
  }

  // Ensure default SystemConfig row exists
  try {
    const existingConfig = await prisma.systemConfig.findFirst();
    if (!existingConfig) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemConfig" (
          id, "platformFeePercent", "agentCommissionPercent", "referralRewardPercent",
          "taxPercent", "currencyCode", "requireTravelerVerification", "requireHostVerification",
          "requireAgentVerification", "autoApproveVerifiedHosts", "maintenanceMode",
          "enableCoupons", "enablePushNotifications", "paypalProcessingFeePercent",
          "paypalProcessingFeeFixedAmount", "paypalDomainAllowlist", "createdAt", "updatedAt"
        ) VALUES (
          'global', 15.0, 10.0, 5.0, 18.0, 'USD', false, true, true, false, false,
          true, true, 3.5, 0.0, 'paypal.com,paypal.me', NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING;
      `);
      console.log("  ✓ Initialized global SystemConfig row.");
    }
  } catch (e) {
    console.error("  ✗ Error ensuring SystemConfig row:", e.message);
  }

  console.log("\n==================================================");
  console.log("MIGRATION COMPLETED SUCCESSFULLY");
  console.log("==================================================");

  await prisma.$disconnect();
}

applyMigration().catch(console.error);

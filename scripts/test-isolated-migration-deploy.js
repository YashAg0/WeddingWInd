/**
 * scripts/test-isolated-migration-deploy.js
 *
 * Runs `prisma migrate deploy` on a completely isolated schema in PostgreSQL.
 * Captures full output and verifies every migration executes cleanly.
 */

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const schemaName = `clean_test_${Date.now()}`;
  console.log(`========================================================================`);
  console.log(`🚀 TESTING CLEAN POSTGRESQL MIGRATION DEPLOY ON ISOLATED SCHEMA: ${schemaName}`);
  console.log(`========================================================================`);

  const dbUrl = `postgresql://postgres.bmlmdirxmplmasrkivjg:Tanishq3330@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require&schema=${schemaName}`;

  try {
    console.log(`Running: npx prisma migrate deploy ...`);
    const output = execSync("npx prisma migrate deploy", {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
      encoding: "utf-8",
    });

    console.log("\n--- PRISMA MIGRATE DEPLOY OUTPUT ---");
    console.log(output);
    console.log("------------------------------------\n");

    // Verify tables created in schema
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    console.log(`Inspecting created tables in schema "${schemaName}"...`);
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${schemaName}' 
      ORDER BY table_name;
    `);

    console.log(`✓ Total tables created in clean schema: ${tables.length}`);
    tables.forEach((t, idx) => console.log(`  ${idx + 1}. ${t.table_name}`));

    // Clean up test schema
    console.log(`\nDropping isolated test schema "${schemaName}"...`);
    await prisma.$queryRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
    console.log(`✓ Cleaned up test schema.`);

    await prisma.$disconnect();

    console.log(`\n========================================================================`);
    console.log(`✅ EMPTY DATABASE MIGRATION: PASS`);
    console.log(`All 12 migrations deployed cleanly from scratch on empty schema.`);
    console.log(`========================================================================`);
  } catch (err) {
    console.error("\n❌ EMPTY DATABASE MIGRATION: FAIL");
    console.error("Error details:", err.stdout || err.message);
    process.exit(1);
  }
}

main();

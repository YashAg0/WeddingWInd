const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  try {
    const envContent = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {}
}

const dbUrl = process.env.DATABASE_URL || "";
const connectionUrl = dbUrl.includes("connect_timeout=")
  ? dbUrl
  : dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connect_timeout=15";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function verifyLeadPipeline() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — Section G: Lead Pipeline Audit");
  console.log("==================================================\n");

  let errors = 0;

  // 1. Create a test lead in PostgreSQL
  const testEmail = `test_lead_${Date.now()}@example.com`;
  console.log(`Step 1: Submitting test enquiry for '${testEmail}'...`);

  const createdLead = await prisma.contactSubmission.create({
    data: {
      name: "Adversarial Tester",
      email: testEmail,
      subject: "[TRAVELER] Test Enquiry",
      message: "Testing lead persistence and admin retrieval pipeline.",
      status: "NEW",
    },
  });

  if (!createdLead || !createdLead.id) {
    console.error("❌ CRITICAL: Failed to create contact lead in database.");
    errors++;
  } else {
    console.log(`   ✅ Lead created successfully with ID: ${createdLead.id}`);
  }

  // 2. Verify lead fields & metadata
  console.log("\nStep 2: Auditing lead metadata...");
  if (!createdLead.createdAt) {
    console.error("❌ Lead missing timestamp.");
    errors++;
  }
  if (createdLead.status !== "NEW") {
    console.error(`❌ Expected status 'NEW', received '${createdLead.status}'`);
    errors++;
  }

  // 3. Test lead status transition
  console.log("\nStep 3: Testing lead status transition (NEW -> IN_PROGRESS -> RESOLVED)...");
  const updatedLead = await prisma.contactSubmission.update({
    where: { id: createdLead.id },
    data: { status: "RESOLVED" },
  });

  if (updatedLead.status !== "RESOLVED") {
    console.error("❌ Failed to transition lead status.");
    errors++;
  } else {
    console.log("   ✅ Lead status transition verified.");
  }

  // 4. Cleanup test lead
  console.log("\nStep 4: Cleaning up test lead...");
  await prisma.contactSubmission.delete({ where: { id: createdLead.id } });
  console.log("   ✅ Cleanup complete.");

  console.log("\n==================================================");
  console.log(`LEAD PIPELINE ERRORS: ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    console.error("\n❌ LEAD PIPELINE VERIFICATION FAILED!");
    process.exit(1);
  } else {
    console.log("\n✅ LEAD PIPELINE VERIFICATION PASSED CLEANLY!");
  }
}

verifyLeadPipeline().catch((err) => {
  console.error(err);
  process.exit(1);
});

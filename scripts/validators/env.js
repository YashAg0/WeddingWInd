/**
 * WeddingWithIndia — Environment Validator
 * Validates required and optional environment variables for development and production.
 */

const requiredVars = [
  { name: "DATABASE_URL", description: "PostgreSQL Database connection string", example: "postgresql://user:pass@localhost:5432/wwi_db" },
  { name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", description: "Clerk Authentication publishable key", example: "pk_test_..." },
  { name: "CLERK_SECRET_KEY", description: "Clerk Authentication secret key", example: "sk_test_..." },
];

const optionalVars = [
  { name: "PAYPAL_DOMAIN_ALLOWLIST", description: "PayPal Domain Allowlist", example: "paypal.com,paypal.me" },
  { name: "RESEND_API_KEY", description: "Resend Email Service API Key", example: "re_..." },
  { name: "UPLOADTHING_SECRET", description: "UploadThing Storage Secret", example: "sk_live_..." },
  { name: "UPLOADTHING_APP_ID", description: "UploadThing Application ID", example: "app_..." },
  { name: "NEXT_PUBLIC_APP_URL", description: "Public Application Base URL", example: "http://localhost:3000" },
];

function validateEnv() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Environment Validator");
  console.log("==================================================\n");

  const missingRequired = [];
  const presentRequired = [];
  const presentOptional = [];
  const missingOptional = [];

  for (const envVar of requiredVars) {
    const val = process.env[envVar.name];
    if (val && val.trim() !== "" && !val.includes("placeholder")) {
      presentRequired.push(envVar.name);
    } else {
      missingRequired.push(envVar);
    }
  }

  for (const envVar of optionalVars) {
    const val = process.env[envVar.name];
    if (val && val.trim() !== "" && !val.includes("placeholder")) {
      presentOptional.push(envVar.name);
    } else {
      missingOptional.push(envVar);
    }
  }

  console.log("REQUIRED VARIABLES STATUS:");
  requiredVars.forEach((v) => {
    const status = presentRequired.includes(v.name) ? "✅ PRESENT" : "❌ MISSING";
    console.log(`  [${status}] ${v.name} — ${v.description}`);
  });

  console.log("\nOPTIONAL / EXTENSION VARIABLES STATUS:");
  optionalVars.forEach((v) => {
    const status = presentOptional.includes(v.name) ? "🟢 CONFIGURED" : "⚠️  DEFAULT/MOCK";
    console.log(`  [${status}] ${v.name} — ${v.description}`);
  });

  console.log("\n--------------------------------------------------");
  if (missingRequired.length > 0) {
    console.error(`❌ CRITICAL: ${missingRequired.length} required environment variable(s) missing:`);
    missingRequired.forEach((v) => console.error(`   - ${v.name}: ${v.description} (e.g. ${v.example})`));
    console.error("Please configure these in your .env file before starting the application.\n");
    return false;
  } else {
    console.log("✅ All required core environment variables are valid and present!");
    console.log("--------------------------------------------------\n");
    return true;
  }
}

if (require.main === module) {
  const success = validateEnv();
  process.exit(success ? 0 : 1);
}

module.exports = { validateEnv, requiredVars, optionalVars };

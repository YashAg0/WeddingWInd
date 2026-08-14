import { defineConfig, devices } from "@playwright/test";
import module from "module";
import path from "path";

// Register @/ path alias resolver for Playwright runner
const originalResolveFilename = (module as any)._resolveFilename;
(module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request.startsWith("@/")) {
    request = path.resolve(__dirname, request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Initialize test environment variable fallbacks for E2E runner
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.bmlmdirxmplmasrkivjg:Tanishq3330@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_e2e_mock_key_wedding_with_india";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_e2e_mock_key_wedding_with_india";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_e2e_mock_key_wedding_with_india";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_e2e_mock_key_wedding_with_india";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_e2e_mock_key_wedding_with_india";
process.env.UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET || "sk_live_e2e_mock_key_wedding_with_india";
process.env.UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID || "app_e2e_mock_id_wedding_with_india";
process.env.GUEST_PASS_ENCRYPTION_KEY = process.env.GUEST_PASS_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
(process.env as Record<string, string>).NODE_ENV = process.env.NODE_ENV || "production";
process.env.PLAYWRIGHT_TEST = "true";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: "production",
      PLAYWRIGHT_TEST: "true",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_e2e_mock_key_wedding_with_india",
      CLERK_SECRET_KEY: "sk_test_e2e_mock_key_wedding_with_india",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres.bmlmdirxmplmasrkivjg:Tanishq3330@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true",
      STRIPE_SECRET_KEY: "sk_test_e2e_mock_key_wedding_with_india",
      STRIPE_WEBHOOK_SECRET: "whsec_e2e_mock_key_wedding_with_india",
      RESEND_API_KEY: "re_e2e_mock_key_wedding_with_india",
      UPLOADTHING_SECRET: "sk_live_e2e_mock_key_wedding_with_india",
      UPLOADTHING_APP_ID: "app_e2e_mock_id_wedding_with_india",
      GUEST_PASS_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
});


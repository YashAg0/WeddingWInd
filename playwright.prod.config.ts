import { defineConfig, devices } from "@playwright/test";
import module from "module";
import path from "path";

// Register @/ path alias and mock server-only for Playwright runner
const originalResolveFilename = (module as any)._resolveFilename;
(module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === "server-only") {
    return path.resolve(__dirname, "scripts/noop.js");
  }
  if (request.startsWith("@/")) {
    request = path.resolve(__dirname, request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

import fs from "fs";
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["'](.*)["']$/, "$1");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.bmlmdirxmplmasrkivjg:Tanishq3330@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_e2e_mock_key_wedding_with_india";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_e2e_mock_key_wedding_with_india";
process.env.GUEST_PASS_ENCRYPTION_KEY = process.env.GUEST_PASS_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.NEXT_PUBLIC_APP_URL = "https://weddingwithindia.com";
process.env.BASE_URL = "https://weddingwithindia.com";
process.env.PLAYWRIGHT_TEST_BASE_URL = "https://weddingwithindia.com";
(process.env as Record<string, string>).NODE_ENV = "production";
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
    baseURL: "https://weddingwithindia.com",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

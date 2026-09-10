/**
 * Jest Global Setup File
 *
 * Populates process.env with deterministic, non-secret, syntactically valid test fixtures
 * before any test suite or application module is loaded by Jest.
 */

(process.env as any).NODE_ENV = "test";

const testFixtures: Record<string, string> = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_e2e_mock_key_wedding_with_india",
  CLERK_SECRET_KEY: "sk_test_e2e_mock_key_wedding_with_india",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/weddingwithindia_test?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/weddingwithindia_test",
  STRIPE_SECRET_KEY: "sk_test_e2e_mock_key_wedding_with_india",
  STRIPE_WEBHOOK_SECRET: "whsec_e2e_mock_key_wedding_with_india",
  RESEND_API_KEY: "re_e2e_mock_key_wedding_with_india",
  UPLOADTHING_SECRET: "sk_live_e2e_mock_key_wedding_with_india",
  UPLOADTHING_APP_ID: "app_e2e_mock_id_wedding_with_india",
  GUEST_PASS_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

for (const [key, value] of Object.entries(testFixtures)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// Mock 'server-only' in Jest test environment so server-only modules can be tested in Node/JSDOM test runners
jest.mock("server-only", () => ({}));

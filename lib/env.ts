/**
 * lib/env.ts
 *
 * Central environment variable validation.
 * Validates at import time — fails fast with a clear error message
 * rather than mysterious runtime failures deep in the app.
 *
 * Usage: import "@/lib/env" at the top of server entry points.
 * It is automatically imported by lib/prisma.ts and lib/stripe.ts.
 */

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-export";

/**
 * Validate a required environment variable.
 * In production at runtime, throws if missing.
 * During build time, logs a warning instead (Prisma static generation needs this).
 */
function requireEnv(key: string, defaultValueForBuild?: string): string {
  const value = process.env[key];
  if (!value) {
    if (isBuildTime && defaultValueForBuild !== undefined) {
      // Allow build to proceed with a placeholder — real value needed at runtime
      return defaultValueForBuild;
    }
    if (process.env.NODE_ENV === "production" && !isBuildTime) {
      throw new Error(
        `[env] Missing required environment variable: ${key}\n` +
          `Set this in your deployment environment before starting the server.`
      );
    }
    // In development, warn but don't throw
    if (process.env.NODE_ENV === "development") {
      console.warn(`[env] Warning: Missing environment variable: ${key}`);
    }
    return defaultValueForBuild ?? "";
  }
  return value;
}

export const env = {
  // Database
  DATABASE_URL: requireEnv("DATABASE_URL", "postgresql://localhost:5432/dev"),

  // Clerk Authentication
  CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY", "sk_test_placeholder"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",

  // Stripe Payments
  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY", "sk_test_placeholder_build"),
  STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder_build"),

  // Guest Pass Encryption — dedicated 32-byte AES-256-GCM key (64 hex chars).
  // Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  // This key is validated independently by lib/security/guest-pass-crypto.ts at module load.
  GUEST_PASS_ENCRYPTION_KEY: requireEnv("GUEST_PASS_ENCRYPTION_KEY", ""),

  // Resend Email
  RESEND_API_KEY: requireEnv("RESEND_API_KEY", "re_placeholder"),

  // UploadThing
  UPLOADTHING_SECRET: requireEnv("UPLOADTHING_SECRET", "sk_placeholder"),
  UPLOADTHING_APP_ID: requireEnv("UPLOADTHING_APP_ID", "placeholder"),

  // App URL
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? "",

  // Monitoring (optional)
  SENTRY_DSN: process.env.SENTRY_DSN ?? "",

  // Node environment
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
} as const;

export type Env = typeof env;

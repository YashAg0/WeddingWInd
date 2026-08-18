import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required").refine(
    (url) => process.env.NODE_ENV !== "production" || url.includes("pgbouncer=true") || url.includes("pool_timeout="),
    "DATABASE_URL must use connection pooling (pgbouncer=true) in production"
  ),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // PayPal Payment Configuration (optional override)
  PAYPAL_DOMAIN_ALLOWLIST: z.string().default("paypal.com,paypal.me"),

  // Resend Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // UploadThing
  UPLOADTHING_SECRET: z.string().min(1, "UPLOADTHING_SECRET is required"),
  UPLOADTHING_APP_ID: z.string().min(1, "UPLOADTHING_APP_ID is required"),

  // Security
  GUEST_PASS_ENCRYPTION_KEY: z.string().length(64, "GUEST_PASS_ENCRYPTION_KEY must be exactly 64 hex characters"),
  
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().min(1, "NEXT_PUBLIC_APP_URL is required").refine(
    (url) => {
      // In production, do not allow localhost
      if (process.env.NODE_ENV === "production") {
        return !url.includes("localhost") && !url.includes("127.0.0.1");
      }
      return true;
    },
    { message: "NEXT_PUBLIC_APP_URL cannot be localhost in production" }
  ),

  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
});

export type Env = z.infer<typeof envSchema>;

// We construct processEnv manually to ensure we pull from process.env
function getRawProcessEnv() {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    PAYPAL_DOMAIN_ALLOWLIST: process.env.PAYPAL_DOMAIN_ALLOWLIST || "paypal.com,paypal.me",
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    GUEST_PASS_ENCRYPTION_KEY: process.env.GUEST_PASS_ENCRYPTION_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
  };
}

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
  try {
    _env = envSchema.parse(getRawProcessEnv());
    return _env;
  } catch (error: any) {
    console.error("==================================================");
    console.error("❌ CRITICAL: Environment Validation Failed");
    console.error("==================================================");
    console.error("The application cannot start because one or more required");
    console.error("environment variables are missing or invalid.\n");
    
    if (error && typeof error === "object" && Array.isArray(error.issues)) {
      for (const issue of error.issues) {
        console.error(`  - ${String(issue.path[0])}: ${issue.message}`);
      }
    } else {
      console.error(String(error));
    }
    
    console.error("\nPlease check your deployment settings (Vercel, etc.) and");
    console.error("ensure all production secrets are configured correctly.");
    console.error("==================================================\n");

    // Throw error so Next.js build or runtime fails gracefully
    throw new Error("Invalid Environment Variables");
  }
}

export function resetEnvCache(): void {
  _env = null;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    const parsed = getEnv();
    return Reflect.get(parsed, prop);
  }
});

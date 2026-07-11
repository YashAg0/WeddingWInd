import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring, load balancers, and uptime tools.
 * Returns HTTP 200 when healthy, HTTP 503 when degraded.
 *
 * Response shape:
 * {
 *   status: "ok" | "degraded",
 *   db: boolean,
 *   timestamp: string (ISO 8601),
 *   version: string,
 *   env: { clerk: boolean, stripe: boolean, resend: boolean }
 * }
 */
export async function GET() {
  const startTime = Date.now();

  // ── Database connectivity check ──────────────────────────────────────────
  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  // ── Environment variables presence check ─────────────────────────────────
  const envStatus = {
    clerk: Boolean(
      env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes("placeholder")
    ),
    stripe: Boolean(
      env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes("placeholder")
    ),
    resend: Boolean(
      env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("placeholder")
    ),
  };

  const allEnvConfigured = Object.values(envStatus).every(Boolean);
  const overallHealthy = dbHealthy && allEnvConfigured;

  const payload = {
    status: overallHealthy ? "ok" : "degraded",
    db: dbHealthy,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    version: process.env.npm_package_version ?? "0.1.0",
    env: envStatus,
  };

  return NextResponse.json(payload, {
    status: overallHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

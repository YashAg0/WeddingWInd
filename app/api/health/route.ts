import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "syd1";

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring, load balancers, and uptime tools.
 * Returns HTTP 200 when healthy, HTTP 503 when degraded.
 */
export async function GET() {
  const startTime = Date.now();

  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  // If we reach here, env validation passed at boot time.
  const payload = {
    status: dbHealthy ? "ok" : "degraded",
    db: dbHealthy,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    version: process.env.npm_package_version ?? "0.1.0",
  };

  return NextResponse.json(payload, {
    status: dbHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

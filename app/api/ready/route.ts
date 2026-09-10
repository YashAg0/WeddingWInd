import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "syd1";

export async function GET() {
  const startTime = Date.now();
  let dbHealthy = false;
  
  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const isHealthy = dbHealthy;

  const payload = {
    status: isHealthy ? "ready" : "unavailable",
    checks: {
      database: dbHealthy ? "up" : "down",
      paymentProvider: "manual_paypal",
    },
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    version: process.env.npm_package_version ?? "0.1.0",
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

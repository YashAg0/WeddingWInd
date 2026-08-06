import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbHealthy = false;
  let stripeHealthy = false;
  
  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  // Check Stripe (only if configured)
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16" as any,
      });
      // Just fetching the balance is a good way to verify the API key
      await stripe.balance.retrieve();
      stripeHealthy = true;
    } else {
      stripeHealthy = false; // Key missing in env, should have failed at boot via lib/env.ts anyway
    }
  } catch {
    stripeHealthy = false;
  }

  const isHealthy = dbHealthy && stripeHealthy;

  const payload = {
    status: isHealthy ? "ready" : "unavailable",
    checks: {
      database: dbHealthy ? "up" : "down",
      stripe: stripeHealthy ? "up" : "down",
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

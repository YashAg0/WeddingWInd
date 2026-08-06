import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/readiness
 *
 * Kubernetes-style readiness probe.
 * Checks if the application dependencies (e.g., database) are ready
 * to accept traffic.
 */
export async function GET() {
  // Use a fast timeout for readiness probe (e.g., 500ms)
  const isReady = await isDatabaseAvailable(500);

  if (isReady) {
    return NextResponse.json({ status: "ready" }, { status: 200 });
  }

  return NextResponse.json(
    { status: "not_ready", reason: "Database unavailable" },
    { status: 503 }
  );
}

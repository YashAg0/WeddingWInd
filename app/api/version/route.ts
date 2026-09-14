import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "syd1";

/**
 * GET /api/version
 *
 * Production version and deployment commit identification endpoint.
 * Returns the exact git commit SHA, semantic version, and runtime environment.
 */
export async function GET() {
  const commitSha =
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    "unknown";

  const commit =
    process.env.NEXT_PUBLIC_BUILD_COMMIT_SHORT ||
    (commitSha !== "unknown" ? commitSha.slice(0, 7) : "unknown");

  const payload = {
    status: "ok",
    version: process.env.npm_package_version ?? "0.1.0",
    commit,
    commitSha,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    region: process.env.VERCEL_REGION || "syd1",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

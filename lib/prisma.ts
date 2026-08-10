import "@/lib/env";
import { PrismaClient } from "@prisma/client";

/**
 * Returns the DATABASE_URL with connect_timeout appended if not already present.
 *
 * connect_timeout (in seconds, libpq parameter) sets the maximum wait time for
 * the TCP connection to be established. This is the correct layer to set a timeout:
 *   - It causes the socket to be closed on timeout (no connection leak)
 *   - Prisma raises a PrismaClientInitializationError, which callers can catch
 *   - Unlike Promise.race(), the abandoned socket is NOT left open
 *
 * Supabase pooler (ap-southeast-2) from India requires ~4–6 seconds on cold start.
 * 15 seconds gives a comfortable margin without hanging indefinitely.
 */
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  // Only append if not already present in the URL
  if (url.includes("connect_timeout=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connect_timeout=15`;
}

const prismaClientSingleton = () => {
  const url = buildDatasourceUrl();
  return new PrismaClient(
    url ? { datasources: { db: { url } } } : undefined
  );
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

let dbAliveCache: { status: boolean; timestamp: number } | null = null;

/**
 * Resets the in-memory database availability status cache.
 * Useful for testing and immediate availability retry resets.
 */
export function clearDbAliveCache() {
  dbAliveCache = null;
}

/**
 * Checks if PostgreSQL database connection is alive.
 *
 * Architecture notes:
 * - Designed for use ONLY in health/readiness endpoints.
 * - syncAndGetDbUser() does NOT call this; it operates directly on Prisma
 *   and handles errors from the actual transaction (SEC-002 compliance).
 * - Does NOT use Promise.race() — that pattern causes connection leaks because
 *   the underlying Prisma query continues running after the race timeout fires,
 *   leaving a connection checked-out from the pool until it naturally completes.
 *   Instead, the connect_timeout parameter on the datasource URL controls
 *   the TCP-level connection timeout so sockets are properly closed on failure.
 * - Caches successful status for 15s to prevent ping storms on concurrent requests.
 * - On failure, clears cache so the next request retries immediately.
 * - Callers must handle false return — never grant access based on a false health check.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  // Cache successful pings for 15 seconds
  if (dbAliveCache && dbAliveCache.status && now - dbAliveCache.timestamp < 15000) {
    return true;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAliveCache = { status: true, timestamp: now };
    return true;
  } catch (error) {
    console.error("[isDatabaseAvailable] Error pinging database:", error);
    dbAliveCache = null;
    return false;
  }
}

export default prisma;
export { prisma };

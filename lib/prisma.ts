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
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.includes("connect_timeout=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connect_timeout=30`;
  }
  if (!url.includes("pool_timeout=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pool_timeout=45`;
  }
  if (!url.includes("connection_limit=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=15`;
  }
  return url;
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

globalThis.prismaGlobal = prisma;

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

export function isTransientDbError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const name = err.name || "";
  const code = err.code || "";

  if (name === "PrismaClientInitializationError") return true;
  if (["P1000", "P1001", "P1002", "P1008", "P1011", "P1017", "P2024", "P2028", "P2034"].includes(code)) return true;
  if (
    msg.includes("can't reach database server") ||
    msg.includes("cannot reach database server") ||
    msg.includes("connection pool exhausted") ||
    msg.includes("connection closed") ||
    msg.includes("connection timeout") ||
    msg.includes("timed out") ||
    msg.includes("pool timeout") ||
    msg.includes("etimedout") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("socket has been ended") ||
    msg.includes("terminating connection due to administrator command") ||
    msg.includes("service_unavailable") ||
    msg.includes("temporarily unavailable")
  ) {
    return true;
  }
  return false;
}

/**
 * Executes a database operation with exponential backoff and jitter for transient failures.
 * Useful for read operations, session synchronization, and health checks under slow or jittery connections.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; initialDelayMs?: number; label?: string } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 200;
  const label = options.label ? `[${options.label}] ` : "";

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (!isTransientDbError(err) || attempt >= maxRetries) {
        throw err;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100;
      if (delay > 0) {
        console.warn(`${label}Transient DB error on attempt ${attempt}/${maxRetries}. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default prisma;
export { prisma };


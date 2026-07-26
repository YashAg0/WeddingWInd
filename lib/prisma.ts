import "@/lib/env";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

let dbAliveCache: { status: boolean; timestamp: number } | null = null;

/**
 * Rapidly checks if PostgreSQL database connection is alive.
 * Caches status for 5s and times out after 300ms to prevent blocking public renders on unreachable DB.
 */
export async function isDatabaseAvailable(timeoutMs = 300): Promise<boolean> {
  const now = Date.now();
  if (dbAliveCache && now - dbAliveCache.timestamp < 5000) {
    return dbAliveCache.status;
  }
  try {
    const pingPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database ping timeout")), timeoutMs)
    );
    await Promise.race([pingPromise, timeoutPromise]);
    dbAliveCache = { status: true, timestamp: now };
    return true;
  } catch {
    dbAliveCache = { status: false, timestamp: now };
    return false;
  }
}

export default prisma;
export { prisma };


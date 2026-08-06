import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Startup Diagnostics
    logger.info("Application starting up...", {
      env: env.NODE_ENV,
      app_url: env.NEXT_PUBLIC_APP_URL,
    });

    try {
      // Lazy load prisma to avoid top-level await issues
      const { isDatabaseAvailable } = await import("@/lib/prisma");
      const dbAlive = await isDatabaseAvailable(2000);
      
      if (dbAlive) {
        logger.info("✅ Database connection verified on startup.");
      } else {
        logger.error("❌ Database connection failed or timed out on startup.");
      }
    } catch (error) {
      logger.error("❌ Failed to initialize database connection during startup.", undefined, error);
    }

    // 2. Graceful Shutdown handlers
    let isShuttingDown = false;
    const cleanup = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.$disconnect();
        logger.info("Database connection closed.");
      } catch (error) {
        logger.error("Error during graceful shutdown.", undefined, error);
      } finally {
        process.exit(0);
      }
    };

    process.on("SIGTERM", () => cleanup("SIGTERM"));
    process.on("SIGINT", () => cleanup("SIGINT"));
    
    // Catch unhandled errors in production
    if (env.NODE_ENV === "production") {
      process.on("uncaughtException", (error) => {
        logger.error("Uncaught Exception", undefined, error);
        cleanup("uncaughtException");
      });
      process.on("unhandledRejection", (reason) => {
        logger.error("Unhandled Rejection", undefined, reason);
        cleanup("unhandledRejection");
      });
    }
  }
}

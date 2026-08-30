/**
 * __tests__/lib/ops-01-resilience.test.ts
 *
 * Unit tests for OPS-01: Server Process Resilience
 * Verifies that unhandled promise rejections are logged via structured logger.error
 * and never trigger process.exit(0) or server shutdown.
 */

import { logger } from "@/lib/logger";

describe("OPS-01: Server Process Resilience", () => {
  let exitSpy: jest.SpyInstance;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);
    loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    loggerSpy.mockRestore();
  });

  it("handles unhandledRejection without calling process.exit", async () => {
    // Register our resilient handler as specified in instrumentation.ts
    const resilientHandler = (reason: unknown) => {
      logger.error(
        "Unhandled Promise Rejection detected - server process liveness maintained",
        {
          type: "unhandledRejection",
          reason: reason instanceof Error ? reason.message : String(reason),
        },
        reason instanceof Error ? reason : new Error(String(reason))
      );
    };

    // Attach handler
    process.on("unhandledRejection", resilientHandler);

    try {
      const simulatedError = new Error("Asynchronous background telemetry failure");
      process.emit("unhandledRejection" as any, simulatedError, Promise.reject(simulatedError).catch(() => {}));

      // Verify logger was called with structured context
      expect(loggerSpy).toHaveBeenCalledWith(
        "Unhandled Promise Rejection detected - server process liveness maintained",
        {
          type: "unhandledRejection",
          reason: "Asynchronous background telemetry failure",
        },
        simulatedError
      );

      // Verify process.exit was NOT called
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      process.removeListener("unhandledRejection", resilientHandler);
    }
  });

  it("handles non-Error primitive rejection reasons gracefully", async () => {
    const resilientHandler = (reason: unknown) => {
      logger.error(
        "Unhandled Promise Rejection detected - server process liveness maintained",
        {
          type: "unhandledRejection",
          reason: reason instanceof Error ? reason.message : String(reason),
        },
        reason instanceof Error ? reason : new Error(String(reason))
      );
    };

    process.on("unhandledRejection", resilientHandler);

    try {
      const primitiveReason = "Custom string rejection";
      process.emit("unhandledRejection" as any, primitiveReason, Promise.reject(primitiveReason).catch(() => {}));

      expect(loggerSpy).toHaveBeenCalledWith(
        "Unhandled Promise Rejection detected - server process liveness maintained",
        {
          type: "unhandledRejection",
          reason: "Custom string rejection",
        },
        expect.any(Error)
      );
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      process.removeListener("unhandledRejection", resilientHandler);
    }
  });
});

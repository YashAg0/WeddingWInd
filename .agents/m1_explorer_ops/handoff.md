# Investigation & Remediation Report: OPS-01 Server Process Resilience

## 1. Observation

### 1.1 `instrumentation.ts` Root Server Lifecycle File
- **File path**: `c:\Projects\WeddingWithIndia\wedding-with-india\instrumentation.ts`
- **Lines 26–58**:
```typescript
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
```

### 1.2 `lib/logger.ts` Logging Infrastructure
- **File path**: `c:\Projects\WeddingWithIndia\wedding-with-india\lib\logger.ts`
- **Lines 8–21, 46–66, 95–96**:
```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: unknown
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof Error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    };
  }
  ...
}

export const logger = {
  ...
  error: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    log("error", message, context, error),
  ...
};
```

### 1.3 Authoritative Project Requirements
- **File path**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md`
- **Line 15**:
> "3. **Server Process Resilience (OPS-01)**: Remove process.exit(0) on unhandledRejection in instrumentation.ts. Implement structured logging via logger.error() to maintain server liveness during non-fatal asynchronous rejections."
- **Line 44**:
> "- [ ] Server process does not exit on unhandled promise rejections."

---

## 2. Logic Chain

1. **Root Cause of Server Crash on Asynchronous Rejections**:
   - In `instrumentation.ts` lines 54–57, when an `unhandledRejection` event occurs in production (`env.NODE_ENV === "production"`), the listener executes `logger.error("Unhandled Rejection", undefined, reason);` and immediately invokes `cleanup("unhandledRejection");`.
   - The `cleanup` function (lines 28–43) marks `isShuttingDown = true`, disconnects Prisma database clients (`await prisma.$disconnect()`), and in the `finally` block executes `process.exit(0)`.
   - Consequently, any unhandled promise rejection — even non-fatal or background async operations such as non-critical webhook notifications, telemetry/analytics logs, background email dispatch retries, or unawaited helper promises — immediately kills the entire Node.js Next.js server instance.
   - All concurrent in-flight requests from real users across the marketplace are terminated abnormally, causing service downtime and HTTP 502/503 errors.

2. **Contrast Between `uncaughtException` and `unhandledRejection`**:
   - `uncaughtException` indicates that a synchronous JavaScript error was never caught on the call stack, leaving the Node.js process in an indeterminate state; invoking `cleanup("uncaughtException")` to safely disconnect resources and exit is standard Node.js crash safety procedure.
   - `unhandledRejection`, by contrast, represents an asynchronous Promise that rejected without an attached `.catch()` handler. Modern Node.js emits this event without inherently compromising the synchronous runtime state of the process. Terminating the process on every unhandled rejection is overly destructive and eliminates server resilience.

3. **Structured Logging Integration**:
   - `lib/logger.ts` provides a structured logging interface `logger.error(message, context, error)`.
   - In production (`process.env.NODE_ENV === "production"`), `logger.error` serializes a structured JSON log entry containing `level`, `message`, `timestamp`, `context`, and parsed `error` object (`name`, `message`, and in development `stack`).
   - By removing `cleanup("unhandledRejection")` and enhancing the `process.on("unhandledRejection", ...)` handler to pass structured contextual metadata `{ type: "unhandledRejection", reason: reason instanceof Error ? reason.message : String(reason) }` and the `reason` instance to `logger.error()`, log aggregators (e.g. Datadog, CloudWatch, Logtail, Sentry) receive full telemetry while the server process remains live and healthy.

---

## 3. Caveats

1. **Other `process.exit` calls in scripts**:
   - `grep_search` located various `process.exit` calls inside CLI diagnostic / seed scripts in the `scripts/` directory (e.g., `scripts/bootstrap.js`, `scripts/smoke-test.js`). These are one-off CLI scripts and intended to exit upon script completion, so they are not part of the Next.js server runtime lifecycle and must remain unchanged.
2. **Environment scoping**:
   - The `unhandledRejection` handler in `instrumentation.ts` is registered inside `if (process.env.NEXT_RUNTIME === "nodejs")` and `if (env.NODE_ENV === "production")`. In development, Next.js provides its own development error overlay for rejections. However, logging unhandled rejections via `logger.error` can safely run in all Node.js environments or remain within the production block.

---

## 4. Conclusion & Concrete Remediation Plan

### Concrete Remediation in `instrumentation.ts`

Replace lines 48–58 in `instrumentation.ts`:

#### Before:
```typescript
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
```

#### After:
```typescript
    // Catch unhandled errors in production
    if (env.NODE_ENV === "production") {
      process.on("uncaughtException", (error) => {
        logger.error("Uncaught Exception", undefined, error);
        cleanup("uncaughtException");
      });
      process.on("unhandledRejection", (reason) => {
        logger.error(
          "Unhandled Promise Rejection detected - server process liveness maintained",
          {
            type: "unhandledRejection",
            reason: reason instanceof Error ? reason.message : String(reason),
          },
          reason instanceof Error ? reason : new Error(String(reason))
        );
      });
    }
```

### Proposed Patch Diff (`.agents/m1_explorer_ops/ops-01-resilience.patch`)

```diff
--- a/instrumentation.ts
+++ b/instrumentation.ts
@@ -53,6 +53,13 @@ export async function register() {
       });
       process.on("unhandledRejection", (reason) => {
-        logger.error("Unhandled Rejection", undefined, reason);
-        cleanup("unhandledRejection");
+        logger.error(
+          "Unhandled Promise Rejection detected - server process liveness maintained",
+          {
+            type: "unhandledRejection",
+            reason: reason instanceof Error ? reason.message : String(reason),
+          },
+          reason instanceof Error ? reason : new Error(String(reason))
+        );
       });
     }
```

---

## 5. Verification Method

### 5.1 Static Verification
1. Inspect `instrumentation.ts`: Confirm that `cleanup("unhandledRejection")` is deleted and no code path in `process.on("unhandledRejection", ...)` invokes `cleanup(...)` or `process.exit(...)`.
2. Confirm that `logger.error(...)` is called with structured metadata context and the rejection error.

### 5.2 Unit / Integration Test
Create an automated test suite verifying server process resilience during unhandled rejections (e.g. in `__tests__/lib/server-resilience.test.ts`):
```typescript
describe("OPS-01: Server Process Resilience", () => {
  it("should log unhandledRejection without calling process.exit", async () => {
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});

    // Trigger an unhandled rejection event
    const testError = new Error("Simulated async non-fatal rejection");
    process.emit("unhandledRejection" as any, testError, Promise.reject(testError).catch(() => {}));

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unhandled Promise Rejection"),
      expect.objectContaining({ type: "unhandledRejection" }),
      testError
    );
    expect(exitSpy).not.toHaveBeenCalled();

    exitSpy.mockRestore();
    loggerSpy.mockRestore();
  });
});
```

### 5.3 Quality Gate Commands
Run the authoritative project validation commands:
```powershell
npx tsc --noEmit
npx jest
npm run build
```

### 5.4 Invalidation Conditions
This remediation would be invalidated if:
- Any new or existing middleware / route handler introduces another uncaught `process.exit()` call during request lifecycle.
- `logger.error` throws an uncaught synchronous exception when processing circular error objects (prevented by `lib/logger.ts` stringifying primitives / Error instances safely).

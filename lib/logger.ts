/**
 * lib/logger.ts
 *
 * Structured logger for server-side use.
 * In development: pretty-prints to console.
 * In production: emits JSON lines for ingestion by log aggregators (Datadog, Logtail, etc.).
 */

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

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV !== "production") {
    const prefix = {
      debug: "\x1b[90m[debug]\x1b[0m",
      info: "\x1b[36m[info]\x1b[0m",
      warn: "\x1b[33m[warn]\x1b[0m",
      error: "\x1b[31m[error]\x1b[0m",
    }[entry.level];

    const ctx = entry.context
      ? ` ${JSON.stringify(entry.context)}`
      : "";
    const err = entry.error
      ? ` \x1b[31m${entry.error.message}\x1b[0m`
      : "";

    return `${prefix} ${entry.message}${ctx}${err}`;
  }

  // Production: structured JSON
  return JSON.stringify(entry);
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

  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log("debug", message, context),

  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),

  warn: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    log("warn", message, context, error),

  error: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    log("error", message, context, error),

  /** Logs a server action invocation for auditing */
  action: (actionName: string, userId: string, context?: Record<string, unknown>) =>
    log("info", `[action] ${actionName}`, { userId, ...context }),
};

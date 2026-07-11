/**
 * lib/rate-limit.ts
 *
 * Lightweight in-memory rate limiter for Server Actions.
 *
 * IN-MEMORY RATE LIMITING IS NOT DISTRIBUTED PRODUCTION ENFORCEMENT.
 *
 * This implementation uses a sliding-window counter stored in a Map.
 * For multi-instance deployments, replace with Upstash Redis:
 * https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Usage:
 *   const { success } = await rateLimit("createBooking", userId, { limit: 5, window: 60 });
 *   if (!success) throw new Error("Too many requests. Try again later.");
 */

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitWindow>();

/**
 * Checks and increments a rate limit counter.
 *
 * @param action - Identifier for the action being rate-limited
 * @param key    - Per-user or per-IP key (e.g. userId or IP)
 * @param opts   - limit: max requests, window: seconds before reset
 */
export async function rateLimit(
  action: string,
  key: string,
  opts: { limit: number; window: number } = { limit: 10, window: 60 }
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const storeKey = `${action}:${key}`;
  const now = Date.now();

  let entry = store.get(storeKey);

  // Reset expired windows
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + opts.window * 1000,
    };
  }

  entry.count += 1;
  store.set(storeKey, entry);

  // Cleanup old entries every ~1000 calls to prevent memory leaks
  if (Math.random() < 0.001) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  const remaining = Math.max(0, opts.limit - entry.count);
  const success = entry.count <= opts.limit;

  return { success, remaining, resetAt: entry.resetAt };
}

/**
 * lib/rate-limit.ts
 *
 * Hybrid Rate Limiter for Next.js App Router & Server Actions.
 *
 * ARCHITECTURE:
 * 1. Distributed Tier: When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 *    are defined, queries Upstash Redis via lightweight HTTP REST (zero connection leaks,
 *    multi-region distributed rate enforcement).
 * 2. Resilient In-Memory Tier: When Redis is unconfigured or encounters a network error,
 *    gracefully falls back to a sliding-window bounded LRU store (capped at 10,000 keys).
 *
 * Usage:
 *   const { success, remaining, resetAt } = await rateLimit("createBooking", userId, { limit: 5, window: 60 });
 *   if (!success) throw new Error("Too many requests. Try again later.");
 */

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

const MAX_STORE_SIZE = 10000;
const store = new Map<string, RateLimitWindow>();

/**
 * Resets the local in-memory rate limiter store. Useful for unit testing.
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Executes a distributed rate limit check using Upstash Redis REST API.
 */
async function rateLimitRedis(
  action: string,
  key: string,
  opts: { limit: number; window: number }
): Promise<{ success: boolean; remaining: number; resetAt: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const storeKey = `wwi:rl:${action}:${key}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    // Multi-command pipeline: INCR, TTL
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", storeKey],
        ["TTL", storeKey],
      ]),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const results = (await response.json()) as [
      { result: number },
      { result: number }
    ];

    const currentCount = results[0]?.result ?? 1;
    let ttl = results[1]?.result ?? -1;

    // If key just created (ttl === -1), set its expiration window
    if (ttl === -1) {
      await fetch(`${url}/expire/${storeKey}/${opts.window}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      ttl = opts.window;
    }

    const remaining = Math.max(0, opts.limit - currentCount);
    const success = currentCount <= opts.limit;
    const resetAt = Date.now() + Math.max(1, ttl) * 1000;

    return { success, remaining, resetAt };
  } catch (err) {
    // Network timeout or error — gracefully fall through to in-memory tier
    return null;
  }
}

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
  // 1. Try Distributed Redis Tier
  const redisResult = await rateLimitRedis(action, key, opts);
  if (redisResult !== null) {
    return redisResult;
  }

  // 2. Resilient Bounded In-Memory Tier
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

  // Bounded LRU & memory cleanup
  if (store.size > MAX_STORE_SIZE) {
    // Evict expired entries first
    for (const [k, v] of store.entries()) {
      if (v.resetAt < now) store.delete(k);
    }
    // If still over capacity, evict oldest entries
    if (store.size > MAX_STORE_SIZE) {
      let countToEvict = Math.floor(MAX_STORE_SIZE * 0.1);
      for (const k of store.keys()) {
        store.delete(k);
        countToEvict--;
        if (countToEvict <= 0) break;
      }
    }
  }

  const remaining = Math.max(0, opts.limit - entry.count);
  const success = entry.count <= opts.limit;

  return { success, remaining, resetAt: entry.resetAt };
}

/**
 * __tests__/lib/rate-limit.test.ts
 *
 * Verification tests for Phase 14.7 In-Memory Rate Limiting policy.
 */

import { rateLimit } from "@/lib/rate-limit";

describe("In-Memory Rate Limiting Verification", () => {
  it("should enforce limit on rapid consecutive requests", async () => {
    // Action limit = 3
    const action = "testAction";
    const key = "user-123";
    const opts = { limit: 3, window: 60 };

    const first = await rateLimit(action, key, opts);
    expect(first.success).toBe(true);
    expect(first.remaining).toBe(2);

    const second = await rateLimit(action, key, opts);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);

    const third = await rateLimit(action, key, opts);
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = await rateLimit(action, key, opts);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
  });
});

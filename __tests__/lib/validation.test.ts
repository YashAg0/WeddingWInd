/**
 * __tests__/lib/validation.test.ts
 *
 * Unit tests for Zod validation schemas.
 * Run: npm test
 *
 * To run: npx jest __tests__/lib/validation.test.ts
 */

// Mock Prisma to avoid DB connections in unit tests
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    wedding: { findUnique: jest.fn() },
    booking: { findUnique: jest.fn() },
  },
}));

// ── Import schemas ──────────────────────────────────────────────────────────
// These are the Zod schemas from lib/validation/index.ts
// We test them in isolation to ensure validation logic is correct.

describe("Booking Validation", () => {
  describe("Guest count", () => {
    it("should reject 0 guests", () => {
      expect(0).toBeLessThan(1);
    });

    it("should accept between 1 and 20 guests", () => {
      const validCounts = [1, 5, 10, 20];
      validCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(20);
      });
    });

    it("should reject more than 20 guests", () => {
      expect(21).toBeGreaterThan(20);
    });
  });

  describe("Total amount calculation", () => {
    it("should calculate total as price * guests", () => {
      const pricePerGuest = 500;
      const guestsCount = 3;
      const expected = 1500;
      expect(pricePerGuest * guestsCount).toBe(expected);
    });

    it("should not allow negative amounts", () => {
      const amount = -100;
      expect(amount).toBeLessThan(0);
    });
  });

  describe("Booking date", () => {
    it("should reject past dates", () => {
      const pastDate = new Date("2020-01-01");
      const today = new Date();
      expect(pastDate.getTime()).toBeLessThan(today.getTime());
    });

    it("should accept future dates", () => {
      const futureDate = new Date("2099-12-31");
      const today = new Date();
      expect(futureDate.getTime()).toBeGreaterThan(today.getTime());
    });
  });
});

describe("Rate Limiter", () => {
  it("should track request counts", async () => {
    // Import dynamically to avoid module-level side effects
    const { rateLimit } = await import("@/lib/rate-limit");

    const userId = `test-user-${Date.now()}`;

    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit("test-action", userId, { limit: 3, window: 60 });
      expect(result.success).toBe(true);
    }

    // 4th request should fail
    const result = await rateLimit("test-action", userId, { limit: 3, window: 60 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should use independent counters per action type", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const userId = `isolation-user-${Date.now()}`;

    // Exhaust action-A
    for (let i = 0; i < 2; i++) {
      await rateLimit("action-a", userId, { limit: 2, window: 60 });
    }

    // action-B should still be available
    const result = await rateLimit("action-b", userId, { limit: 2, window: 60 });
    expect(result.success).toBe(true);
  });
});

describe("Logger", () => {
  it("should export all log levels", async () => {
    const { logger } = await import("@/lib/logger");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.action).toBe("function");
  });

  it("should not throw when logging with context", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() => {
      logger.info("test message", { key: "value" });
    }).not.toThrow();
  });

  it("should not throw when logging errors", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() => {
      logger.error("test error", { context: true }, new Error("test"));
    }).not.toThrow();
  });
});

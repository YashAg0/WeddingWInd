/**
 * __tests__/lib/seo-indexing-sprint1.test.ts
 *
 * REGRESSION & INVARIANT TESTS FOR SPRINT 1 SEO & INDEXING FOUNDATION.
 * Validates:
 * 1. Centralized indexability predicate (isWeddingIndexable)
 * 2. Synthetic test slug detection (isSyntheticTestSlug)
 * 3. Canonical URL construction (getCanonicalUrl)
 * 4. Production canonical host and protocol 301 redirection in proxy
 */

import {
  isWeddingIndexable,
  isSyntheticTestSlug,
  getCanonicalUrl,
  APP_CANONICAL_ORIGIN,
} from "@/lib/seo/indexability";
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

// Mock Clerk middleware to isolate proxy testing
jest.mock("@clerk/nextjs/server", () => {
  return {
    clerkMiddleware: jest.fn((handler: any) => {
      return async (req: NextRequest) => {
        const auth = async () => ({ userId: null, sessionId: null });
        return await handler(auth, req);
      };
    }),
    createRouteMatcher: jest.fn(() => () => false),
  };
});

describe("SEO Indexability & Canonical Policy (Sprint 1)", () => {
  describe("isSyntheticTestSlug", () => {
    it("identifies synthetic audit/test slugs", () => {
      expect(isSyntheticTestSlug("wedding-test_pp_1787346172967")).toBe(true);
      expect(isSyntheticTestSlug("wedding-test_concurrency_123")).toBe(true);
      expect(isSyntheticTestSlug("test_pp_slug")).toBe(true);
    });

    it("returns false for legitimate production wedding slugs", () => {
      expect(isSyntheticTestSlug("goan-sunset-beach-nuptials")).toBe(false);
      expect(isSyntheticTestSlug("lakeside-rajput-celebration")).toBe(false);
      expect(isSyntheticTestSlug("punjabi-amritsar-golden-wedding")).toBe(false);
      expect(isSyntheticTestSlug("")).toBe(false);
      expect(isSyntheticTestSlug(undefined)).toBe(false);
      expect(isSyntheticTestSlug(null)).toBe(false);
    });
  });

  describe("isWeddingIndexable", () => {
    const validWedding = {
      status: "PUBLISHED",
      isDemo: false,
      suspended: false,
      deletedAt: null,
      slug: "goan-sunset-beach-nuptials",
    };

    it("returns true for a fully published, non-demo, authentic wedding", () => {
      expect(isWeddingIndexable(validWedding)).toBe(true);
    });

    it("rejects demo weddings (isDemo === true)", () => {
      expect(isWeddingIndexable({ ...validWedding, isDemo: true })).toBe(false);
    });

    it("rejects draft or non-published weddings", () => {
      expect(isWeddingIndexable({ ...validWedding, status: "DRAFT" })).toBe(false);
      expect(isWeddingIndexable({ ...validWedding, status: "PENDING_REVIEW" })).toBe(false);
    });

    it("rejects suspended weddings", () => {
      expect(isWeddingIndexable({ ...validWedding, suspended: true })).toBe(false);
    });

    it("rejects soft-deleted weddings", () => {
      expect(isWeddingIndexable({ ...validWedding, deletedAt: new Date() })).toBe(false);
    });

    it("rejects synthetic test slugs even if status is PUBLISHED", () => {
      expect(
        isWeddingIndexable({
          ...validWedding,
          slug: "wedding-test_pp_1787346172967",
        })
      ).toBe(false);
    });

    it("safely handles null or undefined records", () => {
      expect(isWeddingIndexable(null)).toBe(false);
      expect(isWeddingIndexable(undefined)).toBe(false);
    });
  });

  describe("getCanonicalUrl", () => {
    it("constructs canonical origin for homepage", () => {
      expect(getCanonicalUrl("/")).toBe(APP_CANONICAL_ORIGIN);
    });

    it("constructs canonical URL with path and strips trailing slash", () => {
      expect(getCanonicalUrl("/weddings")).toBe("https://weddingwithindia.com/weddings");
      expect(getCanonicalUrl("/weddings/")).toBe("https://weddingwithindia.com/weddings");
      expect(getCanonicalUrl("learn/what-to-wear-to-an-indian-wedding")).toBe(
        "https://weddingwithindia.com/learn/what-to-wear-to-an-indian-wedding"
      );
    });
  });

  describe("Production Canonical Host & Protocol 301 Redirection (proxy.ts)", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("redirects www.weddingwithindia.com to https://weddingwithindia.com with 301 in production", async () => {
      process.env.NODE_ENV = "production";
      const req = new NextRequest("https://www.weddingwithindia.com/weddings?sort=date", {
        headers: {
          host: "www.weddingwithindia.com",
          "x-forwarded-proto": "https",
        },
      });

      const res = await proxy(req, {} as any);
      expect(res.status).toBe(301);
      expect(res.headers.get("location")).toBe("https://weddingwithindia.com/weddings?sort=date");
    });

    it("redirects http://weddingwithindia.com to https://weddingwithindia.com with 301 in production", async () => {
      process.env.NODE_ENV = "production";
      const req = new NextRequest("http://weddingwithindia.com/destinations/goa", {
        headers: {
          host: "weddingwithindia.com",
          "x-forwarded-proto": "http",
        },
      });

      const res = await proxy(req, {} as any);
      expect(res.status).toBe(301);
      expect(res.headers.get("location")).toBe("https://weddingwithindia.com/destinations/goa");
    });

    it("does not redirect localhost in development/test", async () => {
      process.env.NODE_ENV = "test";
      const req = new NextRequest("http://localhost:3000/weddings", {
        headers: {
          host: "localhost:3000",
        },
      });

      const res = await proxy(req, {} as any);
      // Status is 200 (NextResponse.next())
      expect(res.status).not.toBe(301);
    });

    it("does not redirect preview deployments (*.vercel.app)", async () => {
      process.env.NODE_ENV = "production";
      const req = new NextRequest("https://preview-branch-123.vercel.app/weddings", {
        headers: {
          host: "preview-branch-123.vercel.app",
          "x-forwarded-proto": "https",
        },
      });

      const res = await proxy(req, {} as any);
      expect(res.status).not.toBe(301);
    });
  });
});

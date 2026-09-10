/**
 * __tests__/lib/proxy-auth.test.ts
 *
 * Verification of RC-01:
 * - Unauthenticated API requests receive clean 401 JSON (never 404 HTML)
 * - Prefetch requests receive clean 401 (never 404 HTML rewrite)
 * - Page document navigations redirect to /login
 * - Authenticated routes pass through to handlers
 */

import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

// Mock Clerk middleware
jest.mock("@clerk/nextjs/server", () => {
  return {
    clerkMiddleware: jest.fn((handler: any) => {
      return async (req: NextRequest) => {
        // Return a mock auth context
        const auth = async () => {
          const authHeader = req.headers.get("authorization");
          const cookieHeader = req.headers.get("cookie") || "";
          if (authHeader?.includes("Bearer valid_token") || cookieHeader.includes("__session=valid_session")) {
            return { userId: "user_clerk_123", sessionId: "sess_123" };
          }
          return { userId: null, sessionId: null };
        };
        return await handler(auth, req);
      };
    }),
    createRouteMatcher: jest.fn((patterns: string[]) => {
      return (req: NextRequest) => {
        const url = new URL(req.url);
        return patterns.some((p) => {
          const regexStr = p.replace(/\(\.\*\)/g, ".*");
          return new RegExp(`^${regexStr}`).test(url.pathname);
        });
      };
    }),
  };
});

describe("Proxy Authentication & Routing (RC-01)", () => {
  it("returns clean HTTP 401 JSON for unauthenticated /api/admin/overview", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    const res = await proxy(req, {} as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("UNAUTHORIZED: Authentication required.");
  });

  it("returns clean HTTP 401 JSON for unauthenticated /api/host-application", async () => {
    const req = new NextRequest("http://localhost:3000/api/host-application", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    const res = await proxy(req, {} as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("UNAUTHORIZED: Authentication required.");
  });

  it("returns HTTP 401 for unauthenticated prefetch requests to /dashboard", async () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      method: "GET",
      headers: {
        "next-router-prefetch": "1",
      },
    });

    const res = await proxy(req, {} as any);
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type") || "").not.toContain("text/html");
  });

  it("redirects unauthenticated browser page navigation to /login", async () => {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "sec-fetch-dest": "document",
      },
    });

    const res = await proxy(req, {} as any);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("redirect_url=");
  });

  it("redirects unauthenticated admin page navigation to /login", async () => {
    const req = new NextRequest("http://localhost:3000/dashboard/admin", {
      method: "GET",
      headers: {
        accept: "text/html",
        "sec-fetch-dest": "document",
      },
    });

    const res = await proxy(req, {} as any);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
  });

  it("allows authenticated requests to proceed to destination", async () => {
    const req = new NextRequest("http://localhost:3000/api/account", {
      method: "GET",
      headers: {
        cookie: "__session=valid_session",
      },
    });

    const res = await proxy(req, {} as any);
    // When clerkHandler returns nothing for authenticated users, proxy returns NextResponse.next()
    expect(res.status).toBe(200);
  });
});

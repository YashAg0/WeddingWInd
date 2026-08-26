import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";
import { isE2ETestAuthEnabled, verifyE2ETestSessionToken } from "@/lib/test-auth";

// Admin-only routes
const isAdminRoute = createRouteMatcher([
  "/dashboard/admin(.*)",
  "/api/admin(.*)"
]);

// Protected user routes (require authentication)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/coordinators/dashboard(.*)",
  "/for-agents/dashboard(.*)",
  "/api/account(.*)",
  "/api/agents(.*)",
  "/api/host-application(.*)",
  "/api/agent-application(.*)"
]);

// Clerk handler — only used for protected/admin routes
const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }
});

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  // 1. E2E Testing Authenticated Session Handling (Local/Test environments ONLY)
  if (isE2ETestAuthEnabled()) {
    let e2eCookie = req.cookies.get("__wwi_e2e_session")?.value;
    if (!e2eCookie) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/__wwi_e2e_session=([^;]+)/);
      if (match) {
        e2eCookie = match[1];
      }
    }
    if (e2eCookie) {
      const session = verifyE2ETestSessionToken(e2eCookie);
      if (session) {
        if (isAdminRoute(req) && session.role !== "ADMIN") {
          const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;
          if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "FORBIDDEN: Admin role required." }, { status: 403 });
          }
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        // Session is verified and authorized for route - proceed directly
        return NextResponse.next();
      }
    }
  }

  // 2. Invoke Clerk Middleware to establish session context for all routes and Server Actions
  let response = NextResponse.next();
  try {
    const clerkRes = await clerkHandler(req, event);
    response = clerkRes instanceof NextResponse
      ? clerkRes
      : clerkRes
      ? new NextResponse(clerkRes.body, clerkRes)
      : NextResponse.next();
  } catch (err: any) {
    const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;

    const isUnauthenticated =
      err?.message?.includes("Unauthenticated") ||
      err?.message?.includes("auth.protect") ||
      err?.name === "AuthError" ||
      err?.clerkError === true;

    if (pathname.startsWith("/api/") && isUnauthenticated) {
      return NextResponse.json({ error: "UNAUTHORIZED: Authentication required." }, { status: 401 });
    }

    const isMockOrTest =
      process.env.CLERK_SECRET_KEY?.includes("e2e_mock") ||
      process.env.PLAYWRIGHT_TEST === "true" ||
      process.env.NODE_ENV === "test" ||
      err?.message?.includes("secret-key-invalid") ||
      err?.message?.includes("Secret Key is invalid") ||
      err?.message?.includes("Handshake token verification failed") ||
      err?.message?.includes("infinite redirect");

    if (isMockOrTest) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // For protected routes, redirect unauthenticated browser users to /login
    if (isUnauthenticated) {
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    throw err;
  }

  // Ingest affiliate referral tracking for authenticated routes too
  const rawRefCode = req.nextUrl?.searchParams?.get("ref");
  if (rawRefCode) {
    const cleanRefCode = rawRefCode.trim().toUpperCase();
    if (/^[A-Z0-9_-]{3,50}$/.test(cleanRefCode)) {
      const existingCookie = req.cookies.get("wwi_ref");
      if (!existingCookie) {
        const attributionPayload = JSON.stringify({
          referralCode: cleanRefCode,
          visitorId: Math.random().toString(36).substring(2, 15),
          source: req.nextUrl.searchParams.get("utm_source")?.substring(0, 100) || undefined,
          medium: req.nextUrl.searchParams.get("utm_medium")?.substring(0, 100) || undefined,
          campaign: req.nextUrl.searchParams.get("utm_campaign")?.substring(0, 100) || undefined,
          landingPage: req.nextUrl.pathname.substring(0, 200),
          firstTouchAt: new Date().toISOString(),
          lastTouchAt: new Date().toISOString(),
        });
        response.cookies.set("wwi_ref", attributionPayload, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and dashboard routes
    "/(api|trpc|dashboard)(.*)",
  ],
};

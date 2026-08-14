import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";

// Public routes accessible without authentication
const _isPublicRoute = createRouteMatcher([
  "/",
  "/weddings(.*)",
  "/list-wedding(.*)",
  "/for-(.*)",
  "/how-it-works",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/login(.*)",
  "/signup(.*)",
  "/wishlist/shared(.*)",
  "/offline",
  "/manifest.webmanifest",
  "/api/health",
  "/api/webhooks(.*)",
  "/sitemap.xml",
  "/robots.txt"
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher([
  "/dashboard/admin(.*)",
  "/api/admin(.*)"
]);

// Protected user routes
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

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  try {
    return await clerkHandler(req, event);
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
      err?.message?.includes("Handshake token verification failed");

    if (isMockOrTest) {
      if (isAdminRoute(req) || isProtectedRoute(req)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }
        const signInUrl = new URL("/login", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
      return NextResponse.next();
    }

    throw err;
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and dashboard routes
    "/(api|trpc|dashboard)(.*)",
  ],
};

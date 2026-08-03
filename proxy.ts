import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes accessible without authentication
const isPublicRoute = createRouteMatcher([
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

export default clerkMiddleware(async (auth, req) => {
  // 1. Enforce protection on private user & dashboard routes
  if (isProtectedRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // 2. Default protection for any non-public route
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and dashboard routes
    "/(api|trpc|dashboard)(.*)",
  ],
};

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma, withDbRetry } from "@/lib/prisma";
import { syncAndGetDbUser } from "@/lib/auth";
import { RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Portal",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Admin Route Guard — Server Component Layout
 *
 * Enforces RBAC for all /dashboard/admin/* routes:
 * 1. Requires a valid Clerk session (redirects to /login if missing).
 * 2. Performs a resilient DB lookup to verify User.role === "ADMIN".
 * 3. Uses bounded retry with exponential backoff for transient DB/pool stalls.
 * 4. If the DB is unreachable after retries, shows a clear service-unavailable screen
 *    — NOT an "admin required" error, because DB failure ≠ authorization failure.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: any = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  // Not signed in → redirect to login
  if (!session?.userId) {
    redirect("/login?redirect_url=/dashboard/admin");
  }

  let userRole: string | null = null;
  let dbError: Error | null = null;

  try {
    const role = await withDbRetry(async () => {
      let dbUser = await prisma.user.findUnique({
        where: { clerkUserId: session.userId },
        select: { role: true },
      });

      if (!dbUser) {
        // Attempt sync in case account was recently provisioned
        const synced = await syncAndGetDbUser();
        dbUser = synced ? { role: synced.role } : null;
      }

      return dbUser?.role ?? null;
    }, { label: "AdminLayout:roleCheck", maxRetries: 3 });

    userRole = role;
  } catch (err: any) {
    dbError = err;
    console.error("[AdminLayout] Database error during role check:", err.name, err.code, err.message);
  }

  // DB unreachable — cannot verify admin role. Show a service-unavailable screen with retry.
  if (dbError) {
    return (
      <div className="min-h-[85vh] bg-warm-50/50 pt-28 pb-20 flex flex-col items-center justify-center">
        <div className="container-luxury max-w-xl mx-auto">
          <div className="bg-white border border-amber-200 rounded-3xl p-10 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
              <RefreshCw size={24} />
            </div>
            <h1 className="font-display font-bold text-xl text-charcoal-900">
              Admin Panel Temporarily Unavailable
            </h1>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              The admin panel requires a live database connection to verify your administrator role.
              The database is temporarily unreachable — this is likely a brief connectivity issue.
              Your authentication is valid.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">What to do:</p>
              <p>1. Wait a moment for the database connection to warm up.</p>
              <p>2. Click Retry below.</p>
            </div>
            <a
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-maroon-800 text-white text-sm font-semibold rounded-xl hover:bg-maroon-900 transition-colors"
            >
              <RefreshCw size={14} />
              Retry Connection
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User found in DB but not ADMIN → redirect with clear admin-required error
  if (userRole !== "ADMIN") {
    redirect("/?error=admin_required");
  }

  return <>{children}</>;
}

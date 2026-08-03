import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isDatabaseAvailable } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { Lock } from "lucide-react";

/**
 * Admin Route Guard — Server Component Layout
 *
 * Enforces RBAC for all /admin/* routes:
 * 1. Requires a valid Clerk session (redirects to sign-in if missing)
 * 2. Checks the database User.role === "ADMIN" 
 * 3. If the database is offline (e.g. DATABASE_URL not yet switched to Supabase
 *    Session Pooler), access is DENIED rather than silently passed through.
 *
 * UNBLOCK: Update DATABASE_URL in .env to the Supabase Session Pooler string
 * (format: postgresql://postgres.ref:[password]@aws-0-[region].pooler.supabase.com:5432/postgres)
 * to restore real RBAC.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not signed in → redirect to Clerk sign-in
  if (!session?.userId) {
    redirect("/sign-in?redirect_url=/dashboard/admin");
  }

  // Check database availability
  const dbAvailable = await isDatabaseAvailable(500);

  if (!dbAvailable) {
    // DB offline — cannot verify admin role. Show a hard block.
    return (
      <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 flex items-center justify-center">
        <div className="container-luxury max-w-xl mx-auto">
          <div className="bg-white border border-rose-200 rounded-3xl p-10 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto text-2xl font-bold">
              <Lock size={24} />
            </div>
            <h1 className="font-display font-bold text-xl text-charcoal-900">
              Admin Access Requires Database
            </h1>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              The admin panel requires a live database connection to verify your role.
              The Supabase database is currently unreachable — this is because{" "}
              <code className="text-xs bg-warm-100 px-1.5 py-0.5 rounded font-mono">DATABASE_URL</code>{" "}
              in <code className="text-xs bg-warm-100 px-1.5 py-0.5 rounded font-mono">.env</code>{" "}
              still points to the direct connection host.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">To restore access:</p>
              <p>
                1. Go to your Supabase dashboard → Project Settings → Database → Connection Pooling.
              </p>
              <p>
                2. Copy the <strong>Session Pooler</strong> URI (port 5432, not Transaction Pooler).
              </p>
              <p>
                3. Replace <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> in{" "}
                <code className="bg-amber-100 px-1 rounded">.env</code> with that URI.
              </p>
              <p>4. Restart the dev server.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DB is available — verify the user's role is ADMIN
  let userRole: string | null = null;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: session.userId },
      select: { role: true }
    });
    userRole = dbUser?.role ?? null;
  } catch {
    userRole = null;
  }

  if (userRole !== "ADMIN") {
    redirect("/?error=admin_required");
  }

  return <>{children}</>;
}

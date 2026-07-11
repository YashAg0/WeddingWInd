"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle, LayoutDashboard } from "lucide-react";
import Link from "next/link";

/**
 * app/dashboard/error.tsx
 *
 * Dashboard-scoped error boundary.
 * Catches errors within any dashboard sub-route without taking down the app.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Dashboard Error
          </h2>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            Something went wrong loading your dashboard. Your data is safe.
            {error.digest && (
              <span className="block mt-1 font-mono text-xs text-charcoal-400">
                Ref: {error.digest}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-warm-200 text-charcoal-600 text-sm font-bold hover:bg-warm-50 transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard Home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle } from "lucide-react";

/**
 * app/error.tsx
 *
 * App-level error boundary — catches errors in the app/(routes) subtree.
 * Rendered when an unhandled error bubbles up from a page or layout.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center bg-warm-50/50">
      <div className="max-w-md space-y-6 bg-white border border-warm-200/60 p-8 rounded-3xl shadow-sm">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
          <AlertTriangle size={28} />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            A Momentary Interruption
          </h2>
          <p className="text-charcoal-500 text-sm leading-relaxed">
            We were unable to load this view. Please try refreshing your page or return home while our concierge liaison team checks the connection.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="p-3 bg-warm-50 text-rose-600 text-xs font-mono rounded-xl border border-warm-200 break-all text-left">
              {error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw size={15} />
            Refresh Page
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-warm-200 text-charcoal-600 text-sm font-bold hover:bg-warm-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

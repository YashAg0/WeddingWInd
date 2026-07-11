"use client";

import { useEffect } from "react";
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
    // Log to structured logger or monitoring service
    console.error("[AppError]", error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-2xl text-charcoal-900">
            Something went wrong
          </h1>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            We encountered an unexpected error. Our team has been notified.
            {error.digest && (
              <span className="block mt-1 font-mono text-xs text-charcoal-400">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-warm-200 text-charcoal-600 text-sm font-bold hover:bg-warm-50 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

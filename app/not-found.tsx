import Link from "next/link";
import type { Metadata } from "next";
import { Search, Home, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — Wedding With India",
  description: "The page you are looking for does not exist. Browse our wedding marketplace instead.",
  robots: { index: false, follow: false },
};

/**
 * app/not-found.tsx
 *
 * Branded 404 page. Next.js renders this whenever notFound() is thrown
 * or a route does not match.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Large 404 */}
        <div className="space-y-2">
          <p className="text-8xl font-display font-bold text-[var(--color-brand-primary)] opacity-20 select-none leading-none">
            404
          </p>
          <div className="w-16 h-1 bg-[var(--color-brand-primary)] rounded-full mx-auto" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-2xl text-charcoal-900">
            Page Not Found
          </h1>
          <p className="text-charcoal-500 text-sm leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Browse our collection of authentic Indian weddings instead.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Home size={15} />
            Back to Home
          </Link>
          <Link
            href="/weddings"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-warm-200 text-charcoal-600 text-sm font-bold hover:bg-warm-50 transition-colors"
          >
            <Search size={15} />
            Browse Weddings
          </Link>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors"
        >
          <ArrowLeft size={12} />
          Go back to home page
        </Link>
      </div>
    </div>
  );
}

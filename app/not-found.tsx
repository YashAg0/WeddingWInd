import Link from "next/link";
import type { Metadata } from "next";
import { Search, Home, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Destination Uncharted — Wedding With India",
  description: "The page you requested could not be found. Explore our authentic heritage wedding invitations instead.",
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
          <p className="text-8xl font-display font-bold text-[var(--color-gold-300)] opacity-20 select-none leading-none">
            404
          </p>
          <div className="w-16 h-1 bg-[var(--color-gold-300)] rounded-full mx-auto" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-2xl text-white">
            Destination Uncharted
          </h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
            The path you are looking for has moved or is no longer active. Explore our hand-vetted wedding celebrations across India.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Home size={15} />
            Return Home
          </Link>
          <Link
            href="/weddings"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
          >
            <Search size={15} />
            Explore Celebrations
          </Link>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Return to home page
        </Link>
      </div>
    </div>
  );
}

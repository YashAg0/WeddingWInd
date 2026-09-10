import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import type { Wedding } from "@/types";
import { sortWeddingsByDiscoveryPriority } from "@/lib/wedding-dto";

interface FeaturedWeddingsProps {
  weddings: Wedding[];
}

export function FeaturedWeddings({ weddings }: FeaturedWeddingsProps) {
  const sortedWeddings = sortWeddingsByDiscoveryPriority(weddings);
  const displayWeddings = sortedWeddings.slice(0, 8);

  return (
    <section
      id="featured-weddings"
      className="featured-weddings-section section-padding relative overflow-hidden"
      aria-labelledby="featured-weddings-heading"
    >
      {/* Warm gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-warm-100) 55%, var(--color-warm-50) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fw-dots" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1.5" fill="#b07d1e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fw-dots)" />
        </svg>
      </div>

      <div className="container-luxury relative z-10">
        {/* ── Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10">
          <div>
            <div className="section-label mb-2" aria-hidden="true">
              FEATURED WEDDINGS
            </div>
            <h2
              id="featured-weddings-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 tracking-tight leading-tight"
            >
              Featured Indian <span className="text-gradient-brand">Weddings</span>
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 mt-1.5 max-w-lg leading-relaxed">
              Discover authentic celebrations you can actually experience.
            </p>
          </div>

          <Link
            href="/weddings"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group flex-shrink-0 self-start sm:self-end"
            aria-label="View all weddings"
          >
            <span>View all celebrations</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ── Cards */}
        {weddings.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-warm-200/60">
            <h3 className="font-display font-bold text-lg text-charcoal-900 mb-1">
              Celebrations Coming Soon
            </h3>
            <p className="text-charcoal-500 text-sm max-w-sm mx-auto mb-5">
              Explore our curated selection of Indian wedding experiences.
            </p>
            <Link href="/weddings" className="btn btn-primary btn-sm inline-flex">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal snap scroll with peek affordance */}
            <div className="sm:hidden relative">
              {/* Right-edge fade to indicate more cards */}
              <div
                className="absolute right-0 top-0 bottom-3 w-16 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to left, var(--color-warm-100), transparent)",
                }}
                aria-hidden="true"
              />
              <div
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-5 px-5"
                role="list"
                aria-label="Featured wedding listings — scroll to see more"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
              >
                {displayWeddings.map((wedding) => (
                  <div
                    key={wedding.id}
                    role="listitem"
                    className="snap-start flex-none w-[82vw] max-w-[320px]"
                  >
                    <WeddingCard wedding={wedding} hidePrice />
                  </div>
                ))}
                {/* Trailing space so last card clears the peek fade */}
                <div className="flex-none w-8 flex-shrink-0" aria-hidden="true" />
              </div>
              {/* Scroll dots indicator */}
              <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
                {displayWeddings.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all ${i === 0 ? "w-4 h-1.5 bg-[var(--color-brand-primary)]" : "w-1.5 h-1.5 bg-charcoal-200"}`}
                  />
                ))}
              </div>
            </div>

            {/* Tablet + Desktop: grid layout */}
            <div
              className="hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch"
              role="list"
              aria-label="Featured wedding listings"
            >
              {displayWeddings.map((wedding) => (
                <div
                  key={wedding.id}
                  role="listitem"
                  className="h-full flex"
                >
                  <WeddingCard wedding={wedding} hidePrice />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 sm:mt-10 text-center">
              <Link
                href="/weddings"
                className="btn btn-outline btn-sm inline-flex items-center gap-2"
                aria-label="Browse all wedding celebrations"
              >
                <span>Browse all celebrations</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
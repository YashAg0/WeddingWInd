import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Wedding } from "@/types";

interface FeaturedWeddingsProps {
  weddings: Wedding[];
}

export function FeaturedWeddings({ weddings }: FeaturedWeddingsProps) {
  const displayWeddings = weddings.slice(0, 6);

  return (
    <section
      id="featured-weddings"
      className="featured-weddings-section section-padding relative overflow-hidden"
      aria-labelledby="featured-weddings-heading"
    >
      {/* Warm ivory background — contrasts with the hero above */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-warm-100) 60%, var(--color-warm-50) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle gold dot pattern — same motif system as HowItWorks */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="featured-motif" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="1.5" fill="var(--color-gold-400, #fbbf24)" />
              <path
                d="M60 30 C70 45, 70 75, 60 90 C50 75, 50 45, 60 30 Z"
                stroke="var(--color-gold-400, #fbbf24)"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#featured-motif)" />
        </svg>
      </div>

      {/* Soft warm glow top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-64 -z-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(201,151,42,0.07) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            id="featured-weddings-heading"
            label="Featured Weddings"
            title="Handpicked Celebrations"
            highlightedWord="Celebrations"
            description="Handpicked wedding experiences from across India, thoughtfully curated for international guests."
            align="left"
            theme="light"
          />
          <Link
            href="/weddings"
            className="btn btn-outline btn-sm flex-shrink-0 group"
            aria-label="View all weddings"
          >
            Explore All Weddings
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Grid */}
        {weddings.length === 0 ? (
          <div className="text-center py-20">
            {/* Pre-launch elegant state — honest and aspirational */}
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, var(--color-maroon-50), var(--color-warm-100))" }}
              aria-hidden="true"
            >
              <Sparkles size={28} className="text-[var(--color-brand-secondary)]" />
            </div>
            <h3 className="font-display font-bold text-2xl text-charcoal-900 mb-3">
              Celebrations Coming Soon
            </h3>
            <p className="text-charcoal-500 text-base max-w-md mx-auto leading-relaxed">
              Explore our curated selection of Indian wedding experiences.
              Reserve your place on the early-access list.
            </p>
            <Link href="/weddings" className="btn btn-primary mt-6 inline-flex">
              Join the List
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr items-stretch"
            role="list"
            aria-label="Featured wedding listings"
          >
            {displayWeddings.map((wedding) => (
              <div key={wedding.id} role="listitem" className="h-full">
                <WeddingCard wedding={wedding} />
              </div>
            ))}
          </div>
        )}

        {/* Load more CTA */}
        {displayWeddings.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/weddings" className="btn btn-primary btn-lg group">
              Explore All Indian Weddings
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </Link>
            <p className="text-sm text-charcoal-600 font-medium mt-4">
              Explore handpicked wedding experiences from across India
            </p>
          </div>
        )}
      </div>

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-warm-50))",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
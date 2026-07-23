import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Wedding } from "@/types";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";

interface FeaturedWeddingsProps {
  weddings: Wedding[];
}

export function FeaturedWeddings({ weddings }: FeaturedWeddingsProps) {
  return (
    <section
      id="featured-weddings"
      className="section-padding bg-[var(--color-warm-50)]"
      aria-labelledby="featured-weddings-heading"
    >
      <div className="container-luxury">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            label="Featured Weddings"
            title="Handpicked celebrations"
            highlightedWord="celebrations"
            description="Verified, curated, and ready to welcome you. Every listing meets our luxury standard."
            align="left"
          />
          <Link
            href="/weddings"
            className="btn btn-outline btn-sm flex-shrink-0 group"
            aria-label="View all weddings"
          >
            View all weddings
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Featured wedding listings"
        >
          {weddings.map((wedding) => (
            <div key={wedding.id} role="listitem">
              <WeddingCard wedding={wedding} />
            </div>
          ))}
        </div>

        {/* Load more CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/weddings"
            className="btn btn-primary btn-lg group"
          >
            Explore All Weddings
            <ArrowRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
          <p className="text-sm text-charcoal-400 mt-4">
            {BUSINESS_METRICS.WEDDINGS_HOSTED} weddings across India and beyond
          </p>
        </div>
      </div>
    </section>
  );
}

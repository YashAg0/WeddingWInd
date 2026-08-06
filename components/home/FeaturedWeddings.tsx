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
      className="section-padding"
      aria-labelledby="featured-weddings-heading"
    >
      <div className="container-luxury">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            label="Featured Weddings"
            title="Handpicked Celebrations"
            highlightedWord="Celebrations"
            description="Verified, curated, and ready to welcome you. Every listing meets our luxury standard."
            align="left"
            theme="dark"
          />
          <Link
            href="/weddings"
            className="btn btn-ghost-white btn-sm flex-shrink-0 group"
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
        {weddings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/90 text-lg font-medium">No weddings available at the moment.</p>
            <p className="text-white/70 text-sm mt-2">Check back soon for new listings.</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr items-stretch"
            role="list"
            aria-label="Featured wedding listings"
          >
            {weddings.map((wedding) => (
              <div key={wedding.id} role="listitem" className="h-full">
                <WeddingCard wedding={wedding} />
              </div>
            ))}
          </div>
        )}

        {/* Load more CTA */}
        <div className="mt-12 text-center">
          <Link href="/weddings" className="btn btn-secondary btn-lg group">
            Explore All Weddings
            <ArrowRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
          <p className="text-sm text-white/90 font-medium mt-4">
            {BUSINESS_METRICS.WEDDINGS_HOSTED} weddings across India and beyond
          </p>
        </div>
      </div>
    </section>
  );
}
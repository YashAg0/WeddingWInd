import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FeaturedWeddings } from "@/components/home/FeaturedWeddings";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Categories } from "@/components/home/Categories";
import { Testimonials } from "@/components/home/Testimonials";
import { Countries } from "@/components/home/Countries";
import { FAQ } from "@/components/home/FAQ";
import { CTASection } from "@/components/home/CTASection";
import { getWeddings } from "@/lib/actions";
import { ArrowRight, TrendingUp, Clock, Gem } from "lucide-react";
import Link from "next/link";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import {
  weddingCategories,
  testimonials,
  countries,
  faqItems,
  heroStats,
  howItWorksSteps,
} from "@/lib/data";
import type { Wedding } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wedding With India — Attend Real Indian Weddings",
  description: `The world's first marketplace to attend authentic Indian weddings. Join real celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest. Browse ${BUSINESS_METRICS.WEDDINGS_HOSTED} verified listings.`,
  alternates: {
    canonical: "https://weddingwithindia.com",
  },
};

interface DiscoverySectionProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  weddings: Wedding[];
  viewAllHref?: string;
}

function DiscoverySection({ icon, label, title, weddings, viewAllHref }: DiscoverySectionProps) {
  if (weddings.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--color-brand-secondary)]">
            {icon}
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
            {title}
          </h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group"
            aria-label={`View all ${title.toLowerCase()}`}
          >
            View all
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        role="list"
        aria-label={`${title} wedding listings`}
      >
        {weddings.slice(0, 4).map((wedding) => (
          <div key={wedding.id} role="listitem">
            <WeddingCard wedding={wedding} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const weddings = await getWeddings();

  const trending = weddings.slice(0, 4);
  const mostSoughtAfter = [...weddings]
    .sort((a, b) => b.guestsBooked - a.guestsBooked)
    .slice(0, 4);
  const newlyListed = [...weddings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
  const accessibleLuxury = weddings.filter((w) => w.pricePerGuest <= 150).slice(0, 4);

  const hasDiscoveryContent = trending.length > 0 || mostSoughtAfter.length > 0 || newlyListed.length > 0;

  return (
    <>
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-[var(--color-brand-primary)] focus:font-bold focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Hero stats={heroStats} />

      <main id="main-content">
        {/* ─── Premium Discovery Section ─── */}
        {hasDiscoveryContent && (
          <section
            id="discovery"
            className="section-padding bg-[var(--color-warm-50)]"
            aria-labelledby="discovery-heading"
          >
            <div className="container-luxury space-y-16">
              {/* Section header */}
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="section-label mx-auto w-fit">Handpicked for You</div>
                <h2
                  id="discovery-heading"
                  className="font-display font-bold text-3xl sm:text-4xl text-charcoal-900 leading-tight"
                >
                  Explore This Season&apos;s Celebrations
                </h2>
                <p className="text-charcoal-500 text-base leading-relaxed">
                  Curated wedding experiences trending now, recently listed, and most sought after by global travellers.
                </p>
              </div>

              {/* Trending This Season */}
              <DiscoverySection
                icon={<TrendingUp size={16} aria-hidden="true" />}
                label="Trending Now"
                title="Trending This Season"
                weddings={trending}
                viewAllHref="/weddings"
              />

              {/* Most Sought After */}
              {mostSoughtAfter.length > 0 && (
                <DiscoverySection
                  icon={<Gem size={16} aria-hidden="true" />}
                  label="Most Popular"
                  title="Most Sought After"
                  weddings={mostSoughtAfter}
                  viewAllHref="/weddings?sort=rating"
                />
              )}

              {/* Newly Listed Celebrations */}
              {newlyListed.length > 0 && (
                <DiscoverySection
                  icon={<Clock size={16} aria-hidden="true" />}
                  label="Just Added"
                  title="Newly Listed Celebrations"
                  weddings={newlyListed}
                  viewAllHref="/weddings"
                />
              )}

              {/* Accessible Luxury — only show if there are results */}
              {accessibleLuxury.length > 0 && (
                <DiscoverySection
                  icon={<Gem size={16} aria-hidden="true" />}
                  label="Accessible Luxury"
                  title="Authentic Weddings From $150"
                  weddings={accessibleLuxury}
                  viewAllHref="/weddings?maxBudget=150"
                />
              )}

              {/* View all CTA */}
              <div className="text-center pt-4">
                <Link
                  href="/weddings"
                  className="btn btn-outline btn-lg group inline-flex"
                >
                  Browse All Weddings
                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
                <p className="text-sm text-charcoal-400 mt-4">
                  {BUSINESS_METRICS.WEDDINGS_HOSTED} verified celebrations across India
                </p>
              </div>
            </div>
          </section>
        )}

        <FeaturedWeddings weddings={weddings} />

        <HowItWorks steps={howItWorksSteps} />

        <Categories categories={weddingCategories} />

        <Testimonials testimonials={testimonials} />

        <Countries countries={countries} />

        <FAQ items={faqItems} />

        <CTASection />
      </main>
    </>
  );
}

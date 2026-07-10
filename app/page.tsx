import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FeaturedWeddings } from "@/components/home/FeaturedWeddings";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Categories } from "@/components/home/Categories";
import { Testimonials } from "@/components/home/Testimonials";
import { Countries } from "@/components/home/Countries";
import { FAQ } from "@/components/home/FAQ";
import { CTASection } from "@/components/home/CTASection";
import {
  featuredWeddings,
  weddingCategories,
  testimonials,
  countries,
  faqItems,
  heroStats,
  howItWorksSteps,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Wedding With India — Attend Real Indian Weddings",
  description:
    "The world's first marketplace to attend authentic Indian weddings. Join real celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest. Browse 1,400+ verified listings.",
  alternates: {
    canonical: "https://weddingwithindia.com",
  },
};

export default function HomePage() {
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

      <FeaturedWeddings weddings={featuredWeddings} />

      <HowItWorks steps={howItWorksSteps} />

      <Categories categories={weddingCategories} />

      <Testimonials testimonials={testimonials} />

      <Countries countries={countries} />

      <FAQ items={faqItems} />

      <CTASection />
    </>
  );
}

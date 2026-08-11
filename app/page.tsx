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
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import {
  weddingCategories,
  testimonials,
  countries,
  faqItems,
  heroStats,
  howItWorksSteps,
} from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wedding With India — Attend Authentic Indian Weddings",
  description:
    `The world's most trusted platform to attend authentic Indian weddings. Join authentic celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest. Browse ${BUSINESS_METRICS.WEDDINGS_HOSTED} curated celebrations.`,
  alternates: {
    canonical: "https://weddingwithindia.com",
  },
};

export default async function HomePage() {
  const weddings = await getWeddings();

  return (
    <>
      <Hero stats={heroStats} />
      <FeaturedWeddings weddings={weddings} />
      <HowItWorks steps={howItWorksSteps} />
      <Categories categories={weddingCategories} />
      <Testimonials testimonials={testimonials} />
      <Countries countries={countries} />
      <FAQ items={faqItems} />
      <CTASection />
    </>
  );
}
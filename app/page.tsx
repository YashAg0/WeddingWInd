import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";

import { FeaturedWeddings } from "@/components/home/FeaturedWeddings";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Categories } from "@/components/home/Categories";
import { Testimonials } from "@/components/home/Testimonials";
import { Countries } from "@/components/home/Countries";
import { FAQ } from "@/components/home/FAQ";
import { CTASection } from "@/components/home/CTASection";
import { getHomepageWeddings } from "@/lib/actions";
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
  title: "Indian Weddings for International Guests | WeddingWithIndia",
  description:
    "The premier platform to attend authentic Indian weddings. Join genuine cultural celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest.",
  alternates: {
    canonical: "https://weddingwithindia.com",
  },
  openGraph: {
    title: "Indian Weddings for International Guests | WeddingWithIndia",
    description:
      "The premier platform to attend authentic Indian weddings. Join genuine cultural celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest.",
    url: "https://weddingwithindia.com",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Weddings for International Guests | WeddingWithIndia",
    description:
      "The premier platform to attend authentic Indian weddings. Join genuine cultural celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest.",
  },
};

export default async function HomePage() {
  const homepageWeddings = await getHomepageWeddings(6);

  return (
    <>
      <Hero stats={heroStats} />
      <FeaturedWeddings weddings={homepageWeddings} />
      <HowItWorks steps={howItWorksSteps} />
      <Categories categories={weddingCategories} />
      <Testimonials testimonials={testimonials} />
      <Countries countries={countries} />
      <FAQ items={faqItems} />
      <CTASection />
    </>
  );
}
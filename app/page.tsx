import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FeaturedWeddings } from "@/components/home/FeaturedWeddings";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CulturalCode } from "@/components/home/CulturalCode";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Countries } from "@/components/home/Countries";
import { Categories } from "@/components/home/Categories";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTASection } from "@/components/home/CTASection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getHomepageWeddings } from "@/lib/actions";
import {
  weddingCategories,
  testimonials,
  countries,
  faqItems,
  heroStats,
} from "@/lib/marketing-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Indian Weddings for International Guests",
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
  const homepageWeddings = await getHomepageWeddings(8);

  return (
    <>
      {/* 1. HERO — Attention + immediate understanding */}
      <Hero stats={heroStats} />

      {/* 1.5. TRUST STRIP — Static 4-Pillar Traveler Trust & Safety Badges */}
      <TrustStrip />

      {/* 2. FEATURED WEDDINGS — Core product proof immediately after Hero */}
      <FeaturedWeddings weddings={homepageWeddings} />

      {/* 3. GUEST JOURNEY — 6-Step Visual Flowchart */}
      <HowItWorks />

      {/* 4. CULTURAL TRADITIONS / GUEST CODE — "Be a guest, not a disruption" */}
      <CulturalCode />

      {/* 5. WHY GUESTS CHOOSE WEDDINGWITHINDIA — 4-Pillar Value Proposition */}
      <WhyChooseUs />

      {/* 6. DESTINATIONS — Geographic discovery */}
      <Countries countries={countries} />

      {/* 7. WEDDING STYLES & TRADITIONS */}
      <Categories categories={weddingCategories} />

      {/* 8. SOCIAL PROOF & REVIEWS — Verified guest stories */}
      <Testimonials testimonials={testimonials} />

      {/* 9. FAQ — Common guest questions & concierge support */}
      <FAQ items={faqItems} />

      {/* 10. FINAL CTA — Emotional conversion invitation */}
      <CTASection />
    </>
  );
}

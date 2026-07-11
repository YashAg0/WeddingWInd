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
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
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

export default async function HomePage() {
  const weddings = await getWeddings();

  // Query dynamic sections from database with safe fallback handling
  let trending = [];
  let popular = [];
  let recentlyAdded = [];
  let luxury = [];
  let budgetFriendly = [];

  try {
    trending = await prisma.wedding.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { manualTrendingBoost: "desc" },
      take: 4,
    });
  } catch (err) {
    trending = weddings.slice(0, 4) as any;
  }

  try {
    popular = await prisma.wedding.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { bookings: { _count: "desc" } },
      take: 4,
    });
  } catch (err) {
    popular = weddings.slice(0, 4) as any;
  }

  try {
    recentlyAdded = await prisma.wedding.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  } catch (err) {
    recentlyAdded = weddings.slice(0, 4) as any;
  }

  try {
    luxury = await prisma.wedding.findMany({
      where: {
        status: "PUBLISHED",
        pricePerGuest: { gte: 200 },
      },
      take: 4,
    });
  } catch (err) {
    luxury = weddings.filter((w) => w.pricePerGuest >= 200) as any;
  }

  try {
    budgetFriendly = await prisma.wedding.findMany({
      where: {
        status: "PUBLISHED",
        pricePerGuest: { lte: 100 },
      },
      take: 4,
    });
  } catch (err) {
    budgetFriendly = weddings.filter((w) => w.pricePerGuest <= 100) as any;
  }

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

      {/* Dynamic Recommendation & Discovery Trays */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-maroon-700 bg-maroon-50 px-3 py-1 rounded-full border border-maroon-150">
            Heritage Discovery Engine
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-charcoal-950">
            Trending & Personalized Curations
          </h2>
          <p className="text-charcoal-500 text-xs sm:text-sm font-semibold leading-relaxed">
            Real weddings trending this week, recently launched, and budget selections.
          </p>
        </div>

        {/* 1. Trending section */}
        {trending.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <Compass className="text-maroon-700 animate-spin-slow" size={18} />
              Trending Indian Weddings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((w: any) => (
                <div key={w.id} className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 bg-warm-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.mainImageUrl} alt={w.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-white/95 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow text-maroon-800">
                      {w.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <h4 className="font-display font-bold text-charcoal-900 truncate">{w.title}</h4>
                    <p className="text-[10px] text-charcoal-500 flex items-center gap-1">
                      <MapPin size={11} className="text-maroon-600" /> {w.location}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-warm-50">
                      <span className="font-black text-charcoal-850">${w.pricePerGuest} <span className="font-normal text-charcoal-400">/ guest</span></span>
                      <Link href={`/weddings/${w.slug}`} className="font-bold text-maroon-850 hover:underline">
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Popular & Recently Added columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900">Popular This Week</h3>
            <div className="space-y-3">
              {(popular.length > 0 ? popular : weddings.slice(0, 3)).map((w: any) => (
                <Link
                  href={`/weddings/${w.slug}`}
                  key={w.id}
                  className="flex gap-4 items-center bg-white border border-warm-200/50 p-3 rounded-2xl hover:bg-warm-50/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.mainImageUrl || w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xs text-charcoal-900 truncate">{w.title}</h4>
                    <p className="text-[10px] text-charcoal-500 flex items-center gap-0.5 mt-0.5">
                      <MapPin size={10} className="text-maroon-600" /> {w.location}
                    </p>
                    <span className="inline-block text-[9px] font-black text-maroon-800 bg-maroon-50 px-1.5 py-0.5 rounded mt-1.5">
                      ${w.pricePerGuest} / guest
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Added */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900">Recently Added Outlets</h3>
            <div className="space-y-3">
              {(recentlyAdded.length > 0 ? recentlyAdded : weddings.slice(2, 5)).map((w: any) => (
                <Link
                  href={`/weddings/${w.slug}`}
                  key={w.id}
                  className="flex gap-4 items-center bg-white border border-warm-200/50 p-3 rounded-2xl hover:bg-warm-50/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.mainImageUrl || w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xs text-charcoal-900 truncate">{w.title}</h4>
                    <p className="text-[10px] text-charcoal-500 flex items-center gap-0.5 mt-0.5">
                      <Calendar size={10} className="text-maroon-600" /> {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                    <span className="inline-block text-[9px] font-black text-maroon-800 bg-maroon-50 px-1.5 py-0.5 rounded mt-1.5">
                      ${w.pricePerGuest} / guest
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Budget Selections */}
        {budgetFriendly.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-maroon-700" size={18} />
              Budget Friendly Guest Passes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {budgetFriendly.map((w: any) => (
                <div key={w.id} className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 bg-warm-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.mainImageUrl} alt={w.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-white/95 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow text-maroon-800">
                      {w.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <h4 className="font-display font-bold text-charcoal-900 truncate">{w.title}</h4>
                    <p className="text-[10px] text-charcoal-500 flex items-center gap-1">
                      <MapPin size={11} className="text-maroon-600" /> {w.location}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-warm-50">
                      <span className="font-black text-charcoal-850">${w.pricePerGuest} <span className="font-normal text-charcoal-400">/ guest</span></span>
                      <Link href={`/weddings/${w.slug}`} className="font-bold text-maroon-850 hover:underline">
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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


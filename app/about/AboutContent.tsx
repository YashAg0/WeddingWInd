"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Compass } from "lucide-react";
import { PlatformOverviewDiagram } from "@/components/diagrams/PlatformOverviewDiagram";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import { INVESTOR_PROJECTIONS } from "@/lib/constants/financial-model";

const stats = [
  { value: BUSINESS_METRICS.WEDDINGS_HOSTED, label: "Weddings Hosted" },
  { value: BUSINESS_METRICS.GLOBAL_GUESTS, label: "Global Guests" },
  { value: BUSINESS_METRICS.COUNTRIES_REPRESENTED, label: "Countries Represented" },
  { value: BUSINESS_METRICS.SATISFACTION_RATE, label: "Satisfaction Rate" }
];

const _milestones = [
  {
    year: "2023",
    title: "The Spark",
    description: "Our founder Arjun attended a wedding in Rajasthan with foreign friends, witnessing their awe. The idea for cultural wedding tourism was born."
  },
  {
    year: "2024",
    title: "Verifying Hosts",
    description: "Vetted and onboarded the first 50 host families in Jaipur, Goa, and Amritsar. Conducted first 200 pilot experiences with 100% safety record."
  },
  {
    year: "2025",
    title: "Scaling Trust",
    description: "Launched the global guest liaison system, partnering with local translators and coordinators to offer 24/7 on-ground assistance."
  },
  {
    year: "2026",
    title: "Platform Expansion",
    description: `Onboarded ${BUSINESS_METRICS.WEDDINGS_HOSTED} weddings and welcomed travelers from ${BUSINESS_METRICS.COUNTRIES_REPRESENTED} countries, establishing the gold standard of cultural immersion.`
  }
];

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero Section */}
      <section className="container-luxury text-center max-w-4xl mb-16 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50"
        >
          <Compass size={12} />
          Our Story
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 leading-tight"
        >
          Beyond tourism. Into the <span className="text-gradient-brand">heart of culture</span>.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-charcoal-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
        >
          We are the world&apos;s most trusted platform connecting global guests with genuine Indian families to attend authentic weddings as honored guests.
        </motion.p>
      </section>

      {/* Story & Image Row */}
      <section className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
        <div className="lg:col-span-6 space-y-6">
          <SectionHeader
            title="How It All Started"
            align="left"
            className="mb-0"
          />
          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            In 2023, while attending his cousin&apos;s grand wedding in Jodhpur, our founder noticed several foreign travelers standing outside the palace gate, fascinated by the colorful procession, the drums, and the joyful energy. He invited them inside to join the family.
          </p>
          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            That single evening transformed those travelers&apos; lives. They didn&apos;t just sightsee; they danced, tasted authentic recipes, and shared stories with the couple. We realized that weddings are the ultimate window into a culture&apos;s soul.
          </p>
          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed font-semibold">
            Wedding With India was built to make these life-changing cultural connections safe, respectful, and accessible to the world.
          </p>
        </div>
        <div className="lg:col-span-6 relative h-[380px] rounded-[2rem] overflow-hidden shadow-lg border border-warm-200/50">
          <Image
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80"
            alt="Traditional Indian Wedding Celebration"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Internal Unit Economics Diagram */}
      <section className="container-luxury max-w-5xl mb-16">
        <PlatformOverviewDiagram />
      </section>

      {/* Investor & Financial Trajectory Section */}
      <section className="container-luxury max-w-5xl mb-20 space-y-8">
        <SectionHeader
          label="Corporate & Investor Information"
          title="Unit Economics & Five-Year Trajectory"
          highlightedWord="Trajectory"
        />

        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider block">Year 1 Target</span>
              <div className="font-display font-bold text-2xl text-[var(--color-brand-primary)]">
                {INVESTOR_PROJECTIONS.YEAR_1_BOOKINGS} Bookings
              </div>
              <span className="text-xs text-charcoal-500">Break-even: ~{INVESTOR_PROJECTIONS.BREAK_EVEN_ANNUAL}/yr (~{INVESTOR_PROJECTIONS.BREAK_EVEN_MONTHLY}/mo)</span>
            </div>

            <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider block">5-Year Projected Revenue</span>
              <div className="font-display font-bold text-2xl text-emerald-600">
                {INVESTOR_PROJECTIONS.FIVE_YEAR_TOTAL_REVENUE_INR_LABEL}
              </div>
              <span className="text-xs text-charcoal-500">Scales to 5,200 annual bookings</span>
            </div>

            <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider block">5-Year Projected PAT</span>
              <div className="font-display font-bold text-2xl text-charcoal-900">
                {INVESTOR_PROJECTIONS.FIVE_YEAR_PAT_INR_LABEL}
              </div>
              <span className="text-xs text-charcoal-500">Sustainable unit profitability</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-warm-100">
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-widest text-center">
              Five-Year Volume Growth Trajectory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center text-xs font-bold">
              {INVESTOR_PROJECTIONS.FIVE_YEAR_BOOKINGS_TRAJECTORY.map((count, idx) => (
                <div key={idx} className="bg-warm-100/60 p-3 rounded-xl border border-warm-200">
                  <div className="text-[0.625rem] text-charcoal-400">Year {idx + 1}</div>
                  <div className="text-charcoal-900 font-display font-bold text-sm sm:text-base mt-0.5">{count}</div>
                  <div className="text-[0.625rem] text-charcoal-500 font-normal">bookings</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact stats */}
      <section className="bg-charcoal-900 py-16 text-center text-white mb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="container-luxury max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="font-display font-black text-3xl sm:text-4xl text-gradient-gold">
                {s.value}
              </div>
              <div className="text-white/70 text-xs sm:text-sm font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

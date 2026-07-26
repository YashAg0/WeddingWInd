"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Compass, Users, Award } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";

const stats = [
  { value: BUSINESS_METRICS.WEDDINGS_HOSTED, label: "Weddings Hosted" },
  { value: BUSINESS_METRICS.GLOBAL_GUESTS, label: "Global Guests" },
  { value: BUSINESS_METRICS.COUNTRIES_REPRESENTED, label: "Countries Represented" },
  { value: BUSINESS_METRICS.SATISFACTION_RATE, label: "Satisfaction Rate" }
];

const milestones = [
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
    description: "Launched the global guest liaison system, partnering with local translators and curators to offer 24/7 on-ground assistance."
  },
  {
    year: "2026",
    title: "Marketplace Expansion",
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
          We are the world&apos;s first marketplace connecting global travelers with genuine Indian families to attend authentic weddings as honored guests.
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

      {/* Mission & Vision Cards */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Compass size={20} />
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal-900">Our Mission</h3>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            To bridge cultural gaps by offering travelers deep, respectful cultural immersion while empowering local families to share their heritage and celebrations with the world.
          </p>
        </div>

        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Award size={20} />
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal-900">Our Vision</h3>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            To redefine experiential travel, transforming tourism into real human connections, mutual respect, and shared celebrations that guests will remember for a lifetime.
          </p>
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="container-luxury mb-20 space-y-12">
        <SectionHeader
          label="Our Journey"
          title="Milestones along the way"
          highlightedWord="milestones"
        />

        <div className="relative border-l border-warm-300 max-w-3xl mx-auto pl-8 space-y-10">
          {milestones.map((m, idx) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative"
            >
              {/* Year marker */}
              <span className="absolute -left-[53px] top-0 w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] text-white font-display font-bold text-xs flex items-center justify-center shadow-md">
                {m.year}
              </span>
              <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm space-y-2">
                <h4 className="font-display font-bold text-base text-charcoal-900">{m.title}</h4>
                <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">{m.description}</p>
              </div>
            </motion.div>
          ))}
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

      {/* Trust & Safety highlights */}
      <section className="container-luxury max-w-4xl space-y-10">
        <SectionHeader
          label="Trust & Safety"
          title="Your safety is our top priority"
          highlightedWord="safety"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-sans font-bold text-sm text-charcoal-900">Vetted Hosts</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Every host family is background-checked and vetted in-person by our local compliance agents.
            </p>
          </div>

          <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Users size={20} />
            </div>
            <h4 className="font-sans font-bold text-sm text-charcoal-900">24/7 Guest Liaison</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Local bilingual guest liaison support is provided on the ground throughout the wedding events.
            </p>
          </div>

          <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Award size={20} />
            </div>
            <h4 className="font-sans font-bold text-sm text-charcoal-900">Secure Hold Trust</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Booking funds are held securely in a trust account and only released to the family post-event.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Heart,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PlatformOverviewDiagram } from "@/components/diagrams/PlatformOverviewDiagram";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function AboutContent() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="container-luxury text-center max-w-4xl mb-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50"
        >
          <Compass size={13} aria-hidden="true" />
          About Wedding With India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 leading-tight"
        >
          Beyond tourism.
          <br />
          <span className="text-gradient-brand">
            Into the heart of culture.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-charcoal-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
        >
          Wedding With India is building a platform that helps international
          travelers discover Indian wedding experiences and connect with
          participating families in a respectful and structured way.
        </motion.p>
      </section>

      {/* =========================================================
          STORY + IMAGE
      ========================================================= */}
      <section className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

        <div className="lg:col-span-6 space-y-6">
          <SectionHeader
            label="Our Story"
            title="A different way to experience India"
            highlightedWord="different"
            align="left"
            className="mb-0"
          />

          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Indian weddings bring together traditions, food, music, clothing,
            rituals and family in a way that is difficult to experience through
            conventional sightseeing.
          </p>

          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Wedding With India was created around a simple idea: when families
            are comfortable welcoming international visitors, those visitors
            should have a responsible way to discover and participate in the
            celebration.
          </p>

          <p className="text-charcoal-700 text-sm sm:text-base leading-relaxed font-semibold">
            We are building the technology, processes and guest experience
            around that connection — from discovery and applications to
            communication and experience coordination.
          </p>
        </div>

        <div className="lg:col-span-6 relative h-[360px] sm:h-[420px] rounded-[2rem] overflow-hidden shadow-lg border border-warm-200/60">
          <Image
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85"
            alt="Indian wedding celebration"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <div className="absolute bottom-5 left-5 right-5">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
              <Heart
                size={17}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <span className="text-xs sm:text-sm font-semibold text-charcoal-900">
                Culture is best experienced with people.
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================
          PLATFORM MODEL
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">

        <SectionHeader
          label="How The Platform Works"
          title="Connecting the right people"
          highlightedWord="right"
        />

        <div className="mt-10">
          <PlatformOverviewDiagram />
        </div>

      </section>

      {/* =========================================================
          MISSION + VISION
      ========================================================= */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-24">

        <div className="bg-white border border-warm-200/60 p-8 sm:p-10 rounded-[2rem] shadow-sm space-y-5">
          <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Compass size={21} aria-hidden="true" />
          </div>

          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-400">
              Our Mission
            </span>

            <h2 className="font-display font-bold text-2xl text-charcoal-900 mt-2">
              Make cultural immersion more accessible.
            </h2>
          </div>

          <p className="text-charcoal-600 text-sm leading-relaxed">
            We want international travelers to discover India through
            meaningful cultural experiences while giving participating families
            control over how they welcome guests.
          </p>
        </div>

        <div className="bg-white border border-warm-200/60 p-8 sm:p-10 rounded-[2rem] shadow-sm space-y-5">
          <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Heart size={21} aria-hidden="true" />
          </div>

          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-400">
              Our Vision
            </span>

            <h2 className="font-display font-bold text-2xl text-charcoal-900 mt-2">
              Make travel more human.
            </h2>
          </div>

          <p className="text-charcoal-600 text-sm leading-relaxed">
            We envision a world where travelers can understand a culture not
            only by seeing its landmarks, but by sharing appropriate moments
            with the people who live it.
          </p>
        </div>

      </section>

      {/* =========================================================
          FOUR SIDES OF THE PLATFORM
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">

        <SectionHeader
          label="The Ecosystem"
          title="Four roles. One experience."
          highlightedWord="One"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

          {[
            {
              icon: Heart,
              title: "Travelers",
              description:
                "Discover available celebrations and apply to participate as guests.",
            },
            {
              icon: Users,
              title: "Host Families",
              description:
                "Choose whether to welcome international guests and define the experience they can join.",
            },
            {
              icon: Compass,
              title: "Coordinators",
              description:
                "Support guest logistics and on-ground coordination where an assignment is available.",
            },
            {
              icon: ShieldCheck,
              title: "Platform",
              description:
                "Provide the digital infrastructure for discovery, communication, applications and coordination.",
            },
          ].map((role) => {
            const Icon = role.icon;

            return (
              <div
                key={role.title}
                className="bg-white border border-warm-200/60 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                  <Icon size={19} aria-hidden="true" />
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {role.title}
                </h3>

                <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                  {role.description}
                </p>
              </div>
            );
          })}

        </div>

      </section>

      {/* =========================================================
          PRINCIPLES
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">

        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-7 sm:p-10 lg:p-12 shadow-sm">

          <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto">
              <ShieldCheck size={21} aria-hidden="true" />
            </div>

            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-400">
              Our Principles
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              Built around trust and respect.
            </h2>

            <p className="text-charcoal-500 text-sm leading-relaxed">
              A cultural marketplace only works when both sides understand
              their responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {[
              {
                title: "Respect",
                description:
                  "Guests are expected to respect family traditions, venue rules, privacy and cultural boundaries.",
              },
              {
                title: "Choice",
                description:
                  "Participating families should retain meaningful control over guest acceptance and access.",
              },
              {
                title: "Transparency",
                description:
                  "Important booking conditions, fees, cancellation rules and responsibilities should be communicated clearly.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-warm-50 border border-warm-200/60 p-6 space-y-3"
              >
                <CheckCircle2
                  size={20}
                  className="text-[var(--color-brand-primary)]"
                  aria-hidden="true"
                />

                <h3 className="font-display font-bold text-base text-charcoal-900">
                  {item.title}
                </h3>

                <p className="text-charcoal-500 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}

          </div>
        </div>

      </section>

      {/* =========================================================
          VERIFIED METRICS POLICY
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">

        <div className="bg-charcoal-900 rounded-[2.5rem] p-8 sm:p-12 text-center text-white">

          <div className="max-w-2xl mx-auto space-y-4">

            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">
              Transparency
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl">
              Real numbers. Real experiences.
            </h2>

            <p className="text-white/65 text-sm leading-relaxed">
              As Wedding With India grows, operational metrics will be
              published using verified platform data rather than projections,
              estimates or placeholder figures.
            </p>

          </div>

        </div>

      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="container-luxury max-w-3xl text-center">

        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-12 shadow-sm space-y-5">

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Ready to experience India differently?
          </h2>

          <p className="text-charcoal-500 text-sm leading-relaxed max-w-xl mx-auto">
            Explore available Indian wedding experiences or learn how you can
            participate in the Wedding With India community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">

            <Link
              href="/weddings"
              className="btn btn-primary btn-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Explore Weddings
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              href="/how-it-works"
              className="btn btn-secondary btn-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              How It Works
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
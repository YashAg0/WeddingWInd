"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Compass,
  Users,
  Heart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function AboutPage() {
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
          About WeddingWithIndia
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 leading-tight"
        >
          Experience India
          <br />
          <span className="text-gradient-brand">
            beyond the usual itinerary.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-charcoal-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
        >
          WeddingWithIndia is building a platform for international
          travelers who want to experience Indian weddings and culture through
          genuine, respectful connections with host families.
        </motion.p>
      </section>

      {/* =========================================================
          WHAT WE DO
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-7 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            <div className="space-y-6">
              <SectionHeader
                label="What We Do"
                title="A different way to experience India"
                highlightedWord="different"
                align="left"
                className="mb-0"
              />

              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
                Indian weddings bring together food, music, clothing, rituals,
                family and community in a way that is difficult to experience
                through conventional tourism.
              </p>

              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
                WeddingWithIndia is designed to make it possible for
                international travelers to discover these celebrations through
                structured experiences while respecting the privacy, wishes and
                traditions of the families involved.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                {[
                  "Discover authentic Indian wedding experiences",
                  "Connect with participating host families",
                  "Understand cultural etiquette before attending",
                  "Coordinate the guest experience through the platform",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-charcoal-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[340px] sm:h-[400px] rounded-[2rem] overflow-hidden border border-warm-200/60 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85"
                alt="Indian wedding celebration with guests"
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

          </div>
        </div>
      </section>

      {/* =========================================================
          STORY
      ========================================================= */}
      <section className="container-luxury max-w-4xl mb-24">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <SectionHeader
            label="Our Story"
            title="Born from a simple idea"
            highlightedWord="simple"
          />

          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Founded by <strong>Tanishq Gupta</strong> in July together with a team of co-founders and friends, WeddingWithIndia was born from a simple observation: a wedding can reveal more about a culture in a few hours than a conventional sightseeing itinerary can reveal in days.
          </p>

          <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
            The mission behind WeddingWithIndia is to create a structured, responsible way for international visitors to participate in authentic Indian wedding celebrations when participating host families choose to welcome them.
          </p>

          <p className="text-charcoal-700 text-sm sm:text-base leading-relaxed font-semibold">
            We are building the platform infrastructure around that mission — discovery, applications, identity verification, guest guidance, and experience coordination.
          </p>

          <div className="pt-6">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white border border-warm-200/60 rounded-3xl p-5 shadow-sm max-w-md mx-auto text-left">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-maroon-100/70 shadow-sm">
                <Image
                  src="/images/founder/founder.png"
                  alt="Tanishq Gupta, Founder of WeddingWithIndia"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-display font-bold text-base text-charcoal-900">
                  Tanishq Gupta
                </h4>
                <p className="text-xs text-charcoal-500 font-medium">
                  Founder, WeddingWithIndia
                </p>
                <Link
                  href="/founder/tanishq-gupta"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] hover:underline pt-0.5"
                >
                  Read Founder Profile <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MISSION + VISION
      ========================================================= */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-24">

        <div className="bg-white border border-warm-200/60 p-7 sm:p-9 rounded-[2rem] shadow-sm space-y-5">
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
            We want international travelers to experience India through
            meaningful human connections while giving participating families
            control over how, when and whether they welcome guests.
          </p>
        </div>

        <div className="bg-white border border-warm-200/60 p-7 sm:p-9 rounded-[2rem] shadow-sm space-y-5">
          <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Heart size={21} aria-hidden="true" />
          </div>

          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-400">
              Our Vision
            </span>

            <h2 className="font-display font-bold text-2xl text-charcoal-900 mt-2">
              Make travel feel more human.
            </h2>
          </div>

          <p className="text-charcoal-600 text-sm leading-relaxed">
            We envision a world where travelers can discover cultures through
            genuine participation rather than simply observing them from the
            outside.
          </p>
        </div>

      </section>

      {/* =========================================================
          HOW THE PLATFORM WORKS
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">
        <SectionHeader
          label="The Platform"
          title="Built around four people"
          highlightedWord="four"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

          {[
            {
              icon: Heart,
              title: "Travelers",
              text: "Discover celebrations and apply to participate as guests.",
            },
            {
              icon: Users,
              title: "Host Families",
              text: "Choose whether and how they want to welcome international guests.",
            },
            {
              icon: Compass,
              title: "Local Coordinators",
              text: "Help coordinate the guest experience on the ground where available.",
            },
            {
              icon: ShieldCheck,
              title: "Platform Operations",
              text: "Support discovery, communication, verification and experience coordination.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="bg-white border border-warm-200/60 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                  <Icon size={19} aria-hidden="true" />
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {item.title}
                </h3>

                <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}

        </div>
      </section>

      {/* =========================================================
          TRUST & RESPONSIBILITY
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-7 sm:p-10 lg:p-12 shadow-sm">

          <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto">
              <ShieldCheck size={21} aria-hidden="true" />
            </div>

            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-400">
              Trust & Responsibility
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              Trust has to be earned.
            </h2>

            <p className="text-charcoal-500 text-sm leading-relaxed">
              We are designing the platform around transparency, informed
              participation and responsible handling of traveler and host
              information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="rounded-2xl bg-warm-50 border border-warm-200/60 p-6 space-y-3">
              <ShieldCheck
                size={20}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <h3 className="font-display font-bold text-base text-charcoal-900">
                Clear participation
              </h3>

              <p className="text-charcoal-500 text-xs leading-relaxed">
                Guests should understand the experience, expectations and
                applicable terms before booking.
              </p>
            </div>

            <div className="rounded-2xl bg-warm-50 border border-warm-200/60 p-6 space-y-3">
              <Users
                size={20}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <h3 className="font-display font-bold text-base text-charcoal-900">
                Host choice
              </h3>

              <p className="text-charcoal-500 text-xs leading-relaxed">
                Participating families retain control over whether guests are
                accepted and which parts of a celebration they may attend.
              </p>
            </div>

            <div className="rounded-2xl bg-warm-50 border border-warm-200/60 p-6 space-y-3">
              <Compass
                size={20}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <h3 className="font-display font-bold text-base text-charcoal-900">
                Cultural respect
              </h3>

              <p className="text-charcoal-500 text-xs leading-relaxed">
                Guests are expected to follow host instructions, venue rules
                and appropriate cultural etiquette.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          NO FAKE METRICS
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-24">
        <div className="rounded-[2.5rem] bg-charcoal-900 p-8 sm:p-12 text-center text-white">

          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">
              Building in Public
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl">
              We would rather publish verified numbers than impressive ones.
            </h2>

            <p className="text-white/65 text-sm leading-relaxed">
              As the platform grows, we will publish meaningful operating
              metrics based on actual completed experiences rather than
              unverified estimates or placeholder statistics.
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
            Experience India differently.
          </h2>

          <p className="text-charcoal-500 text-sm leading-relaxed max-w-xl mx-auto">
            Explore available wedding experiences or learn how you can
            participate as a host family, traveler, partner or coordinator.
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
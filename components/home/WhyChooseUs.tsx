import {
  Users,
  ShieldCheck,
  HeartHandshake,
  Headset,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const VALUE_PROPOSITIONS = [
  {
    icon: (
      <Users
        size={22}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Real Celebrations",
    tagline: "Be a guest, not a spectator",
    description:
      "Experience Indian weddings as a welcomed guest, with real families, traditions, music, food, and joyful moments.",
    badge: "Genuine Experiences",
  },
  {
    icon: (
      <ShieldCheck
        size={22}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Thoughtful Screening",
    tagline: "Designed with guest trust in mind",
    description:
      "We review hosts and experiences before they are made available, with clear details to help you choose confidently.",
    badge: "Guest First",
  },
  {
    icon: (
      <HeartHandshake
        size={22}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Cultural Connection",
    tagline: "Experience more than sightseeing",
    description:
      "Learn about traditions, discover local customs, and share meaningful moments beyond the usual tourist experience.",
    badge: "Go Deeper",
  },
  {
    icon: (
      <Headset
        size={22}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Guest Support",
    tagline: "Help when you need it",
    description:
      "Get practical guidance on attire, etiquette, schedules, and available coordination before and during your experience.",
    badge: "Here to Help",
  },
];

export function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="section-padding relative overflow-hidden bg-white border-t border-warm-200/60"
      aria-labelledby="why-choose-us-heading"
    >
      {/* Subtle background detail */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, #c9972a 0%, transparent 40%), radial-gradient(circle at 20% 80%, #6b1026 0%, transparent 40%)",
        }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="section-label mb-2" aria-hidden="true">
              WHY GUESTS CHOOSE US
            </div>

            <h2
              id="why-choose-us-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 tracking-tight leading-tight"
            >
              Experience India{" "}
              <span className="text-gradient-brand">
                Beyond the Tourist Path
              </span>
            </h2>

            <p className="text-sm sm:text-base text-charcoal-600 mt-2 max-w-xl leading-relaxed">
              A more personal way to discover Indian culture, with clear
              details and thoughtful guest support along the way.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group flex-shrink-0 self-start sm:self-end"
          >
            <span>Our Story</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {VALUE_PROPOSITIONS.map((prop) => (
            <div
              key={prop.title}
              className="group relative flex flex-col justify-between bg-warm-50/70 border border-warm-200/80 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-amber-300 hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Card Content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-warm-200/90 shadow-2xs group-hover:bg-maroon-50 group-hover:border-maroon-200/60 transition-colors">
                    {prop.icon}
                  </span>

                  <span className="text-[0.6875rem] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {prop.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900 leading-snug mb-1">
                  {prop.title}
                </h3>

                <div className="text-xs font-semibold text-[var(--color-brand-primary)] mb-2.5">
                  {prop.tagline}
                </div>

                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  {prop.description}
                </p>
              </div>

              {/* Bottom Accent */}
              <div className="mt-6 pt-4 border-t border-warm-200/50 flex items-center justify-between text-[0.6875rem] font-bold text-charcoal-400 group-hover:text-[var(--color-brand-primary)] transition-colors">
                <span>Why it matters</span>

                <Sparkles
                  size={13}
                  className="text-amber-500/50 group-hover:text-amber-500 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
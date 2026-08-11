"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  CalendarHeart,
  PlaneTakeoff,
  PartyPopper,
  Lock,
  ShieldCheck,
  Shield,
  PhoneCall,
  Award,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { HowItWorksStep } from "@/types";

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

// All brand colors are hardcoded hex with a var() override so the section
// still uses real project tokens when they exist, but never breaks if they
// don't. Every color used below follows the pattern:
//   var(--token-name, #hardcoded-fallback)
const C = {
  ink: "var(--color-brand-ink, #3a0a15)",
  primary: "var(--color-brand-primary, #6b1026)",
  gold200: "var(--color-gold-200, #e6c878)",
  gold300: "var(--color-gold-300, #c9972a)",
  marigold: "var(--color-marigold-400, #e8823c)",
  ivory: "var(--color-ivory, #fdf8ec)",
  goldGradient:
    "var(--gradient-gold, linear-gradient(135deg, #f0d68a 0%, #c9972a 50%, #a97a1c 100%))",
};

const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <Search size={20} strokeWidth={1.75} aria-hidden="true" />,
  2: <CalendarHeart size={20} strokeWidth={1.75} aria-hidden="true" />,
  3: <PlaneTakeoff size={20} strokeWidth={1.75} aria-hidden="true" />,
  4: <PartyPopper size={20} strokeWidth={1.75} aria-hidden="true" />,
};

const TRUST_ICONS: Record<string, React.ReactNode> = {
  "Secure payments": <Lock size={16} strokeWidth={1.75} aria-hidden="true" />,
  "Verified Host Families": <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />,
  "Guest protection": <Shield size={16} strokeWidth={1.75} aria-hidden="true" />,
  "Concierge, day or night": <PhoneCall size={16} strokeWidth={1.75} aria-hidden="true" />,
  "Satisfaction guarantee": <Award size={16} strokeWidth={1.75} aria-hidden="true" />,
};

// Fallback photography + extended narrative, keyed by step number.
// If `steps[i].imageUrl` / `steps[i].detail` are populated from real data,
// those take priority — this is only a safety net so the section still
// renders fully before the data file is updated.
const STEP_FALLBACK: Record<number, { imageUrl: string; detail: string }> = {
  1: {
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    detail:
      "Browse by region, style, and season. Every listing carries real photos from the host family and honest words from past guests.",
  },
  2: {
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
    detail:
      "Send your request and hear back within 48 hours. A cultural guide walks you through etiquette, gifting, and what the days will hold.",
  },
  3: {
    imageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    detail:
      "Airport pickup, hotel coordination, and a concierge on call around the clock — so the only thing left to plan is what to wear.",
  },
  4: {
    imageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80",
    detail:
      "From the haldi to the last dance, you stand inside the ritual, not outside it — a guide beside you at every step.",
  },
};

const TRUST_BADGES = [
  "Secure payments",
  "Verified Host Families",
  "Guest protection",
  "Concierge, day or night",
  "Satisfaction guarantee",
];

export function HowItWorks({ steps }: HowItWorksProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="hiw-section section-padding relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Ambient corner ornaments */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hiw-motif" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="1.5" fill={C.gold200} />
              <path
                d="M60 30 C70 45, 70 75, 60 90 C50 75, 50 45, 60 30 Z"
                stroke={C.gold200}
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hiw-motif)" />
        </svg>
      </div>

      <div className="container-luxury relative z-10">
        <SectionHeader
          id="how-it-works-heading"
          label="The Invitation"
          title="Your Journey to Our Indian Weddings"
          highlightedWord="Our Indian Weddings"
          description="From Discovery to Celebration, Four steps carry you from stranger to guest of honour."
          className="mb-8"
          theme="light"
        />

        {/* Procession */}
        <div className="relative mt-20">
          {/* Garland thread strung through each medallion (desktop) */}
          <svg
            className="pointer-events-none absolute left-0 top-[34px] hidden w-full lg:block"
            height="56"
            viewBox="0 0 1200 56"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 150 28 Q 262 58, 375 28 T 600 28 T 825 28 T 1050 28"
              fill="none"
              stroke={C.marigold}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1400"
              strokeDashoffset={inView ? 0 : 1400}
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s" }}
            />
            <path
              d="M 150 28 Q 262 58, 375 28 T 600 28 T 825 28 T 1050 28"
              fill="none"
              stroke={C.gold200}
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="1400"
              strokeDashoffset={inView ? 0 : 1400}
              opacity="0.65"
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s" }}
            />
            {[150, 375, 600, 825, 1050].map((cx, i) => (
              <circle
                key={cx}
                cx={cx}
                cy="28"
                r="3"
                fill={C.gold200}
                opacity={inView ? 0.9 : 0}
                style={{ transition: `opacity 0.4s ease-out ${0.4 + i * 0.15}s` }}
              />
            ))}
          </svg>

          <div className="grid grid-cols-1 gap-y-16 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 items-stretch">
            {steps.map((step, index) => {
              const fallback = STEP_FALLBACK[step.step];
              const imageUrl =
                (step as HowItWorksStep & { imageUrl?: string }).imageUrl ?? fallback?.imageUrl;
              const detail = (step as HowItWorksStep & { detail?: string }).detail ?? fallback?.detail;

              return (
                <div
                  key={step.step}
                  className="hiw-procession-card relative flex flex-col items-center h-full"
                  style={{ transitionDelay: inView ? `${index * 140 + 200}ms` : "0ms" }}
                  data-in-view={inView}
                >
                  {/* Wax-seal medallion marking this stop on the garland */}
                  <div className="relative z-20 mb-8 flex justify-center lg:mb-10 shrink-0" aria-hidden="true">
                    <div className="hiw-seal relative flex h-[68px] w-[68px] items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: C.goldGradient,
                          boxShadow:
                            "0 6px 18px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(90,60,10,0.35)",
                        }}
                      />
                      <div
                        className="absolute inset-[3px] rounded-full border"
                        style={{ borderColor: "rgba(58,10,21,0.35)" }}
                      />
                      <span className="relative flex h-full w-full items-center justify-center" style={{ color: C.ink }}>
                        {STEP_ICONS[step.step]}
                      </span>
                    </div>
                  </div>

                  {/* Invitation card */}
                  <div
                    tabIndex={0}
                    className="hiw-card relative w-full max-w-[300px] flex flex-col flex-1 h-full focus-visible:outline-none"
                    aria-label={`Step ${step.step}: ${step.title}. ${step.description}`}
                  >
                    <div
                      className="hiw-card-surface relative flex flex-col flex-1 h-full overflow-hidden rounded-[4px]"
                      style={{
                        background: C.ivory,
                        boxShadow:
                          "0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 34px -14px rgba(0,0,0,0.55)",
                      }}
                    >
                      {/* Photo */}
                      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                            className="hiw-card-image object-cover"
                            aria-hidden="true"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(160deg, ${C.primary} 0%, ${C.ink} 100%)` }}
                            aria-hidden="true"
                          />
                        )}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(58,10,21,0) 55%, rgba(58,10,21,0.85) 100%)",
                          }}
                          aria-hidden="true"
                        />
                        <span
                          className="absolute left-3 top-3 rounded-[2px] px-2 py-[3px] text-[10px] font-semibold tracking-[0.14em]"
                          style={{
                            background: "rgba(253,248,236,0.92)",
                            color: C.ink,
                          }}
                        >
                          {String(step.step).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Card body — fixed-height zones so every card aligns regardless of copy length */}
                      <div className="relative flex flex-col flex-1 justify-between px-5 pb-6 pt-5 text-left min-h-[220px]">
                        <div>
                          <span
                            className="mb-2.5 block h-px w-8 shrink-0"
                            style={{ background: C.gold300 }}
                            aria-hidden="true"
                          />
                          <h3
                            className="mb-1.5 font-display text-xl font-semibold leading-tight"
                            style={{ color: C.ink, minHeight: "2.8rem" }}
                          >
                            {step.title}
                          </h3>
                          <p
                            className="hiw-clamp-3 text-[15px] font-medium leading-relaxed"
                            style={{ color: "rgba(58,10,21,0.85)", minHeight: "4.5rem" }}
                          >
                            {step.description}
                          </p>
                        </div>

                        {detail && (
                          <div className="mt-4 pt-3 border-t shrink-0" style={{ borderColor: "rgba(107,16,38,0.15)" }}>
                            <div className="hiw-detail-wrap">
                              <p
                                className="hiw-clamp-3 text-[14px] italic leading-relaxed font-medium"
                                style={{ color: "rgba(58,10,21,0.75)" }}
                              >
                                {detail}
                              </p>
                            </div>
                            <span className="hiw-readmore mt-3 flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.primary }}>
                              Read more
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                                <path d="M0.5 4H9M9 4L5.5 0.5M9 4L5.5 7.5" stroke="currentColor" strokeWidth="1.25" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Torn-edge bottom detail */}
                      <svg
                        className="absolute bottom-0 left-0 w-full translate-y-[1px]"
                        height="10"
                        viewBox="0 0 300 10"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M0,3 Q7.5,9 15,3 T30,3 T45,3 T60,3 T75,3 T90,3 T105,3 T120,3 T135,3 T150,3 T165,3 T180,3 T195,3 T210,3 T225,3 T240,3 T255,3 T270,3 T285,3 T300,3 L300,10 L0,10 Z"
                          fill={C.ink}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust badges */}
        <div className="hiw-trust-row mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t pt-10">
          {TRUST_BADGES.map((label) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
              <span style={{ color: C.gold300 }}>{TRUST_ICONS[label]}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/*
        Plain CSS only below — deliberately avoids Tailwind arbitrary-value
        utility classes (e.g. grid-rows-[0fr]) for anything load-bearing,
        since those depend on the project's Tailwind content/JIT config
        picking this file up. Real CSS classes always work regardless of
        Tailwind setup.
      */}
      <style>{`
        .hiw-section {
          background: linear-gradient(180deg, #fff 0%, var(--color-warm-50) 40%, var(--color-warm-100) 70%, var(--color-warm-50) 100%);
        }
        .hiw-trust-row {
          border-color: rgba(0,0,0,0.1);
        }
        .hiw-procession-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hiw-procession-card[data-in-view="true"] {
          opacity: 1;
          transform: translateY(0);
        }
        .hiw-seal {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hiw-card:hover .hiw-seal,
        .hiw-card:focus-visible .hiw-seal {
          transform: rotate(8deg) scale(1.06);
        }
        .hiw-card {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          height: 100%;
        }
        .hiw-card-surface {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          height: 100%;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hiw-card:hover .hiw-card-surface,
        .hiw-card:focus-visible .hiw-card-surface {
          transform: translateY(-8px);
        }
        .hiw-card-image {
          transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hiw-card:hover .hiw-card-image,
        .hiw-card:focus-visible .hiw-card-image {
          transform: scale(1.08);
        }
        .hiw-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hiw-detail-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }
        .hiw-detail-wrap > p {
          min-height: 0;
          overflow: hidden;
        }
        .hiw-card:hover .hiw-detail-wrap,
        .hiw-card:focus-visible .hiw-detail-wrap {
          grid-template-rows: 1fr;
        }
        .hiw-readmore {
          transition: opacity 0.3s ease;
        }
        .hiw-card:hover .hiw-readmore,
        .hiw-card:focus-visible .hiw-readmore {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-procession-card {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .hiw-card-surface,
          .hiw-card-image,
          .hiw-seal {
            transition: none;
          }
          .hiw-detail-wrap {
            grid-template-rows: 1fr;
          }
          .hiw-readmore {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
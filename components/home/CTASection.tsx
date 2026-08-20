"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Globe,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

const LEDGER_ITEMS = [
  {
    icon: <Globe size={15} aria-hidden="true" />,
    value: "Guests from Around the World",
    label: "Discover India through its celebrations",
  },
  {
    icon: <BadgeCheck size={15} aria-hidden="true" />,
    value: "Guest Guidance",
    label: "Attire, etiquette & experience details",
  },
  {
    icon: <ShieldCheck size={15} aria-hidden="true" />,
    value: "Clear Booking",
    label: "Transparent pricing & booking details",
  },
];

const CTA_IMAGE_PRIMARY =
  "https://images.unsplash.com/photo-1735052712489-f45220126a0c?w=1920&q=85&auto=format&fit=crop";
const CTA_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1671531776382-f32dff368120?w=1920&q=85&auto=format&fit=crop";

export function CTASection() {
  const [imgSrc, setImgSrc] = useState(CTA_IMAGE_PRIMARY);

  return (
    <section
      id="cta"
      className="py-16 sm:py-24 relative overflow-hidden"
      aria-labelledby="cta-heading"
      style={{ background: "var(--color-charcoal-950)" }}
    >
      {/* Warm celebration photographic background with visible Indian wedding couple */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={imgSrc}
          alt="Authentic Indian wedding couple embracing under traditional floral decorations"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-80 scale-105 transition-transform duration-1000"
          loading="lazy"
          onError={() => {
            if (imgSrc !== CTA_IMAGE_FALLBACK) setImgSrc(CTA_IMAGE_FALLBACK);
          }}
          aria-hidden="true"
        />

        {/* Luminous warm royal burgundy overlay (55-65% darkness) keeping the couple clearly visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(38, 5, 14, 0.58) 0%, rgba(20, 3, 8, 0.52) 50%, rgba(10, 1, 4, 0.72) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Subtle vignette for text readability */}
        <div
          className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/55"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-20 container-luxury">
        <div className="max-w-3xl mx-auto text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-amber-300 text-[0.6875rem] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-4 shadow-sm">
            Experience India Differently
          </div>

          {/* Headline */}
          <h2
            id="cta-heading"
            className="font-display font-bold text-white leading-tight tracking-tight mb-3 sm:mb-4 drop-shadow-md"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Come for the Celebration.
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #fcd34d 0%, #ffffff 40%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Leave with a Story.
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-white/95 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto drop-shadow-sm font-medium">
            Discover Indian weddings, meet welcoming families, and experience
            age-old traditions with clarity and confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10 w-full max-w-md mx-auto">
            <Link
              href="/weddings"
              className="btn btn-primary btn-md group w-full sm:w-auto font-bold px-7 py-3 rounded-xl shadow-lg shadow-maroon-950/60 justify-center text-sm sm:text-base"
            >
              <Heart size={16} aria-hidden="true" />
              <span>Explore Weddings</span>
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/how-it-works"
              className="btn btn-ghost-white btn-md w-full sm:w-auto font-bold px-6 py-3 rounded-xl justify-center text-sm sm:text-base bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-xs"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Trust Ledger */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4 pt-6 border-t border-white/20"
            aria-label="Guest experience information"
          >
            {LEDGER_ITEMS.map((item) => (
              <div
                key={item.value}
                className="flex flex-col items-center text-center px-2"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/25 text-amber-300 mb-1.5 shadow-xs">
                  {item.icon}
                </span>

                <span className="font-display text-white text-xs sm:text-sm font-bold tracking-wide drop-shadow-xs">
                  {item.value}
                </span>

                <span className="text-white/80 text-[0.6875rem] mt-0.5 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

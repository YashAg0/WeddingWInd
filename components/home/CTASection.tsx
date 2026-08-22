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

export function CTASection() {
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
          src={CTA_IMAGE_PRIMARY}
          alt="Authentic Indian wedding couple embracing under traditional floral decorations"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-80 scale-105 transition-transform duration-1000"
          loading="lazy"
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
              Leave with Cherished Memories.
            </span>
          </h2>

          {/* Description */}
          <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto font-normal">
            Whether it&apos;s a grand royal celebration in Rajasthan or a serene beach
            mandap in Goa, find the celebration that speaks to you.
          </p>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <Link
              href="/weddings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-full text-charcoal-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] text-sm"
              style={{
                background:
                  "linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)",
              }}
              aria-label="Explore upcoming Indian wedding celebrations"
            >
              <span>Explore Celebrations</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-full text-white/90 hover:text-white border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/15 backdrop-blur-sm transition-all duration-200 text-sm"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* 3 Value Pillars */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/15 text-left"
            role="list"
            aria-label="WeddingWithIndia commitments"
          >
            {LEDGER_ITEMS.map((item) => (
              <div
                key={item.value}
                className="flex items-start gap-2.5 bg-black/25 backdrop-blur-sm border border-white/10 rounded-xl p-3"
                role="listitem"
              >
                <span className="text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <div className="text-white text-xs font-bold leading-tight">
                    {item.value}
                  </div>
                  <div className="text-white/60 text-[0.6875rem] leading-tight mt-0.5">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-white/40 text-[0.6875rem]">
            <span>Crafted with</span>
            <Heart size={11} className="text-red-400 fill-red-400" aria-hidden="true" />
            <span>for authentic cultural discovery across India</span>
          </div>
        </div>
      </div>
    </section>
  );
}

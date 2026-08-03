import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Globe, Star, Lock } from "lucide-react";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";

export function CTASection() {
  return (
    <section
      id="cta"
      className="section-padding relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #5a0e20 0%, #6b1026 35%, #8b1630 65%, #6b1026 100%)",
          }}
        />
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gold accent glows */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold-500)] opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--color-gold-300)] opacity-8 blur-3xl" />
      </div>

      <div className="relative z-10 container-luxury">
        <div className="max-w-3xl mx-auto text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <Sparkles size={12} aria-hidden="true" />
            Your next adventure awaits
          </div>

          {/* Headline */}
          <h2
            id="cta-heading"
            className="font-display font-bold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            Ready to experience India&apos;s most{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fcd34d 0%, #c9972a 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              joyful celebrations?
            </span>
          </h2>

          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Join thousands of travellers who stepped beyond tourism and into the
            heart of Indian culture. Your seat at the table is waiting.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/weddings"
              className="btn btn-secondary btn-lg group w-full sm:w-auto"
            >
              <Heart size={18} aria-hidden="true" />
              Attend a Wedding
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/list-wedding"
              className="btn btn-ghost-white btn-lg w-full sm:w-auto"
            >
              List Your Wedding
            </Link>
          </div>

          {/* Social proof row */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
            aria-label="Social proof"
          >
            {[
              { icon: <Globe size={16} aria-hidden="true" />, text: `Guests from ${BUSINESS_METRICS.COUNTRIES_REPRESENTED} countries` },
              { icon: <Star size={16} aria-hidden="true" />, text: `${BUSINESS_METRICS.AVERAGE_RATING_LABEL} average rating` },
              { icon: <Lock size={16} aria-hidden="true" />, text: "Fully vetted & secure" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-white/60 text-sm"
              >
                <span className="text-white/40" aria-hidden="true">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ornament */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, transparent, #c9972a 30%, #fcd34d 50%, #c9972a 70%, transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}

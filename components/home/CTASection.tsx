import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Globe, Star, Lock } from "lucide-react";

export function CTASection() {
  return (
    <section
      id="cta"
      className="section-padding relative overflow-hidden"
      aria-labelledby="cta-heading"
      style={{ background: "var(--color-charcoal-950)" }}
    >
      <style>{`
        @keyframes ctaGlowDriftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-24px, 20px) scale(1.08); }
        }
        @keyframes ctaGlowDriftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -16px) scale(1.1); }
        }
        @keyframes ctaRise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cta-glow-a { animation: ctaGlowDriftA 14s ease-in-out infinite; }
        .cta-glow-b { animation: ctaGlowDriftB 16s ease-in-out infinite; }
        .cta-rise {
          opacity: 0;
          animation: ctaRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .cta-glow-a, .cta-glow-b { animation: none; }
          .cta-rise { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* Animated glow orbs — brand warmth in dark environment */}
      <div
        className="cta-glow-a pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.12]"
        style={{
          background: "radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="cta-glow-b pointer-events-none absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.09]"
        style={{
          background: "radial-gradient(circle, var(--color-gold-500) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container-luxury">
        <div className="max-w-3xl mx-auto text-center">
          {/* Label */}
          <div
            className="cta-rise inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles size={12} aria-hidden="true" />
            A World of Sacred Hospitality
          </div>

          {/* Headline */}
          <h2
            id="cta-heading"
            className="cta-rise font-display font-bold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", animationDelay: "90ms" }}
          >
            Step into a Celebration you will{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fcd34d 0%, #c9972a 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Remember Forever.
            </span>
          </h2>

          <p
            className="cta-rise text-white/70 text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ animationDelay: "180ms" }}
          >
            Step beyond ordinary sightseeing and into the warm embrace of a family.
            Your honorary seat at the table is waiting.
          </p>

          {/* CTAs */}
          <div
            className="cta-rise flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            style={{ animationDelay: "270ms" }}
          >
            <Link
              href="/weddings"
              className="btn btn-secondary btn-lg group w-full sm:w-auto transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              <Heart size={18} aria-hidden="true" />
              Explore Celebrations
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/list-wedding"
              className="btn btn-ghost-white btn-lg w-full sm:w-auto transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              Host Your Wedding
            </Link>
          </div>

          {/* Social proof row */}
          <div
            className="cta-rise flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
            style={{ animationDelay: "360ms" }}
            aria-label="Social proof"
          >
            {[
              { icon: <Globe size={16} aria-hidden="true" />, text: "Hand-vetted Host Families" },
              { icon: <Star size={16} aria-hidden="true" />, text: "Verified guest passes" },
              { icon: <Lock size={16} aria-hidden="true" />, text: "AES-256 encrypted security" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                <span className="text-white/40" aria-hidden="true">
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gold ornament line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, #c9972a 30%, #fcd34d 50%, #c9972a 70%, transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
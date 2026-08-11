import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Globe, BadgeCheck, ShieldCheck } from "lucide-react";

const LEDGER_ITEMS = [
  {
    icon: <Globe size={16} aria-hidden="true" />,
    value: "48 Countries",
    label: "Host families, hand-vetted",
  },
  {
    icon: <BadgeCheck size={16} aria-hidden="true" />,
    value: "100% Verified",
    label: "Every guest pass checked",
  },
  {
    icon: <ShieldCheck size={16} aria-hidden="true" />,
    value: "AES-256",
    label: "Payments, fully encrypted",
  },
];

export function CTASection() {
  return (
    <section
      id="cta"
      className="section-padding relative overflow-hidden"
      aria-labelledby="cta-heading"
      style={{ background: "var(--color-charcoal-950)" }}
    >
      <style>{`
        @keyframes ctaAuroraA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-26px, 22px) scale(1.08); }
        }
        @keyframes ctaAuroraB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(22px, -18px) scale(1.1); }
        }
        @keyframes ctaRise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaSealRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ctaPinPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.6); }
        }
        @keyframes ctaRouteFlow {
          to { stroke-dashoffset: -120; }
        }

        .cta-aurora { position: absolute; border-radius: 9999px; pointer-events: none; filter: blur(2px); }
        .cta-aurora-a {
          top: -8rem; left: -8rem; width: 500px; height: 500px; opacity: 0.12;
          background: radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%);
          animation: ctaAuroraA 14s ease-in-out infinite;
        }
        .cta-aurora-b {
          bottom: -8rem; right: -8rem; width: 600px; height: 600px; opacity: 0.09;
          background: radial-gradient(circle, var(--color-gold-500) 0%, transparent 70%);
          animation: ctaAuroraB 16s ease-in-out infinite;
        }

        .cta-grid {
          position: absolute; inset: 0; opacity: 0.035; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .cta-routes { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.22; pointer-events: none; }
        .cta-route-path { fill: none; stroke-width: 1; stroke-dasharray: 2 8; animation: ctaRouteFlow 26s linear infinite; }
        .cta-route-pin { animation: ctaPinPulse 4s ease-in-out infinite; }

        .cta-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 25%, transparent 35%, var(--color-charcoal-950) 92%);
        }

        .cta-rise { opacity: 0; animation: ctaRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        .cta-live-dot {
          position: relative; display: inline-block; width: 6px; height: 6px;
          border-radius: 9999px; background: var(--color-gold-500);
          animation: ctaPinPulse 2.4s ease-in-out infinite;
        }

        .cta-seal { position: relative; width: 80px; height: 80px; margin: 0 auto 24px; }
        .cta-seal-ring { position: absolute; inset: 0; animation: ctaSealRotate 44s linear infinite; }
        .cta-seal-mark { position: absolute; inset: 0; }

        .cta-btn-shine { position: relative; overflow: hidden; }
        .cta-btn-shine::after {
          content: ""; position: absolute; top: 0; left: -60%; width: 35%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg); transition: transform 0.7s ease;
        }
        .cta-btn-shine:hover::after { transform: translateX(260%) skewX(-20deg); }

        .cta-ledger-divider {
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent);
        }

        .cta-ornament-mark {
          width: 6px; height: 6px; transform: rotate(45deg); flex: none;
          background: linear-gradient(135deg, #fcd34d, #c9972a);
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-aurora-a, .cta-aurora-b, .cta-rise, .cta-seal-ring,
          .cta-route-path, .cta-route-pin, .cta-live-dot { animation: none !important; }
          .cta-rise { opacity: 1 !important; transform: none !important; }
          .cta-btn-shine::after { transition: none; }
        }
      `}</style>

      {/* Atmospheric Indian Wedding Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1600&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center filter blur-[1px] scale-105 opacity-65"
          loading="lazy"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20, 4, 9, 0.70) 0%, rgba(15, 2, 6, 0.75) 50%, rgba(12, 3, 7, 0.80) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Ambient brand-warmth glow */}
      <div className="cta-aurora cta-aurora-a z-10" aria-hidden="true" />
      <div className="cta-aurora cta-aurora-b z-10" aria-hidden="true" />

      {/* Quiet world-routes texture — the "world" in "World of Sacred Hospitality" made literal */}
      <svg className="cta-routes z-10" viewBox="0 0 1200 480" preserveAspectRatio="none" aria-hidden="true">
        <path className="cta-route-path" d="M600,300 Q380,180 150,110" stroke="#fcd34d" />
        <path className="cta-route-path" d="M600,300 Q480,150 420,60" stroke="#c9972a" style={{ animationDelay: "-6s" }} />
        <path className="cta-route-path" d="M600,300 Q660,180 730,120" stroke="#fcd34d" style={{ animationDelay: "-12s" }} />
        <path className="cta-route-path" d="M600,300 Q820,180 980,80" stroke="#c9972a" style={{ animationDelay: "-18s" }} />
        <circle className="cta-route-pin" cx="150" cy="110" r="3" fill="#fcd34d" />
        <circle className="cta-route-pin" cx="420" cy="60" r="3" fill="#c9972a" style={{ animationDelay: "-1s" }} />
        <circle className="cta-route-pin" cx="730" cy="120" r="3" fill="#fcd34d" style={{ animationDelay: "-2s" }} />
        <circle className="cta-route-pin" cx="980" cy="80" r="3" fill="#c9972a" style={{ animationDelay: "-3s" }} />
        <circle cx="600" cy="300" r="3" fill="#fcd34d" opacity="0.6" />
      </svg>

      {/* Subtle grid pattern */}
      <div className="cta-grid z-10" aria-hidden="true" />

      {/* Vignette keeps the center legible under all the ambient layers */}
      <div className="cta-vignette z-10" aria-hidden="true" />

      <div className="relative z-20 container-luxury">
        <div className="max-w-3xl mx-auto text-center">
          {/* Signature: a rotating seal, two interlocking rings at its heart */}
          <div className="cta-rise cta-seal" style={{ animationDelay: "0ms" }} aria-hidden="true">
            <svg className="cta-seal-ring" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="ctaSealGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#c9972a" />
                </linearGradient>
              </defs>
              <circle cx="48" cy="48" r="44" fill="none" stroke="url(#ctaSealGrad)" strokeWidth="1" strokeDasharray="2 6" strokeLinecap="round" />
            </svg>
            <svg className="cta-seal-mark" viewBox="0 0 96 96">
              <circle cx="40" cy="48" r="14" fill="none" stroke="#fcd34d" strokeWidth="2" opacity="0.9" />
              <circle cx="56" cy="48" r="14" fill="none" stroke="#c9972a" strokeWidth="2" opacity="0.9" />
            </svg>
          </div>

          {/* Label */}
          <div
            className="cta-rise inline-flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-sm border border-white/15 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-7"
            style={{ animationDelay: "80ms" }}
          >
            <span className="cta-live-dot" aria-hidden="true" />
            A World of Sacred Hospitality
          </div>

          {/* Headline */}
          <h2
            id="cta-heading"
            className="cta-rise font-display font-bold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", animationDelay: "160ms" }}
          >
            Step into a celebration you&apos;ll{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fcd34d 0%, #c9972a 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              remember forever.
            </span>
          </h2>

          <p
            className="cta-rise text-white/70 text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ animationDelay: "240ms" }}
          >
            Trade sightseeing for the warmth of a real family celebration.
            Your seat at the table is already waiting.
          </p>

          {/* CTAs */}
          <div
            className="cta-rise flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href="/weddings"
              className="btn btn-secondary btn-lg cta-btn-shine group w-full sm:w-auto transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
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

          {/* Trust ledger */}
          <div
            className="cta-rise flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0"
            style={{ animationDelay: "400ms" }}
            aria-label="Trust and safety"
          >
            {LEDGER_ITEMS.map((item, i) => (
              <div key={item.value} className="flex items-center">
                {i > 0 && (
                  <span className="cta-ledger-divider hidden sm:block w-px h-10 mx-8" aria-hidden="true" />
                )}
                <div className="flex flex-col items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[var(--color-gold-500)] mb-2">
                    {item.icon}
                  </span>
                  <span className="font-display text-white text-sm font-semibold tracking-wide">
                    {item.value}
                  </span>
                  <span className="text-white/45 text-[11px] uppercase tracking-wider mt-0.5">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ornament: gold lines meeting at a center mark */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-3 px-8" aria-hidden="true">
        <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #c9972a 60%, #fcd34d)" }} />
        <span className="cta-ornament-mark" />
        <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, #fcd34d, #c9972a 40%, transparent)" }} />
      </div>
    </section>
  );
}
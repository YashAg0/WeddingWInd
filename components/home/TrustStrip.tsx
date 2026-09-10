import { ShieldCheck, Lock, Headset, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TrustPillar {
  icon: typeof ShieldCheck;
  title: string;
  badge: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}

const TRUST_PILLARS: TrustPillar[] = [
  {
    icon: ShieldCheck,
    title: "100% KYC Verified Hosts",
    badge: "Vetted Celebrations",
    description:
      "Every host couple undergoes multi-point government ID, background, and venue sanctity verification.",
    linkHref: "/trust?tab=safety#verification",
    linkLabel: "Verification standards",
  },
  {
    icon: Lock,
    title: "Escrow & 4-Tier Refund",
    badge: "Payment Protection",
    description:
      "Host payouts are held secure in escrow until ceremony check-in with transparent 90%/70%/40% refund tiers.",
    linkHref: "/trust?tab=terms#cancellation",
    linkLabel: "Refund terms",
  },
  {
    icon: Headset,
    title: "Dedicated Cultural Concierge",
    badge: "24/7 Guest Liaison",
    description:
      "On-ground coordinator guidance for attire, ritual etiquette, schedule navigation, and live assistance.",
    linkHref: "/trust?tab=safety#guest-guide",
    linkLabel: "Guest safety guide",
  },
  {
    icon: QrCode,
    title: "All-Inclusive Guest Pass",
    badge: "AES-256 Encrypted",
    description:
      "Cryptographic QR passes covering all ceremonies, feasts, and hospitality with zero hidden fees.",
    linkHref: "/trust?tab=terms#booking-terms",
    linkLabel: "Pass details",
  },
];

export function TrustStrip() {
  return (
    <section
      className="relative z-10 -mt-8 sm:-mt-12 mb-6 sm:mb-12 container-luxury"
      aria-label="Platform Trust & Safety Guarantees"
    >
      <div className="bg-white/95 backdrop-blur-md border border-warm-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-charcoal-900/5">
        {/* Header Eyebrow */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-6 border-b border-warm-200/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-primary)]" />
            <span className="text-xs font-bold tracking-widest uppercase text-charcoal-500">
              WeddingWithIndia Traveler Guarantee
            </span>
          </div>
          <Link
            href="/trust"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors"
          >
            <span>Explore our full Trust & Safety Portal</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* 4-Column Static Trust Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group flex flex-col justify-between p-4 rounded-xl bg-warm-50/50 hover:bg-warm-50 border border-warm-200/50 hover:border-amber-300 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-warm-200/80 text-[var(--color-brand-primary)] shadow-2xs group-hover:bg-maroon-50 transition-colors">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-[0.625rem] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-900 mb-1 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-200/40">
                  <Link
                    href={pillar.linkHref}
                    className="inline-flex items-center gap-1 text-[0.6875rem] font-bold text-charcoal-700 hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    <span>{pillar.linkLabel}</span>
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

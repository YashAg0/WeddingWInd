"use client";

import { ShieldCheck, HeartHandshake, Ticket, Headset, Globe, BadgeCheck } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: <ShieldCheck size={18} aria-hidden="true" />,
    text: "Verified Host Families",
  },
  {
    icon: <HeartHandshake size={18} aria-hidden="true" />,
    text: "Authentic Traditions",
  },
  {
    icon: <Ticket size={18} aria-hidden="true" />,
    text: "All-Inclusive Guest Pass",
  },
  {
    icon: <Headset size={18} aria-hidden="true" />,
    text: "Dedicated Concierge",
  },
  {
    icon: <Globe size={18} aria-hidden="true" />,
    text: "Guests from 48+ Nations",
  },
  {
    icon: <BadgeCheck size={18} aria-hidden="true" />,
    text: "Transparent USD Pricing",
  },
];

export function TrustStrip() {
  // Duplicate items for seamless loop
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section
      className="overflow-hidden py-4 sm:py-5 border-y border-warm-200/60"
      style={{ background: "linear-gradient(90deg, var(--color-warm-100) 0%, #fff 50%, var(--color-warm-100) 100%)" }}
      aria-label="Platform trust signals"
    >
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .trust-marquee {
          display: flex;
          width: max-content;
          animation: marqueeScroll 28s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-marquee { animation: none; }
        }
      `}</style>

      <div className="trust-marquee" aria-hidden="true">
        {items.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 flex-shrink-0"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border border-maroon-200/60 bg-maroon-50 text-[var(--color-brand-primary)] flex-shrink-0"
            >
              {item.icon}
            </span>
            <span className="text-sm font-semibold text-charcoal-700 whitespace-nowrap">
              {item.text}
            </span>
            <span className="text-warm-300 text-xl ml-4" aria-hidden="true">·</span>
          </div>
        ))}
      </div>

      {/* Screen-reader accessible list */}
      <ul className="sr-only" aria-label="Trust signals">
        {TRUST_ITEMS.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ul>
    </section>
  );
}

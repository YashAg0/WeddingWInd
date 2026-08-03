"use client";

import { Search, Layers, ShieldCheck, Heart, Sparkles } from "lucide-react";

export function GuestJourneyDiagram() {
  const steps = [
    {
      num: "01",
      title: "Search Weddings",
      desc: "Browse authentic celebrations across Rajasthan, Goa, Punjab, & Kerala.",
      icon: Search,
    },
    {
      num: "02",
      title: "Select Tier",
      desc: "Choose from 4 tiers: Cultural, Celebration, Immersive, or Premium Hosted.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Secure Checkout",
      desc: "Book with confidence. Fees are safely held in trust until check-in.",
      icon: ShieldCheck,
    },
    {
      num: "04",
      title: "Attend & Celebrate",
      desc: "Receive traditional attire, host greetings, feast, and 24/7 liaison.",
      icon: Heart,
    },
  ];

  return (
    <div className="w-full bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100/50">
          <Sparkles size={12} /> Guest Experience Journey
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
          How Guest Booking Works
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.num}
              className="bg-warm-50/60 border border-warm-200/60 p-5 rounded-2xl relative flex flex-col justify-between space-y-3 group hover:border-maroon-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-warm-200/60 text-[var(--color-brand-primary)] flex items-center justify-center shadow-xs">
                  <IconComponent size={20} />
                </div>
                <span className="font-display font-black text-2xl text-charcoal-300">
                  {step.num}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  {step.title}
                </h4>
                <p className="text-charcoal-600 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

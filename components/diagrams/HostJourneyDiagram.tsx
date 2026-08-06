"use client";

import { FileText, ShieldCheck, Globe, Users, DollarSign, Sparkles } from "lucide-react";

export function HostJourneyDiagram() {
  const steps = [
    {
      num: "01",
      title: "Submit Application",
      desc: "Provide wedding details, date, venue, photos, and guest capacity.",
      icon: FileText,
    },
    {
      num: "02",
      title: "Verification Gate",
      desc: "Celebration stays Pending Verification while background & venue checks complete.",
      icon: ShieldCheck,
      highlight: true,
    },
    {
      num: "03",
      title: "Celebration Goes Live",
      desc: "Once verified, your celebration becomes visible to screened global guests.",
      icon: Globe,
    },
    {
      num: "04",
      title: "Welcome Guests",
      desc: "Travelers attend as family guests under full local coordinator support.",
      icon: Users,
    },
    {
      num: "05",
      title: "Receive 78% Share",
      desc: "Your 78% host payout is released to your bank account 3 days post-event.",
      icon: DollarSign,
    },
  ];

  return (
    <div className="w-full bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100/50">
          <Sparkles size={12} /> Host Family Journey
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
          How Hosting Your Wedding Works
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.num}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                step.highlight
                  ? "bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/40"
                  : "bg-warm-50/60 border-warm-200/60 hover:border-maroon-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                    step.highlight
                      ? "bg-amber-100 text-amber-800"
                      : "bg-white border border-warm-200/60 text-[var(--color-brand-primary)]"
                  }`}
                >
                  <IconComponent size={18} />
                </div>
                <span className="font-display font-black text-xl text-charcoal-300">
                  {step.num}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-charcoal-900">
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

"use client";

import { UserCheck, Key, Share2, CheckCircle2, Award, AlertTriangle } from "lucide-react";

export function AgentJourneyDiagram() {
  const steps = [
    {
      num: "01",
      title: "10-Min Application",
      desc: "Apply with contact details & target referral focus. No fees or stipends.",
      icon: UserCheck,
    },
    {
      num: "02",
      title: "Get Referral Code",
      desc: "Receive unique identifier WWI-AGENT-XXXX for tracking.",
      icon: Key,
    },
    {
      num: "03",
      title: "Share Link",
      desc: "Introduce foreign travelers (Tiered Payout) or Indian host families (4%).",
      icon: Share2,
    },
    {
      num: "04",
      title: "Booking Cleared",
      desc: "Referred guest completes experience & funds clear post-event.",
      icon: CheckCircle2,
    },
    {
      num: "05",
      title: "Receive Commission",
      desc: "tiered traveler or 4% host payout released to your account.",
      icon: Award,
    },
  ];

  return (
    <div className="w-full bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100/50">
          <Award size={12} /> Agent Referral Flow
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
          How Agent Referrals & Commissions Work
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.num}
              className="bg-warm-50/60 border border-warm-200/60 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-maroon-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="w-9 h-9 rounded-xl bg-white border border-warm-200/60 text-[var(--color-brand-primary)] flex items-center justify-center shadow-xs">
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

      {/* Unmissable Diagram Annotation */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs font-semibold leading-relaxed">
        <AlertTriangle size={18} className="text-amber-700 flex-shrink-0" />
        <div>
          <strong>Unmissable Payout Rule:</strong> Commissions are paid <em>only after</em> the referred booking status is <code>Completed & Cleared</code>. No payouts for signups, leads, or registrations alone.
        </div>
      </div>
    </div>
  );
}

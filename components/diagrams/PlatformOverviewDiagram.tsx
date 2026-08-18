"use client";

import { CreditCard, Award, Compass, Percent } from "lucide-react";

export function PlatformOverviewDiagram() {
  return (
    <div className="w-full bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100/50">
          <Percent size={12} /> Unit Economics Architecture
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
          Platform Revenue & Commission Model
        </h3>
      </div>

      {/* Diagram Layout */}
      <div className="space-y-6">
        {/* Step 1: Guest Payment */}
        <div className="bg-warm-50 border border-warm-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-warm-200 text-charcoal-900 flex items-center justify-center shadow-xs">
              <CreditCard size={20} />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-charcoal-900">1. Guest Booking Payment</h4>
              <p className="text-xs text-charcoal-500">Clean USD All-Inclusive Pass ($149 – $1,199 / guest)</p>
            </div>
          </div>
          <span className="font-display font-bold text-lg text-charcoal-900">100% Core Value (USD)</span>
        </div>

        {/* Step 2: Fixed Host Payout & Platform Ops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Guaranteed Host Payout</span>
              <span className="font-display font-bold text-xl text-emerald-300">₹5,101 — ₹61,101</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Guaranteed fixed INR payout per attending guest locked by experience tier and duration, disbursed post-ceremony.
            </p>
          </div>

          <div className="bg-maroon-900 text-white p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Platform Contribution & Ops</span>
              <span className="font-display font-bold text-xl text-gradient-gold">WWI Operations</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Covers payment processing, currency exchange, operating reserves, and 24/7 guest concierge.
            </p>
          </div>
        </div>

        {/* Step 3: Referral Carve-out & OpEx */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Award size={16} className="text-amber-700" />
              <span>Fixed Agent Referral Payouts (₹511 – ₹2,511)</span>
            </div>
            <p className="text-amber-900 leading-normal">
              Fixed INR commission per attending guest awarded to accredited agents following successful event clearance.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-purple-950">
              <Compass size={16} className="text-purple-700" />
              <span>Dedicated On-Ground Coordinators</span>
            </div>
            <p className="text-purple-900 leading-normal">
              Bilingual wedding liaisons assist host families and guide international guests through rituals seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

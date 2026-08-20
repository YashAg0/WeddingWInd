"use client";

import Link from "next/link";
import { Users, ShieldCheck, ArrowRight, Award, CheckCircle, AlertTriangle, Briefcase, Globe } from "lucide-react";
import { AgentJourneyDiagram } from "@/components/diagrams/AgentJourneyDiagram";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AGENT_PAYOUT_MATRIX_INR } from "@/lib/constants/financial-model";

export default function ForAgentsPage() {
  const minAgentPayoutINR = AGENT_PAYOUT_MATRIX_INR.STANDARD; // ₹511
  const maxAgentPayoutINR = AGENT_PAYOUT_MATRIX_INR.SIGNATURE_ROYAL; // ₹2,511

  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      
      {/* Hero Section */}
      <section className="container-luxury text-center max-w-4xl mb-16 space-y-5">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Briefcase size={13} />
          Freelance Referral Agent Programme
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight">
          Earn Independent Commissions <br className="hidden sm:inline" />
          <span className="text-gradient-brand">Sharing Authentic Culture</span>
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Open to anyone worldwide. Refer international guests or Indian host families and earn up to ₹1,800 per completed booking.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/for-agents/apply"
            className="btn btn-primary btn-lg shadow-lg font-bold flex items-center gap-2"
          >
            Become an Agent Now
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/for-agents/dashboard"
            className="btn btn-secondary btn-lg font-bold border-warm-300"
          >
            Access Agent Dashboard
          </Link>
        </div>
      </section>

      {/* Two Ways to Earn Grid */}
      <section className="container-luxury max-w-5xl mb-20 space-y-8">
        <SectionHeader
          label="Honest Earnings"
          title="Two Direct Ways to Earn"
          highlightedWord="Ways to Earn"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Way 1: Traveler Referrals */}
          <div className="bg-white border border-warm-200/60 p-8 rounded-[2rem] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-display font-bold text-xl">
                <Globe size={22} />
              </div>
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">
                Guest-Side Referral
              </span>
              <h3 className="font-display font-bold text-2xl text-charcoal-900">
                ₹511 to ₹2,511 / Guest
              </h3>
              <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
                Refer international guests who reserve any celebration tier. Earn fixed INR payouts per eligible attending guest: Standard (₹511), Enhanced (₹1,011), Grand (₹1,511), Royal (₹2,011), Signature Royal (₹2,511).
              </p>
              <ul className="space-y-2 text-xs text-charcoal-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Unique trackable agent referral code</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Paid post-event after booking is completed & verified</span>
                </li>
              </ul>
            </div>

            <div className="bg-warm-50 border border-warm-200 p-4 rounded-xl text-center">
              <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider block">Guest Referral Payout Range</span>
              <span className="font-display font-bold text-xl text-[var(--color-brand-primary)]">₹511 — ₹2,511 / guest</span>
            </div>
          </div>

          {/* Way 2: Host Referrals */}
          <div className="bg-white border border-warm-200/60 p-8 rounded-[2rem] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-display font-bold text-xl">
                <Users size={22} />
              </div>
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">
                Host-Side Referral
              </span>
              <h3 className="font-display font-bold text-2xl text-charcoal-900">
                4% Host Referral Incentive
              </h3>
              <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
                Refer Indian families who share their celebration as host couples. Earn 4% referral incentive when international guests complete their attendance.
              </p>
              <ul className="space-y-2 text-xs text-charcoal-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Applies to hosts onboarded via your link</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Verified family host approval required</span>
                </li>
              </ul>
            </div>

            <div className="bg-warm-50 border border-warm-200 p-4 rounded-xl text-center">
              <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider block">Host Referral Commission</span>
              <span className="font-display font-bold text-xl text-[var(--color-brand-primary)]">4% of Booking Value</span>
            </div>
          </div>
        </div>
      </section>

      {/* On-Site Agent Explainer Diagram */}
      <section className="container-luxury max-w-5xl mb-20">
        <AgentJourneyDiagram />
      </section>

      {/* Explicit Rules & Anti-MLM Terms */}
      <section className="container-luxury max-w-4xl bg-white border border-warm-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Clear & Transparent Programme Terms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-warm-50/70 border border-warm-200 p-5 rounded-2xl space-y-2">
            <h4 className="font-sans font-bold text-sm text-charcoal-900 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              Success-Based Payouts Only
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              Commissions are paid only when a referred guest completes their cultural experience and funds are cleared. No fake lead payouts, no registration fees, and no upfront costs ever.
            </p>
          </div>

          <div className="bg-warm-50/70 border border-warm-200 p-5 rounded-2xl space-y-2">
            <h4 className="font-sans font-bold text-sm text-charcoal-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              Strict Anti-MLM Structure
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              Agents are independent referral partners. You earn strictly on direct guest or host referrals. There are no downline tiers, multi-level structures, or commissions for recruiting other agents.
            </p>
          </div>

          <div className="bg-warm-50/70 border border-warm-200 p-5 rounded-2xl space-y-2">
            <h4 className="font-sans font-bold text-sm text-charcoal-900 flex items-center gap-2">
              <Briefcase size={16} className="text-maroon-800" />
              No Fixed Salary or Stipend
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              This is a flexible freelance partner role with zero fixed salaries or mandatory quotas. Earn as much as your network generates on your own schedule.
            </p>
          </div>

          <div className="bg-warm-50/70 border border-warm-200 p-5 rounded-2xl space-y-2">
            <h4 className="font-sans font-bold text-sm text-charcoal-900 flex items-center gap-2">
              <Award size={16} className="text-maroon-800" />
              Automated Code Tracking
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              Every approved agent receives a unique tracking identifier format <code>WWI-AGENT-XXXX</code> for direct link attribution in our system.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxury text-center max-w-2xl mx-auto space-y-6">
        <h2 className="font-display font-bold text-3xl text-charcoal-900">
          Ready to Start Earning?
        </h2>
        <p className="text-charcoal-500 text-sm leading-relaxed">
          Application takes approximately 10 minutes. Get instant access to your referral code and promotional materials.
        </p>
        <Link
          href="/for-agents/apply"
          className="btn btn-primary btn-lg shadow-lg font-bold inline-flex items-center gap-2"
        >
          Complete 10-Min Application
          <ArrowRight size={16} />
        </Link>
      </section>

    </div>
  );
}

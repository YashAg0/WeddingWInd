"use client";

import { motion } from "framer-motion";
import { Users, Award, ShieldCheck, DollarSign, ArrowRight, Eye, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    title: "Student Ambassadors",
    description: "Perfect for students studying abroad. Share unique invitations with study groups and college societies. Earn pocket money while sharing culture.",
    icon: "🎓"
  },
  {
    title: "Travel Agencies",
    description: "Add authentic Indian wedding invitations to your agency's standard luxury packages or group tour itineraries. Expand your travel catalog.",
    icon: "✈️"
  },
  {
    title: "Influencers & Bloggers",
    description: "Create video content about the world's most vibrant celebrations. Share your custom links with your followers to monetize your travel content.",
    icon: "🤳"
  }
];

const leaderboards = [
  { rank: 1, name: "Sophia Laurent", program: "Influencer", referrals: 42, earnings: "$9,450" },
  { rank: 2, name: "David Kim", program: "Travel Agent", referrals: 35, earnings: "$7,875" },
  { rank: 3, name: "Lucas Müller", program: "Student Ambassador", referrals: 24, earnings: "$5,400" },
  { rank: 4, name: "Elena Rossi", program: "Influencer", referrals: 18, referralsCount: 18, earnings: "$4,050" }
];

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero */}
      <section className="container-luxury text-center max-w-3xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Users size={12} />
          Partnerships
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight">
          Partners in <span className="text-gradient-brand">Celebration</span>
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
          Invite global travelers to experience the magic of authentic Indian weddings. Earn premium commissions on every verified booking.
        </p>
      </section>

      {/* Program Types Grid */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {programs.map((p) => (
          <div key={p.title} className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4">
            <span className="text-3xl inline-block" aria-hidden="true">{p.icon}</span>
            <h3 className="font-display font-bold text-lg text-charcoal-900">{p.title}</h3>
            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">{p.description}</p>
          </div>
        ))}
      </section>

      {/* Commission Model Table */}
      <section className="container-luxury max-w-4xl bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center shadow-sm">
            <DollarSign size={18} />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Commission Structure & Tiers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-warm-200 text-xs font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                <th className="p-4 rounded-tl-xl">Volume Tier</th>
                <th className="p-4">Monthly Bookings</th>
                <th className="p-4">Commission Rate</th>
                <th className="p-4 rounded-tr-xl">Additional Perks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 text-xs sm:text-sm text-charcoal-600">
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Tier 1 (Silver)</td>
                <td className="p-4">1 - 5 Bookings</td>
                <td className="p-4 font-semibold text-[var(--color-brand-primary)]">10.0%</td>
                <td className="p-4">Standard support & portal access</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Tier 2 (Gold)</td>
                <td className="p-4">6 - 20 Bookings</td>
                <td className="p-4 font-semibold text-[var(--color-brand-primary)]">12.5%</td>
                <td className="p-4">Dedicated Slack channel access</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Tier 3 (Platinum)</td>
                <td className="p-4">21+ Bookings</td>
                <td className="p-4 font-semibold text-[var(--color-brand-primary)]">15.0%</td>
                <td className="p-4">Dedicated account manager & early catalog bookings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Leaderboard Mock */}
      <section className="container-luxury max-w-3xl mb-20 space-y-8">
        <SectionHeader
          label="Top Partners"
          title="Commission Leaderboard"
          highlightedWord="Leaderboard"
        />

        <div className="bg-white border border-warm-200/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-warm-200 bg-warm-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">Rankings</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <Sparkles size={11} />
              Updated hourly
            </span>
          </div>

          <div className="divide-y divide-warm-100">
            {leaderboards.map((l) => (
              <div key={l.rank} className="p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-display font-black text-charcoal-400 w-5 text-center">
                    #{l.rank}
                  </span>
                  <div>
                    <div className="font-bold text-charcoal-800">{l.name}</div>
                    <div className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider">{l.program}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--color-brand-primary)]">{l.earnings}</div>
                  <div className="text-[0.625rem] text-charcoal-400">{l.referrals} referrals</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Portal Feature Section */}
      <section className="container-luxury max-w-4xl mb-20 space-y-8">
        <SectionHeader
          label="Partner Portal"
          title="Agent Dashboard Features"
          highlightedWord="Features"
        />

        <div className="relative rounded-[2.5rem] overflow-hidden border border-warm-300 shadow-xl bg-charcoal-900 p-8 sm:p-12 text-white">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full">
              <Sparkles size={14} /> Live Partner Dashboard
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Track conversions, referrals & payouts in real-time
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Every certified agent receives a unique tracking code, dynamic referral links, automated 5.0% commission calculations, and instant monthly payout requests.
            </p>
            <div className="pt-2">
              <Link
                href="/login?redirect_url=/dashboard/referrals"
                className="btn btn-secondary btn-md inline-flex gap-2"
              >
                Access Partner Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="container-luxury text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Start earning commission today
          </h2>
          <p className="text-charcoal-500 text-sm max-w-md mx-auto">
            Become a certified brand ambassador or travel agency partner. Monetize your invitations and cultural travel guides.
          </p>
          <Link
            href="/login?redirect_url=/dashboard/referrals"
            className="btn btn-primary btn-lg shadow-lg group inline-flex gap-2"
          >
            Become a Partner
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}

import React from "react";
import { getAgentGrowthStats } from "@/lib/actions/referrals";
import ClientReferralCenter from "./ClientReferralCenter";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const stats = await getAgentGrowthStats();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Referral Link Center
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Share your custom referral links, generate QR codes, and monitor campaign performance.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Referral Clicks
          </span>
          <div className="text-xl font-display font-black text-charcoal-900">
            {stats.clicks}
          </div>
          <p className="text-[10px] text-charcoal-500">Total visits recorded</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Referred Signups
          </span>
          <div className="text-xl font-display font-black text-charcoal-900">
            {stats.signups}
          </div>
          <p className="text-[10px] text-charcoal-500">
            Conversion Rate: {stats.clicks > 0 ? ((stats.signups / stats.clicks) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Onboarded Leads
          </span>
          <div className="text-xl font-display font-black text-charcoal-900">
            {stats.onboarded}
          </div>
          <p className="text-[10px] text-charcoal-500">Completed onboarding steps</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Converted Sales
          </span>
          <div className="text-xl font-display font-black text-maroon-800">
            {stats.converted}
          </div>
          <p className="text-[10px] text-charcoal-500">Earned commission conversions</p>
        </div>
      </div>

      {/* Interactive Link Builder (Client Component) */}
      <ClientReferralCenter referralCode={stats.referralCode} />
    </div>
  );
}

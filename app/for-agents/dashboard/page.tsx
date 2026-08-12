"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Award, AlertTriangle, Globe, Share2, TrendingUp, Calendar } from "lucide-react";
import { calculateBookingFinancials, formatCurrencyINR, formatSecondaryCurrency } from "@/lib/constants/financial-model";
import { BOOKING_STATUS_CONFIG } from "@/lib/constants/status";

interface AgentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  focusArea: string;
  networkType: string;
  networkDetails: string;
  status: string;
  code: string;
}

interface AgentBooking {
  id: string;
  agentCode: string;
  weddingTitle: string;
  guestName: string;
  guestsCount: number;
  tierName: string;
  coreBookingValueINR: number;
  status: string;
}

interface MonthlyStat {
  month: string;
  count: number;
  value: number;
  commission: number;
}

export default function AgentDashboardPage() {
  const [activeAgent, setActiveAgent] = useState<AgentProfile | null>(null);
  const [agentBookings, setAgentBookings] = useState<AgentBooking[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareMsgCopied, setShareMsgCopied] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/agents/dashboard");
        const data = await res.json();
        if (res.ok) {
          setActiveAgent(data.activeAgent);
          setAgentBookings(data.agentBookings || []);
          setMonthlyStats(data.monthlyStats || []);
        }
      } catch (err) {
        console.error("Failed to load agent dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const agentCode = activeAgent?.code || "WWI-AGENT-8921X";
  const referralLink = `https://weddingwithindia.com/?ref=${agentCode}`;
  const preformattedShareMessage = `Explore authentic Indian weddings as a global guest with WeddingWithIndia! Use my referral code ${agentCode} or link: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(preformattedShareMessage);
    setShareMsgCopied(true);
    setTimeout(() => setShareMsgCopied(false), 2000);
  };

  const clearedBookings = agentBookings.filter((b) => b.status === "cleared");
  const totalTravelerCommissionClearedINR = clearedBookings.reduce((sum, b) => {
    const financials = calculateBookingFinancials(b.coreBookingValueINR, true);
    return sum + financials.agentReferralINR;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 pt-28 pb-20 flex items-center justify-center">
        <div className="text-charcoal-400 text-sm font-medium animate-pulse">Loading agent dashboard from database…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
              <Award size={12} />
              Referral Partner Portal
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              Agent Dashboard
            </h1>
          </div>

          <div className="bg-white border border-warm-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xs">
            <div>
              <span className="text-[0.625rem] text-charcoal-400 font-bold uppercase tracking-wider block">Agent Identifier</span>
              <span className="font-mono font-bold text-sm text-[var(--color-brand-primary)]">{agentCode}</span>
            </div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active Partner" />
          </div>
        </div>

        {/* Anti-MLM Permanent Policy Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Permanent Anti-MLM Policy:</strong> You are paid only for your own direct traveler (7%) or host (4%) referrals that complete and clear. There is no override or downline commission structure.
          </div>
        </div>

        {/* Phase 2.2: Shareable Referral Link Generator UI */}
        <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Share2 size={18} className="text-[var(--color-brand-primary)]" />
                Referral Link & Invitation Generator
              </h3>
              <p className="text-xs text-charcoal-500">Share your tracking link or pre-formatted invitation message to attribute traveler bookings.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
              7% Traveler · 4% Host
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-charcoal-700 block">Your Direct Tracking URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="input-luxury flex-1 bg-warm-50 font-mono text-xs text-charcoal-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  {copied ? "Copied Link" : "Copy Link"}
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-charcoal-700 block">Pre-Formatted Social Share Message</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-700 flex-1 italic">
                  &quot;{preformattedShareMessage}&quot;
                </div>
                <button
                  onClick={handleCopyMessage}
                  className="btn btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 self-end sm:self-center"
                >
                  {shareMsgCopied ? <Check size={14} className="text-emerald-900" /> : <Copy size={14} />}
                  {shareMsgCopied ? "Copied Message" : "Copy Message"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Attributed Leads</span>
            <div className="font-display font-bold text-3xl text-charcoal-900">
              {agentBookings.length}
            </div>
            <span className="text-[0.6875rem] text-charcoal-500 font-medium">Active referral pipeline</span>
          </div>

          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Cleared Payouts</span>
            <div className="font-display font-bold text-3xl text-emerald-600">
              {clearedBookings.length}
            </div>
            <span className="text-[0.6875rem] text-charcoal-500 font-medium">Completed & cleared</span>
          </div>

          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Total Cleared Commission (7%)</span>
            <div className="font-display font-bold text-3xl text-[var(--color-brand-primary)]">
              {formatCurrencyINR(totalTravelerCommissionClearedINR)}
            </div>
            <span className="text-[0.6875rem] text-charcoal-500 font-medium">
              {formatSecondaryCurrency(totalTravelerCommissionClearedINR)}
            </span>
          </div>
        </div>

        {/* Phase 2.2: Performance-Over-Time View */}
        <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-warm-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                Performance Over Time (Monthly Pipeline)
              </h3>
              <p className="text-xs text-charcoal-500">Real aggregate referrals and commissions grouped by timestamp.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {monthlyStats.length > 0 ? (
              monthlyStats.map((st) => (
                <div key={st.month} className="bg-warm-50/70 p-4 rounded-2xl border border-warm-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-charcoal-500">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {st.month}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{st.count} Bookings</span>
                  </div>
                  <div className="font-display font-bold text-xl text-charcoal-900">{formatCurrencyINR(st.value)}</div>
                  <div className="text-[0.6875rem] text-[var(--color-brand-primary)] font-semibold">
                    Commission: {formatCurrencyINR(st.commission)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-charcoal-400">
                No monthly booking history yet. Share your referral link to start building your pipeline!
              </div>
            )}
          </div>
        </div>

        {/* Traveler Referral Ledger (7%) */}
        <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-warm-200 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Globe size={18} className="text-[var(--color-brand-primary)]" />
                Traveler Referral Ledger (7%)
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">Commissions are payable ONLY after booking status is Completed & Cleared.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Cleared: {formatCurrencyINR(totalTravelerCommissionClearedINR)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-warm-200 text-xs font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50/50">
                  <th className="p-4">Ref Code</th>
                  <th className="p-4">Referred Guest</th>
                  <th className="p-4">Experience Tier</th>
                  <th className="p-4">Booking Status</th>
                  <th className="p-4">Commission (7%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-xs text-charcoal-700">
                {agentBookings.map((item) => {
                  const statusConfig = BOOKING_STATUS_CONFIG[item.status as keyof typeof BOOKING_STATUS_CONFIG] || BOOKING_STATUS_CONFIG["cleared"];
                  const isCleared = item.status === "cleared";
                  const financials = calculateBookingFinancials(item.coreBookingValueINR, true);

                  return (
                    <tr key={item.id} className="hover:bg-warm-50/40">
                      <td className="p-4 font-mono font-semibold text-charcoal-900">{item.id}</td>
                      <td className="p-4 font-bold text-charcoal-900">{item.guestName}</td>
                      <td className="p-4 font-medium">{item.tierName} ({formatCurrencyINR(item.coreBookingValueINR)})</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider border ${statusConfig.badgeClass}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {isCleared ? (
                          <div>
                            <span className="font-bold text-emerald-700 text-sm">
                              {formatCurrencyINR(financials.agentReferralINR)}
                            </span>
                            <span className="text-[0.625rem] text-charcoal-400 font-mono block">
                              Exact 7%: ₹{financials.exactAgentReferralINR.toFixed(2)}
                            </span>
                            <span className="text-[0.625rem] font-bold text-emerald-800 uppercase tracking-wider block">
                              ✓ Cleared & Payable
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-charcoal-400 italic">
                              Pipeline (Pending Event)
                            </span>
                            <span className="text-[0.625rem] text-charcoal-400 block">
                              Calculated post-clearance
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

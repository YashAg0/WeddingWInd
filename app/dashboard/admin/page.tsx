"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, Users, Compass, DollarSign, ArrowRight, Building2, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrencyINR, formatSecondaryCurrency } from "@/lib/constants/financial-model";

interface OverviewData {
  pendingHostsCount: number;
  pendingAgentsCount: number;
  totalWeddingsCount: number;
  totalAgentsCount: number;
  totalBookingsCount: number;
  bookingsByStatus: Record<string, number>;
  totalVolume: number;
  platformCommissionAccrued: number | null;
  platformCommissionAvailable: boolean;
  agentCommissionAccrued: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setError(json.error || "Failed to load live metrics.");
      }
    } catch (err: any) {
      console.error("Failed to load admin overview:", err);
      setError("Network or database connection issue. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
            <ShieldCheck size={12} />
            Internal Operations Control Hub
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Real-Time Platform Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 text-xs font-semibold text-charcoal-700 rounded-xl hover:bg-warm-50 transition-colors disabled:opacity-60"
            title="Refresh overview metrics"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            Internal Admin Authorized
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadOverview}
            className="px-3 py-1 bg-amber-800 text-white rounded-lg font-semibold hover:bg-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Phase 2.3: Live Real-Time Aggregate Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Pending Host Verifications</span>
          <div className="font-display font-bold text-3xl text-amber-700 flex items-center gap-2">
            {loading ? "…" : data?.pendingHostsCount ?? 0}
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Requires Review</span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500 font-medium">Out of {data?.totalWeddingsCount ?? 0} total celebrations</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Pending Agent Applications</span>
          <div className="font-display font-bold text-3xl text-amber-700 flex items-center gap-2">
            {loading ? "…" : data?.pendingAgentsCount ?? 0}
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">In Queue</span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500 font-medium">Out of {data?.totalAgentsCount ?? 0} total agents</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Platform Revenue Accrued (22%)</span>
          <div className="font-display font-bold text-2xl text-[var(--color-brand-primary)]">
            {loading ? "…" : data?.platformCommissionAvailable ? formatCurrencyINR(data.platformCommissionAccrued ?? 0) : "Not recorded"}
          </div>
          <span className="text-[0.6875rem] text-charcoal-500 font-medium">
            {data?.platformCommissionAvailable ? formatSecondaryCurrency(data.platformCommissionAccrued ?? 0) : "Configure a platform-fee ledger to report this value."}
          </span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Agent Referral Accrued (Tiered Payout)</span>
          <div className="font-display font-bold text-2xl text-emerald-600">
            {loading ? "…" : formatCurrencyINR(data?.agentCommissionAccrued ?? 0)}
          </div>
          <span className="text-[0.6875rem] text-charcoal-500 font-medium">
            Carved from 22% platform share
          </span>
        </div>
      </div>

      {/* Quick Nav Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Host Verification Queue */}
        <Link
          href="/dashboard/admin/hosts"
          className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
            Host Verification Queue
          </h3>
          <p className="text-charcoal-500 text-xs leading-relaxed">
            Review pending family verified celebrations, verify venue permissions, and approve for publishing.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] pt-2">
            Review Queue ({data?.pendingHostsCount ?? 0}) <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 2. Agent Review */}
        <Link
          href="/dashboard/admin/agents"
          className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
            Agent Application Review
          </h3>
          <p className="text-charcoal-500 text-xs leading-relaxed">
            Review incoming freelance referral partner applications and activate tracking identifiers.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] pt-2">
            Review Agents ({data?.pendingAgentsCount ?? 0}) <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 3. Coordinator & City Density */}
        <Link
          href="/dashboard/admin/coordinators"
          className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
            <Compass size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
            Coordinators & City Density
          </h3>
          <p className="text-charcoal-500 text-xs leading-relaxed">
            Monitor city booking volume vs unplaced coordinators and assign shift placements.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] pt-2">
            Manage Roster <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 4. Bookings & Commission Ledger */}
        <Link
          href="/dashboard/admin/bookings"
          className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
            Internal Financial Ledger
          </h3>
          <p className="text-charcoal-500 text-xs leading-relaxed">
            Authoritative USD gross volume, fixed INR host payouts (₹5,101–₹61,101), fixed agent referrals (₹511–₹2,511), and refunds.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] pt-2">
            Open Financial Ledger <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Phase 2.3: Bookings Status Breakdown Widget */}
      <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-charcoal-900">Bookings by Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data?.bookingsByStatus && Object.keys(data.bookingsByStatus).length > 0 ? (
            Object.entries(data.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="bg-warm-50 p-4 rounded-2xl border border-warm-200 text-center">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-500 block mb-1">{status}</span>
                <span className="font-display font-bold text-2xl text-charcoal-900">{count}</span>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-xs text-charcoal-400 text-center py-4">No active booking status data.</div>
          )}
        </div>
      </div>

      {/* Operational Notice */}
      <div className="bg-warm-100/70 border border-warm-200 p-5 rounded-2xl text-xs text-charcoal-600 space-y-1">
        <div className="font-bold text-charcoal-900 flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-700" />
          <span>Internal Compliance Note:</span>
        </div>
        <p>This administrative panel operationalizes all verification gates, anti-MLM rules, and financial commission splits defined in Numbers.pdf. All status transitions directly update end-user dashboards and record AuditLogs in PostgreSQL.</p>
      </div>
    </div>
  );
}

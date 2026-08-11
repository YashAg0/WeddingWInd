"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminGetDiscoveryStats, adminSetManualBoost, searchWeddingsAction } from "@/lib/actions/discovery";
import {
  TrendingUp,
  Search,
  AlertOctagon,
  CheckCircle,
  Zap,
  Percent
} from "lucide-react";
import { formatDate } from "@/lib/utils";


export default function AdminDiscoveryPage() {
  const { user } = useAuth();
  
  // State Management
  const [stats, setStats] = useState<any | null>(null);
  const [weddings, setWeddings] = useState<any[]>([]);
  const [boostValues, setBoostValues] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (user?.role !== "admin") return;
      
      const statsData = await adminGetDiscoveryStats();
      setStats(statsData);

      const weddingsRes = await searchWeddingsAction({});
      setWeddings(weddingsRes.weddings);
      
      const initialBoosts: Record<string, number> = {};
      weddingsRes.weddings.forEach((w) => {
        initialBoosts[w.id] = w.manualTrendingBoost;
      });
      setBoostValues(initialBoosts);
    } catch (err) {
      console.error("Failed to load discovery admin metrics:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateBoost = async (weddingId: string) => {
    try {
      const val = boostValues[weddingId] || 0;
      await adminSetManualBoost(weddingId, val);
      setMessage("Trending score manual boost updated successfully!");
      setTimeout(() => setMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error("Failed to apply trending boost:", err);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center bg-red-50 text-red-650 rounded-2xl border border-red-100 max-w-md mx-auto space-y-2 mt-8">
        <AlertOctagon className="mx-auto" size={24} />
        <h3 className="font-bold text-sm">Forbidden Access</h3>
        <p className="text-xs">Only authorized system administrators are permitted to moderate discovery scores or audit search analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Discovery & Search Analytics Console
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Audit guest search click-through rates, identify search abandonment trends, and set trending scores boost levels.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle size={14} />
          {message}
        </div>
      )}

      {/* Analytics stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total searches log */}
        <div className="bg-white border border-warm-200/50 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-maroon-50 rounded-full flex items-center justify-center text-maroon-700">
            <Search size={18} />
          </div>
          <div>
            <span className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider block">Audited Searches</span>
            <span className="text-xl font-display font-black text-charcoal-900">
              {stats?.analytics?.length || 0}
            </span>
          </div>
        </div>

        {/* Top Destination */}
        <div className="bg-white border border-warm-200/50 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-700">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider block">Top Query</span>
            <span className="text-sm font-display font-black text-charcoal-900">
              {stats?.topSearches?.[0]?.query || "N/A"}
            </span>
          </div>
        </div>

        {/* Search CTR averages */}
        <div className="bg-white border border-warm-200/50 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center text-gold-700">
            <Percent size={18} />
          </div>
          <div>
            <span className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider block">Avg Click-Through Rate</span>
            <span className="text-xl font-display font-black text-charcoal-900">
              5.2%
            </span>
          </div>
        </div>
      </div>

      {/* Main panel columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Boost control */}
        <div className="lg:col-span-7 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xs text-charcoal-400 uppercase tracking-widest border-b border-warm-100 pb-2">
            Manual Trending Score Boosts
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {weddings.map((w) => (
              <div key={w.id} className="flex justify-between items-center border border-warm-150 p-3 rounded-2xl text-xs gap-3">
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-charcoal-900 truncate">{w.title}</h4>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">{w.location}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-charcoal-400">Boost Score:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={boostValues[w.id] ?? 0}
                      onChange={(e) =>
                        setBoostValues({ ...boostValues, [w.id]: parseFloat(e.target.value) || 0 })
                      }
                      className="input-luxury text-center text-xs py-1 h-8 w-16"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdateBoost(w.id)}
                    className="bg-maroon-800 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-maroon-900 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Search analytics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top searches */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
            <h3 className="font-display font-bold text-xs text-charcoal-400 uppercase tracking-widest border-b border-warm-100 pb-2 flex items-center gap-1">
              <Zap size={13} className="text-amber-500 fill-amber-500" />
              Top System Search Queries
            </h3>

            <div className="divide-y divide-warm-100 text-xs">
              {stats?.topSearches?.length === 0 ? (
                <div className="p-4 text-center text-charcoal-400 italic">No search entries logged yet.</div>
              ) : (
                stats?.topSearches?.map((t: any, index: number) => (
                  <div key={index} className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-charcoal-900">{t.query}</span>
                    <span className="bg-warm-100 text-charcoal-700 px-2 py-0.5 rounded font-extrabold">{t.count} hits</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Failed searches (resultsCount === 0) */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
            <h3 className="font-display font-bold text-xs text-charcoal-400 uppercase tracking-widest border-b border-warm-100 pb-2 flex items-center gap-1 text-rose-850">
              <AlertOctagon size={13} />
              Failed Queries (Zero Results)
            </h3>

            <div className="divide-y divide-warm-100 text-xs">
              {stats?.failedSearches?.length === 0 ? (
                <div className="p-4 text-center text-charcoal-400 italic">No failed searches logged.</div>
              ) : (
                stats?.failedSearches?.map((f: any, index: number) => (
                  <div key={index} className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-rose-800">{f.query}</span>
                    <span className="text-[10px] text-charcoal-400">{formatDate(f.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

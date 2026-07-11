"use server";

import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAgentGrowthStats } from "@/lib/actions/referrals";
import { CommissionStatus } from "@prisma/client";
import { Coins, AlertTriangle, CheckCircle2, History } from "lucide-react";
import ClientPayoutForm from "./ClientPayoutForm";

export default async function EarningsPage() {
  const user = await requireAuth();

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: user.id },
  });
  if (!agent) {
    return (
      <div className="p-6 text-center text-charcoal-500">
        Agent profile not found.
      </div>
    );
  }

  const stats = await getAgentGrowthStats();

  // Fetch complete commission ledger for the agent
  const commissions = await prisma.commission.findMany({
    where: { agentId: agent.id },
    include: {
      booking: {
        include: {
          wedding: true,
          traveler: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch payout requests
  const payoutRequests = await prisma.payoutRequest.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Earnings & Payout Ledger
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Review commissions earned, check pending clearance cycles, and submit payout requests.
        </p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Total Paid Earnings
          </span>
          <div className="text-xl font-display font-black text-emerald-850">
            ${stats.totalEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-charcoal-500">Transferred to your bank</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Clearance Pending
          </span>
          <div className="text-xl font-display font-black text-amber-600">
            ${stats.pendingCommission.toFixed(2)}
          </div>
          <p className="text-[10px] text-charcoal-500">Subject to 14-day lock cycle</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Payable Balance
          </span>
          <div className="text-xl font-display font-black text-charcoal-900">
            ${stats.payableBalance.toFixed(2)}
          </div>
          <p className="text-[10px] text-charcoal-500">Ready for instant payout</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Reversals & Adjustments
          </span>
          <div className="text-xl font-display font-black text-red-700">
            -${Math.abs(stats.reversedCommission).toFixed(2)}
          </div>
          <p className="text-[10px] text-charcoal-500">Refund adjustments processed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ledger list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-warm-100 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
                <Coins size={16} className="text-maroon-700" />
                Ledger Entries ({commissions.length})
              </span>
            </div>

            {commissions.length === 0 ? (
              <div className="p-12 text-center text-charcoal-400 text-xs">
                No commission entries recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-warm-50/50 text-charcoal-500 font-bold border-b border-warm-100">
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Gross Sale</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100 text-charcoal-800">
                    {commissions.map((c) => {
                      const date = new Date(c.createdAt).toLocaleDateString();
                      const sourceText =
                        c.source === "REVERSAL"
                          ? "Refund Reversal"
                          : c.booking?.wedding?.title || "Manual adjustment";

                      return (
                        <tr key={c.id} className="hover:bg-warm-50/20 transition-colors">
                          <td className="p-4 text-charcoal-500">{date}</td>
                          <td className="p-4 font-bold">{sourceText}</td>
                          <td className="p-4 text-charcoal-600">${c.grossAmount.toFixed(2)}</td>
                          <td
                            className={`p-4 font-bold ${
                              c.commissionAmount < 0 ? "text-red-700" : "text-emerald-850"
                            }`}
                          >
                            {c.commissionAmount < 0 ? "-" : ""}${Math.abs(c.commissionAmount).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                c.status === CommissionStatus.PAID
                                  ? "bg-emerald-50 text-emerald-800"
                                  : c.status === CommissionStatus.APPROVED
                                  ? "bg-blue-50 text-blue-800"
                                  : c.status === CommissionStatus.REVERSED
                                  ? "bg-red-50 text-red-800"
                                  : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payout forms & history */}
        <div className="space-y-6">
          <ClientPayoutForm payableBalance={stats.payableBalance} />

          {/* Payout History */}
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
            <h2 className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <History size={16} className="text-maroon-700" />
              Payout Request Logs
            </h2>

            {payoutRequests.length === 0 ? (
              <p className="text-[10px] text-charcoal-400">No payout requests submitted yet.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {payoutRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-warm-100 rounded-xl space-y-1 text-[10px] hover:bg-warm-50/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-charcoal-800">${req.amount.toFixed(2)}</span>
                      <span
                        className={`font-black uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded ${
                          req.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800"
                            : req.status === "REJECTED"
                            ? "bg-red-50 text-red-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[9px] text-charcoal-400">
                      Method: {req.method} • {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    {req.notes && (
                      <p className="text-[9px] bg-warm-50 text-charcoal-600 p-1.5 rounded mt-1 border border-warm-100/50">
                        Note: {req.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

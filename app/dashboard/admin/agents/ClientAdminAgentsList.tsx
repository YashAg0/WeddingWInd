"use client";

import React, { useState } from "react";
import {
  adminReviewPayoutRequestAction,
  regenerateReferralCodeAction
} from "@/lib/actions/referrals";
import { Coins, AlertTriangle, Users, Compass, RefreshCw } from "lucide-react";

interface ClientAdminAgentsListProps {
  agents: Array<{
    id: string;
    userId: string;
    organization: string;
    country: string;
    referralCode: string;
    user: {
      name: string;
      email: string;
    };
    referrals: Array<{
      id: string;
      status: string;
    }>;
    commissions: Array<{
      id: string;
      commissionAmount: number;
      status: string;
    }>;
    payoutRequests: Array<{
      id: string;
      amount: number;
      status: string;
    }>;
  }>;
  fraudFlags: Array<{
    id: string;
    reason: string;
    severity: string;
    status: string;
    createdAt: string;
    referral: {
      id: string;
      visitorId: string;
      agent: {
        referralCode: string;
        user: {
          name: string;
        };
      };
      referredUser: {
        name: string;
        email: string;
      } | null;
    };
  }>;
  payoutRequests: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    agent: {
      id: string;
      organization: string;
      user: {
        name: string;
        email: string;
      };
    };
  }>;
}

export default function ClientAdminAgentsList({
  agents: initialAgents,
  fraudFlags: initialFraudFlags,
  payoutRequests: initialPayoutRequests,
}: ClientAdminAgentsListProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [fraudFlags, setFraudFlags] = useState(initialFraudFlags);
  const [payoutRequests, setPayoutRequests] = useState(initialPayoutRequests);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleReviewPayout = async (requestId: string, approved: boolean) => {
    setLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const notes = noteMap[requestId] || "";
      await adminReviewPayoutRequestAction({ requestId, approved, notes });
      setPayoutRequests((prev) => prev.filter((r) => r.id !== requestId));
      alert(`Payout request successfully ${approved ? "approved" : "rejected"}!`);
    } catch (err: any) {
      alert(err?.message || "Action failed.");
    } finally {
      setLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRegenerateCode = async (agentId: string) => {
    setLoading((prev) => ({ ...prev, [agentId]: true }));
    try {
      const result = await regenerateReferralCodeAction(agentId);
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, referralCode: result.newCode } : a))
      );
      alert(`Referral code regenerated successfully: ${result.newCode}`);
    } catch (err: any) {
      alert(err?.message || "Action failed.");
    } finally {
      setLoading((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Payout Moderation */}
      <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
            <Coins className="text-maroon-700" size={16} />
            Payout Request Moderation Queue ({payoutRequests.length})
          </span>
        </div>

        {payoutRequests.length === 0 ? (
          <p className="p-8 text-center text-charcoal-400 text-xs">No pending payout requests.</p>
        ) : (
          <div className="divide-y divide-warm-100">
            {payoutRequests.map((req) => (
              <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-warm-50/20 transition-all text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-charcoal-900 text-sm">
                    {req.agent.user.name} ({req.agent.organization})
                  </div>
                  <div className="text-[10px] text-charcoal-500">
                    Amount: <strong className="text-charcoal-900">${req.amount.toFixed(2)}</strong> • Method: {req.method}
                  </div>
                  <div className="text-[9px] text-charcoal-400">
                    Requested on: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Approvals notes / transaction ref..."
                    value={noteMap[req.id] || ""}
                    onChange={(e) => setNoteMap((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="border border-warm-200 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none focus:border-maroon-800"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading[req.id]}
                      onClick={() => handleReviewPayout(req.id, true)}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-4 py-1.5 font-bold transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={loading[req.id]}
                      onClick={() => handleReviewPayout(req.id, false)}
                      className="bg-red-800 hover:bg-red-900 text-white rounded-xl px-4 py-1.5 font-bold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fraud Detection Center */}
      <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
            <AlertTriangle className="text-red-700 animate-pulse" size={16} />
            Referral Fraud Review Center ({fraudFlags.length})
          </span>
        </div>

        {fraudFlags.length === 0 ? (
          <p className="p-8 text-center text-charcoal-400 text-xs">No fraud flags active.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-warm-50/50 text-charcoal-500 font-bold border-b border-warm-100">
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Referred Target</th>
                  <th className="p-4">Fraud Reason Summary</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-charcoal-800">
                {fraudFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-red-50/10">
                    <td className="p-4">
                      <div className="font-bold text-charcoal-900">{flag.referral.agent.user.name}</div>
                      <div className="text-[10px] text-charcoal-400">Code: {flag.referral.agent.referralCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-charcoal-900">
                        {flag.referral.referredUser?.name || "Anonymous click"}
                      </div>
                      <div className="text-[9px] text-charcoal-400">{flag.referral.referredUser?.email || `Visitor: ${flag.referral.visitorId.substring(0,8)}`}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-[10px] text-charcoal-600 font-medium">
                      {flag.reason}
                    </td>
                    <td className="p-4 font-black">
                      <span className="inline-block text-[8px] bg-red-50 text-red-800 border border-red-100 px-1.5 py-0.5 rounded">
                        {flag.severity}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-charcoal-400">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agents Audit List */}
      <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
            <Users className="text-maroon-700" size={16} />
            Registered Agent Affiliates ({agents.length})
          </span>
        </div>

        {agents.length === 0 ? (
          <p className="p-8 text-center text-charcoal-400 text-xs">No agents onboarded.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-warm-50/50 text-charcoal-500 font-bold border-b border-warm-100">
                  <th className="p-4">Agent details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Referral Code</th>
                  <th className="p-4">Funnel Clicks / Refs</th>
                  <th className="p-4">Total Paid / Pending</th>
                  <th className="p-4">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-charcoal-800">
                {agents.map((a) => {
                  const paidTotal = a.commissions
                    .filter((c) => c.status === "PAID")
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                  const pendingTotal = a.commissions
                    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
                    .reduce((sum, c) => sum + c.commissionAmount, 0);

                  return (
                    <tr key={a.id} className="hover:bg-warm-50/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-charcoal-900">{a.user.name}</div>
                        <div className="text-[10px] text-charcoal-400">{a.organization} • {a.user.email}</div>
                      </td>
                      <td className="p-4 text-charcoal-600 font-medium">{a.country}</td>
                      <td className="p-4 font-mono font-bold text-charcoal-900">{a.referralCode}</td>
                      <td className="p-4 text-charcoal-600">
                        {a.referrals.length} leads total
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-emerald-850">${paidTotal.toFixed(2)} paid</div>
                        <div className="text-[10px] text-charcoal-400">${pendingTotal.toFixed(2)} pending</div>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          disabled={loading[a.id]}
                          onClick={() => handleRegenerateCode(a.id)}
                          className="hover:text-maroon-850 text-charcoal-500 transition-colors flex items-center gap-1 font-bold text-[10px]"
                        >
                          <RefreshCw className={loading[a.id] ? "animate-spin" : ""} size={12} />
                          Regenerate Code
                        </button>
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
  );
}

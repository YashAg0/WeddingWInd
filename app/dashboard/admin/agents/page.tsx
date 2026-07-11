"use server";

import React from "react";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { adminGetAgentsList } from "@/lib/actions/referrals";
import { Users, AlertTriangle, Coins, ShieldAlert } from "lucide-react";
import ClientAdminAgentsList from "./ClientAdminAgentsList";

export default async function AdminAgentsPage() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized: Admin access only.
      </div>
    );
  }

  const data = await adminGetAgentsList();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Agent & Affiliate Management Center
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Moderate agents, resolve pending payout requests, audit campaign attribution clicks, and review auto-flagged fraud alerts.
        </p>
      </div>

      {/* Main Grid: Lists and requests */}
      <ClientAdminAgentsList
        agents={data.agents.map((a) => ({
          ...a,
          user: { ...a.user, name: a.user.name ?? "" },
        }))}
        fraudFlags={data.fraudFlags.map((f) => ({
          ...f,
          createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
          referral: {
            ...f.referral,
            agent: {
              ...f.referral.agent,
              user: { ...f.referral.agent.user, name: f.referral.agent.user.name ?? "" },
            },
            referredUser: f.referral.referredUser ? {
              name: f.referral.referredUser.name ?? "",
              email: f.referral.referredUser.email,
            } : null,
          },
        }))}
        payoutRequests={data.payoutRequests.map((p) => ({
          ...p,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          agent: {
            ...p.agent,
            user: { ...p.agent.user, name: p.agent.user.name ?? "", email: p.agent.user.email },
          },
        }))}
      />
    </div>
  );
}

import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
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

  // Fetch referrals linked to this agent
  const referrals = await prisma.agentReferral.findMany({
    where: { agentId: agent.id },
    include: {
      referredUser: {
        include: {
          travelerProfile: true,
          coupleProfile: true,
        },
      },
      commissions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Lead & Attribution Management
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Monitor your referred users, check their onboarding milestones, and see active commission rewards.
        </p>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <span className="font-display font-bold text-sm text-charcoal-900">
            Attributed Referred Accounts ({referrals.length})
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-xs">
            No leads captured yet. Share your referral link to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50/50 text-charcoal-500 font-bold border-b border-warm-100">
                  <th className="p-4">Lead ID / Name</th>
                  <th className="p-4">Referral Type</th>
                  <th className="p-4">UTM Details</th>
                  <th className="p-4">Registration Stage</th>
                  <th className="p-4">Attribution Touchpoints</th>
                  <th className="p-4">Commission Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-charcoal-800">
                {referrals.map((lead) => {
                  const type = lead.referredUser?.coupleProfile ? "COUPLE" : "TRAVELER";
                  const name = lead.referredUser?.name || `Visitor (ID: ${lead.visitorId.substring(0, 8)})`;
                  const country = lead.referredUser?.travelerProfile?.country || lead.referredUser?.coupleProfile?.weddingLocation || "Unknown";
                  const conversions = lead.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

                  return (
                    <tr key={lead.id} className="hover:bg-warm-50/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-charcoal-900">{name}</div>
                        <div className="text-[10px] text-charcoal-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin size={10} /> {country}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-charcoal-100 text-charcoal-700 px-2 py-0.5 rounded">
                          {type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-[10px] text-charcoal-600 font-medium">
                          Src: <span className="text-charcoal-800 font-bold">{lead.source || "organic"}</span>
                        </div>
                        {lead.campaign && (
                          <div className="text-[9px] text-maroon-800 font-black mt-0.5">
                            Cmp: {lead.campaign}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            lead.status === "CONVERTED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                              : lead.status === "ONBOARDED"
                              ? "bg-blue-50 text-blue-800 border border-blue-100"
                              : "bg-amber-50 text-amber-800 border border-amber-100"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] space-y-0.5 text-charcoal-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} /> First: {new Date(lead.firstTouchAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Compass size={10} /> Last: {new Date(lead.lastTouchAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-charcoal-900">
                        {conversions > 0 ? (
                          <span className="text-emerald-850 font-black">${conversions.toFixed(2)}</span>
                        ) : (
                          <span className="text-charcoal-400 font-normal">$0.00</span>
                        )}
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

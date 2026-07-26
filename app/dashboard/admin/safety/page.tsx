import React from "react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { adminGetSafetyMetricsAction } from "@/lib/actions/admin";
import { ShieldAlert, Landmark, Scale, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSafetyQueuePage() {
  await requireRole([UserRole.ADMIN]);

  const metrics = await adminGetSafetyMetricsAction();

  // Fetch all cases in queue
  const cases = await prisma.safetyCase.findMany({
    include: {
      reportedBy: true,
      subjectUser: true,
      assignedAdmin: true,
      booking: { include: { wedding: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl text-charcoal-900 flex items-center gap-2">
          <ShieldAlert className="text-maroon-800" size={26} />
          Safety Operations Command Center
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Review guest incident reports, moderate disputes, enable escrow holds, and restrict violating profiles.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-5 rounded-[2rem] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Open Cases
          </span>
          <div className="text-xl font-display font-black text-maroon-900">
            {metrics.openCases}
          </div>
          <p className="text-[10px] text-charcoal-500">Requires triage & audit</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-[2rem] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Critical Escalations
          </span>
          <div className="text-xl font-display font-black text-red-700">
            {metrics.criticalCases}
          </div>
          <p className="text-[10px] text-charcoal-500">High priority response</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-[2rem] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Active Restrictions
          </span>
          <div className="text-xl font-display font-black text-charcoal-900">
            {metrics.activeRestrictions}
          </div>
          <p className="text-[10px] text-charcoal-500">Limited user profiles</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-5 rounded-[2rem] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
            Suspended Weddings
          </span>
          <div className="text-xl font-display font-black text-amber-600">
            {metrics.suspendedWeddings}
          </div>
          <p className="text-[10px] text-charcoal-500">Hidden from discovery feeds</p>
        </div>
      </div>

      {/* Refund Metrics & Payout Rates info */}
      <div className="bg-warm-50/50 border border-warm-200 p-4 rounded-3xl flex flex-wrap gap-6 text-xs text-charcoal-600 font-semibold justify-around">
        <div>Refund Request Rate: <strong className="text-maroon-800">{metrics.refundRequestRate.toFixed(1)}%</strong> of bookings</div>
        <div>Refund Approval Resolution Rate: <strong className="text-emerald-800">{metrics.refundApprovalRate.toFixed(1)}%</strong> of claims</div>
      </div>

      {/* Safety Cases Command Table */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
          <Scale size={18} className="text-maroon-600" />
          Escalations Incident Queue ({cases.length} entries)
        </h3>

        {cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No incident reports generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-warm-150 text-charcoal-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3 px-4">Case Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Escrow Hold</th>
                  <th className="py-3 px-4">Assigned Admin</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-warm-100 hover:bg-warm-50/30 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <span className="font-mono bg-warm-100 px-1.5 py-0.5 rounded text-charcoal-700 font-bold text-[9px]">
                        {c.caseNumber}
                      </span>
                      <div className="font-bold text-charcoal-900 text-sm mt-0.5">{c.title}</div>
                      <div className="text-[10px] text-charcoal-450">
                        Filed by: {c.reportedBy.name || c.reportedBy.email} • {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal-700">{c.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        c.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                        c.severity === "HIGH" ? "bg-amber-100 text-amber-800" :
                        c.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-maroon-50 text-maroon-900 border border-maroon-100 px-2 py-0.5 rounded font-bold text-[9px]">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.financialHold ? (
                        <span className="text-red-650 font-bold flex items-center gap-1">
                          <Landmark size={14} /> Held
                        </span>
                      ) : (
                        <span className="text-charcoal-400">Escrow Clear</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      {c.assignedAdmin?.name || c.assignedAdmin?.email || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/admin/safety/${c.id}`}
                        className="inline-flex items-center gap-0.5 bg-maroon-50 hover:bg-maroon-100 border border-maroon-200 text-maroon-850 px-3 py-1.5 rounded-xl font-bold transition-all"
                      >
                        Inspect <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

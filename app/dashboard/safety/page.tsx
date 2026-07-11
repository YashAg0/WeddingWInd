import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldAlert, Plus, HelpCircle, FileText, Scale } from "lucide-react";

export default async function UserSafetyCenterPage() {
  const user = await requireAuth();

  // Fetch Safety Cases where the user is a participant (Reporter or Subject)
  const cases = await prisma.safetyCase.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      timelineEvents: {
        orderBy: { createdAt: "desc" },
        take: 1, // Only show last updates to traveler
      },
      booking: { include: { wedding: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch active restrictions affecting this user
  const restrictions = await prisma.userRestriction.findMany({
    where: {
      userId: user.id,
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-charcoal-900 flex items-center gap-2">
            <ShieldAlert className="text-maroon-800" size={26} />
            Safety & Trust Center
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Review active safety alerts, coordinate ongoing dispute claims, and request safety case appeals.
          </p>
        </div>
        <Link
          href="/dashboard/safety/report"
          className="flex items-center gap-1 bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-4 py-2 font-bold transition-all text-xs"
        >
          <Plus size={14} />
          File Safety Report
        </Link>
      </div>

      {/* Restrictions Banner */}
      {restrictions.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-[2rem] text-red-950 space-y-2 text-xs">
          <h3 className="font-display font-black text-sm text-red-900 flex items-center gap-1.5">
            ⚠️ Active Profile Limitation Warnings ({restrictions.length})
          </h3>
          <p className="font-medium text-charcoal-600">
            For trust and compliance verification, some capabilities on your account have been limited:
          </p>
          <ul className="list-disc pl-4 space-y-1 font-semibold text-red-850">
            {restrictions.map((r) => (
              <li key={r.id}>
                {r.type.replace("_", " ")} — Reason: {r.reasonCode}
                {r.expiresAt && ` (Expires: ${new Date(r.expiresAt).toLocaleDateString()})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Cases Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-maroon-600" />
              Your Reported Cases & Claims
            </h3>

            {cases.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No active safety cases or disputes filed.
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((c) => (
                  <div key={c.id} className="border border-warm-200 p-4 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-warm-100 text-charcoal-700 px-2 py-0.5 rounded font-bold uppercase text-[9px] font-mono tracking-wider">
                          {c.caseNumber}
                        </span>
                        <h4 className="font-bold text-charcoal-900 mt-1">{c.title}</h4>
                      </div>
                      <span className="bg-maroon-50 text-maroon-800 border border-maroon-100 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                        {c.status}
                      </span>
                    </div>

                    <p className="text-charcoal-500 text-[11px] leading-relaxed line-clamp-3">
                      {c.description}
                    </p>

                    {c.booking && (
                      <div className="bg-warm-50 p-2.5 rounded-xl space-y-0.5 text-charcoal-500 text-[10px]">
                        <div><strong>Wedding:</strong> {c.booking.wedding.title}</div>
                        <div><strong>Booking ID:</strong> #{c.bookingId?.substring(0, 8)}</div>
                      </div>
                    )}

                    {c.timelineEvents[0] && (
                      <div className="border-t border-warm-100 pt-2 flex items-center gap-1.5 text-charcoal-400 text-[10px]">
                        <HelpCircle size={14} className="text-maroon-600" />
                        <span>Last Update: {c.timelineEvents[0].safeSummary}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Safety FAQ / Help Card */}
        <div className="space-y-6">
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4 text-xs">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Scale size={18} className="text-maroon-600" />
              Safety Operations FAQ
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="font-bold text-charcoal-800">How long does an investigation take?</span>
                <p className="text-charcoal-500 leading-relaxed text-[11px]">
                  Standard cases are triaged within 24 hours. Complex booking disputes requiring evidence auditing may take up to 7 business days to resolve.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-charcoal-800">What is a Financial Hold?</span>
                <p className="text-charcoal-500 leading-relaxed text-[11px]">
                  If a safety report is filed regarding payment or hosting safety, funds associated with the wedding or booking are held in escrow, preventing host payouts until resolution.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-charcoal-800">Can I appeal a safety decision?</span>
                <p className="text-charcoal-500 leading-relaxed text-[11px]">
                  Yes. Once a safety case is marked RESOLVED, participants have 14 days to file a formal appeal through their safety case details page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

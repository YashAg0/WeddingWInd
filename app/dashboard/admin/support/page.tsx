import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getSupportDashboardAction } from "@/lib/actions/admin-dashboards";
import { LifeBuoy, MessageSquare, AlertTriangle, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExecutiveSupportDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const support = await getSupportDashboardAction();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
          <LifeBuoy className="text-amber-600 w-8 h-8" />
          Executive Support & Dispute Dashboard
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Concierge support tickets, guest/host messages, disputes, and emergency assistance alerts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-maroon-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Contact Submissions</span>
            <Mail size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-charcoal-900">
            {support.contactSubmissionsCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Public support inquiries.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Active Conversations</span>
            <MessageSquare size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-amber-700">
            {support.activeConversationsCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Direct guest-host threads.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Flagged Disputes</span>
            <AlertTriangle size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-rose-700">
            {support.disputesCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Chargeback/refund disputes.</p>
        </div>
      </div>

      {/* Submissions & Threads */}
      <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
          <Mail size={18} className="text-maroon-600" />
          Recent Concierge Contact Inquiries ({support.contactSubmissions.length})
        </h3>
        {support.contactSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">No pending support inquiries.</div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {support.contactSubmissions.map((c: any) => (
              <div key={c.id} className="p-4 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-charcoal-900">
                  <span>{c.name} ({c.email})</span>
                  <span className="text-[0.6875rem] text-charcoal-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold text-maroon-700">{c.subject}</div>
                <p className="text-charcoal-600">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

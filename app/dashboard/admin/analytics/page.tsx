import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { adminGetAuditLogsAction } from "@/lib/actions/admin";
import { History, Shield, Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch Audit Logs
  const logs = await adminGetAuditLogsAction();

  // 3. Aggregate User counts per Role
  const travelerCount = await prisma.user.count({ where: { role: UserRole.TRAVELER } });
  const coupleCount = await prisma.user.count({ where: { role: UserRole.COUPLE } });
  const agentCount = await prisma.user.count({ where: { role: UserRole.AGENT } });
  const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });

  // 4. Booking counts
  const _totalBookings = await prisma.booking.count();
  const _totalPayments = await prisma.payment.count();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Analytics & System Logs
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Track system audits, user growth distributions, and system role permissions logic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics & Permissions */}
        <div className="lg:col-span-5 space-y-8">
          {/* User Distribution */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Users size={18} className="text-maroon-600" />
              User Role Distribution
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-warm-50">
                <span className="font-semibold text-charcoal-600">Travelers</span>
                <span className="font-bold text-charcoal-950 bg-gold-50 text-gold-700 px-2 py-0.5 rounded-md">
                  {travelerCount} accounts
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-warm-50">
                <span className="font-semibold text-charcoal-600">Couples</span>
                <span className="font-bold text-charcoal-950 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">
                  {coupleCount} accounts
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-warm-50">
                <span className="font-semibold text-charcoal-600">Local Liaison Agents</span>
                <span className="font-bold text-charcoal-950 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                  {agentCount} accounts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-charcoal-600">System Administrators</span>
                <span className="font-bold text-charcoal-950 bg-maroon-50 text-maroon-800 px-2 py-0.5 rounded-md">
                  {adminCount} accounts
                </span>
              </div>
            </div>
          </div>

          {/* Role Permissions Matrix */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Shield size={18} className="text-maroon-600" />
              Role Permission Access Controls
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-charcoal-500 font-medium">
              <div className="p-3 bg-gold-50/50 border border-gold-100 rounded-xl">
                <strong className="text-gold-700 block mb-0.5">TRAVELER Role</strong>
                Can browse weddings, join waitlists, request reservations, pay Stripe invoices, and submit identity verification docs.
              </div>
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <strong className="text-rose-700 block mb-0.5">COUPLE Role</strong>
                Can build a wedding experience celebration, review applicant dossiers, approve or reject guest requests, and clear payouts.
              </div>
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <strong className="text-emerald-700 block mb-0.5">AGENT Role</strong>
                Can register local liaisons, track referred traveler profiles, claim commissions, and verify in-person host credentials.
              </div>
              <div className="p-3 bg-maroon-50/50 border border-maroon-100 rounded-xl">
                <strong className="text-maroon-800 block mb-0.5">ADMIN Role</strong>
                Holds super-user access. Can force override booking registers, issue Stripe refunds, review document queues, and edit site CMS.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs */}
        <div className="lg:col-span-7 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <History size={18} className="text-maroon-600" />
            System Audit Trail
          </h3>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
              No audit logs captured in the system ledger yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="border border-warm-200 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-charcoal-900 uppercase tracking-wide text-[0.6875rem]">
                      {log.action}
                    </span>
                    <span className="text-[0.625rem] text-charcoal-400">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-charcoal-600 font-medium leading-relaxed">{log.details}</p>
                  <div className="flex justify-between text-[0.625rem] text-charcoal-400 pt-1 border-t border-warm-50">
                    <span>Admin: <strong>{log.userName}</strong></span>
                    {log.entityId && (
                      <span>Entity: <strong>{log.entity} ({log.entityId.slice(0, 8)})</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


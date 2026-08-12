import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getOperationsDashboardAction } from "@/lib/actions/admin-dashboards";
import { Compass, ShieldCheck, QrCode, Calendar } from "lucide-react";
import { formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCoordinatorsPage() {
  await requireRole([UserRole.ADMIN]);
  const ops = await getOperationsDashboardAction();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
          <Compass size={13} />
          Coordinator Roster & Operations
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
          Coordinators & City Density
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Monitor city booking volume vs unplaced coordinators, check gate scan activity, and assign ground shift placements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Pending Identity Verifications</span>
            <ShieldCheck size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-amber-700">
            {ops.pendingVerificationsCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Documents awaiting coordinator review.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Active Published Weddings</span>
            <Calendar size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-charcoal-900">
            {ops.activeWeddingsCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Verified celebrations receiving bookings.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-maroon-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Gate Scans Completed</span>
            <QrCode size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-maroon-700">
            {ops.checkInsCount}
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Pass scans completed by active shift coordinators.</p>
        </div>
      </div>

      {/* Recent Check-In Scans */}
      <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
          <QrCode size={18} className="text-emerald-600" />
          Recent Gate Check-In Scans ({ops.recentCheckIns.length})
        </h3>
        {ops.recentCheckIns.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No gate check-in scans recorded yet across coordinator shifts.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {ops.recentCheckIns.map((c: any) => (
              <div key={c.id} className="p-3.5 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-charcoal-900">{c.guestPass?.booking?.traveler?.fullName || "Guest Pass Holder"}</span>
                  <span className="text-charcoal-400 text-[0.6875rem] block">{c.guestPass?.booking?.wedding?.title || "Wedding Pass"}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold block">{formatTime(c.createdAt)}</span>
                  <span className="text-[0.6875rem] text-charcoal-400">Validated</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import {
  Compass,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award
} from "lucide-react";
import { COORDINATOR_STATUS_CONFIG, CoordinatorApplicationStatus } from "@/lib/constants/status";
import { COORDINATOR_MODEL } from "@/lib/constants/financial-model";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoordinatorDashboardPage() {
  const user = await requireAuth();
  
  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id }
  });

  if (!coordinator) {
    redirect("/coordinators/apply");
  }

  const currentStatus = (coordinator.status.toLowerCase() as CoordinatorApplicationStatus) || "submitted";
  const statusMeta = COORDINATOR_STATUS_CONFIG[currentStatus] || COORDINATOR_STATUS_CONFIG["submitted"];
  const userCity = coordinator.city || "Not Specified";

  // Responsibilities checklist
  const responsibilities = [
    { title: "Guest Arrival & Orientation", desc: "Greet international guests upon arrival at the venue and orient them with event schedules." },
    { title: "Cultural Comfort & Hospitality", desc: "Keep guests comfortable and engaged during rituals. Act as a friendly bridge between host family and guests." },
    { title: "Local Logistics & Attire Support", desc: "Assist guests with traditional clothing drape fitting (turbans, dupattas) and venue guidance." },
    { title: "On-Site Escalation & Safety", desc: "Serve as the designated contact to resolve guest inquiries immediately, ensuring smooth operations." }
  ];

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <div className="container-luxury max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
              <Compass size={12} />
              On-Ground Event Operations
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              Coordinator Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-white border border-warm-200 px-3.5 py-1.5 rounded-xl shadow-xs">
            <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-wider">Coordinator ID:</span>
            <span className="font-mono text-xs font-bold text-charcoal-900">{coordinator.id.slice(0, 13).toUpperCase()}</span>
          </div>
        </div>

        {/* Application Status Banner */}
        <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-warm-100 pb-4">
            <div>
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Roster Application Status</span>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusMeta.badgeClass}`}>
                  <ShieldCheck size={14} />
                  {statusMeta.label}
                </span>
                <span className="text-xs font-semibold text-charcoal-600">Assigned City: {userCity}</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-charcoal-500 bg-warm-50 px-3 py-1.5 rounded-xl border border-warm-200">
              {COORDINATOR_MODEL.COMPENSATION_LABEL}
            </div>
          </div>

          {/* Positively Rendered City Activation Notice */}
          {currentStatus === "not_available_in_city" && (
            <div className="bg-purple-50/80 border border-purple-200 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                <CheckCircle2 size={18} className="text-purple-700 flex-shrink-0" />
                <span>Application Approved — City Activation Pending</span>
              </div>
              <p className="text-purple-900 text-xs sm:text-sm leading-relaxed">
                Your application is approved! Coordinator roles in <strong>{userCity}</strong> activate once local wedding booking volume supports on-ground placement — we will notify you via WhatsApp & email the moment a placement opens.
              </p>
              <div className="text-xs text-purple-800 font-medium pt-1">
                Note: {COORDINATOR_MODEL.DEPLOYMENT_NOTE}.
              </div>
            </div>
          )}

          {currentStatus === "approved_awaiting_placement" && (
            <div className="bg-blue-50/80 border border-blue-200 p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                <Clock size={18} className="text-blue-700 flex-shrink-0" />
                <span>Awaiting Event Assignment</span>
              </div>
              <p className="text-blue-900 text-xs sm:text-sm leading-relaxed">
                Your profile is active on the {userCity} coordinator roster. Shifts are assigned 7-10 days prior to confirmed wedding dates.
              </p>
            </div>
          )}

          {currentStatus === "placed" && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <Award size={18} className="text-emerald-700 flex-shrink-0" />
                <span>Active Event Assignment Confirmed</span>
              </div>
              <p className="text-emerald-900 text-xs sm:text-sm leading-relaxed">
                You have been assigned to on-ground guest management shifts. Review your schedule details below.
              </p>
            </div>
          )}
        </div>

        {/* Assigned Event Shifts (if placed) */}
        {currentStatus === "placed" && (
          <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-warm-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-900">Your Assigned Event Shift</h3>
                <p className="text-xs text-charcoal-500">Confirmed shift date & venue reporting time.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                1 Active Shift Placed
              </span>
            </div>

            <div className="bg-warm-50/70 border border-warm-200/60 p-5 rounded-2xl space-y-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-maroon-50 px-2 py-0.5 rounded-md border border-maroon-100">
                  EVT-801
                </span>
                <h4 className="font-display font-bold text-base text-charcoal-900">{coordinator.assignedEventTitle || "The Grand Maharaja Wedding"}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-600 font-medium">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {coordinator.city || "Udaipur"} Palace Venue</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {coordinator.assignedDate || "Feb 14, 2025 (Day 1 - Welcome)"}</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                  Confirmed Shift
                </span>
                <div className="text-[0.6875rem] text-charcoal-500 font-semibold">{COORDINATOR_MODEL.COMPENSATION_LABEL}</div>
              </div>
            </div>
          </div>
        )}

        {/* Responsibilities Checklist */}
        <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-warm-100 pb-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900">On-Ground Responsibilities Checklist</h3>
            <p className="text-xs text-charcoal-500">Standard operational guidelines for all event coordinators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responsibilities.map((r, idx) => (
              <div key={r.title} className="bg-warm-50/50 border border-warm-200/50 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-xs text-charcoal-900 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>{idx + 1}. {r.title}</span>
                </div>
                <p className="text-charcoal-600 text-xs leading-relaxed pl-5">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

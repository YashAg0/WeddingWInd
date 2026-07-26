import React from "react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import ClientCaseDetailActions from "./ClientCaseDetailActions";
import { ArrowLeft, History, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  await requireRole([UserRole.ADMIN]);
  const resolvedParams = await params;
  const caseId = resolvedParams.caseId;

  const safetyCase = await prisma.safetyCase.findUnique({
    where: { id: caseId },
    include: {
      reportedBy: true,
      subjectUser: true,
      assignedAdmin: true,
      participants: { include: { user: true } },
      evidence: { include: { uploadedBy: true } },
      timelineEvents: { include: { actor: true }, orderBy: { createdAt: "desc" } },
      booking: {
        include: {
          traveler: { include: { user: true } },
          wedding: { include: { hostCouple: { include: { user: true } } } },
          cancellationRequests: true,
        },
      },
      wedding: { include: { hostCouple: { include: { user: true } } } },
    },
  });

  if (!safetyCase) {
    return (
      <div className="p-6 text-center text-rose-700 font-bold max-w-lg mx-auto">
        Safety case not found.
      </div>
    );
  }

  // Fetch active restrictions on the subject user (if applicable)
  const activeRestrictions = safetyCase.subjectUserId
    ? await prisma.userRestriction.findMany({
        where: {
          userId: safetyCase.subjectUserId,
          revokedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      })
    : [];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-xs">
      {/* Back navigation */}
      <Link
        href="/dashboard/admin/safety"
        className="flex items-center gap-1 text-charcoal-550 hover:text-charcoal-900 transition-all font-bold"
      >
        <ArrowLeft size={16} />
        Back to Safety Command Queue
      </Link>

      {/* Case Header Banner */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono bg-warm-100 px-2 py-0.5 rounded text-charcoal-700 font-black tracking-wider text-[10px]">
            {safetyCase.caseNumber}
          </span>
          <h2 className="font-display font-black text-xl text-charcoal-900 mt-2">{safetyCase.title}</h2>
          <p className="text-charcoal-500 mt-1">
            Filed by {safetyCase.reportedBy.name || safetyCase.reportedBy.email} • Assigned to: {safetyCase.assignedAdmin?.name || safetyCase.assignedAdmin?.email || "Unassigned"}
          </p>
        </div>

        <div className="flex gap-3">
          <span className="bg-maroon-50 text-maroon-900 border border-maroon-150 px-3 py-1 rounded-xl font-bold uppercase text-[10px]">
            {safetyCase.status}
          </span>
          <span className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] ${
            safetyCase.severity === "CRITICAL" ? "bg-red-100 text-red-950" : "bg-amber-100 text-amber-950"
          }`}>
            {safetyCase.severity} Severity
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Case Details, Timeline & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
            <h3 className="font-display font-bold text-sm text-charcoal-900 border-b border-warm-100 pb-2 flex items-center gap-1.5">
              <FileText size={16} className="text-maroon-800" />
              Claim Incident Narrative
            </h3>
            <p className="text-charcoal-700 leading-relaxed text-[11px] whitespace-pre-line">
              {safetyCase.description}
            </p>
          </div>

          {/* Evidence Attachments */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
            <h3 className="font-display font-bold text-sm text-charcoal-900 border-b border-warm-100 pb-2">
              Audited Case Evidence Attachments ({safetyCase.evidence.length})
            </h3>
            {safetyCase.evidence.length === 0 ? (
              <p className="text-charcoal-450 italic">No evidence attachments filed.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {safetyCase.evidence.map((ev) => (
                  <div key={ev.id} className="border border-warm-200 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-charcoal-850 truncate">{ev.fileUrl.split("/").pop()}</div>
                      <div className="text-[9px] text-charcoal-500 uppercase">Size: {Math.round(ev.size / 1024)} KB • {ev.mimeType}</div>
                    </div>
                    <a
                      href={`/api/safety/evidence/${ev.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-maroon-50 hover:bg-maroon-100 border border-maroon-200 text-maroon-850 px-2 py-1 rounded font-bold transition-all shrink-0 text-[10px]"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incident Timeline Log */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-charcoal-900 border-b border-warm-100 pb-2 flex items-center gap-1.5">
              <History size={16} className="text-maroon-800" />
              Safety Case Audit Timeline Log
            </h3>
            <div className="space-y-4 relative pl-4 border-l border-warm-200">
              {safetyCase.timelineEvents.map((t) => (
                <div key={t.id} className="relative space-y-1">
                  <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-maroon-800 border-2 border-white" />
                  <div className="flex justify-between items-center text-[10px] text-charcoal-500 font-bold">
                    <span>{t.eventType}</span>
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-charcoal-800 font-semibold">{t.safeSummary}</p>
                  <p className="text-[9px] text-charcoal-450">Actor: {t.actor.name || t.actor.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Admin Operations Controls */}
        <div className="space-y-6">
          {/* Linked Context Box */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
            <h3 className="font-display font-bold text-sm text-charcoal-900 border-b border-warm-100 pb-2">
              Associated Context
            </h3>
            <div className="space-y-2">
              {safetyCase.booking && (
                <div className="p-3 bg-warm-50 rounded-xl space-y-1">
                  <div className="font-bold text-charcoal-900">Linked Booking Details</div>
                  <div>Traveler: {safetyCase.booking.traveler.fullName}</div>
                  <div>Total Amount: ${safetyCase.booking.totalAmount.toLocaleString()}</div>
                  <div>Booking Status: {safetyCase.booking.status}</div>
                </div>
              )}

              {safetyCase.wedding && (
                <div className="p-3 bg-warm-50 rounded-xl space-y-1">
                  <div className="font-bold text-charcoal-900">Linked Wedding Event</div>
                  <div>Experience: {safetyCase.wedding.title}</div>
                  <div>Host Couple: {safetyCase.wedding.hostCouple.user.name || safetyCase.wedding.hostCouple.user.email}</div>
                  <div>Suspended Status: {safetyCase.wedding.suspended ? "Yes (Suspended)" : "No"}</div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <ClientCaseDetailActions
            caseId={safetyCase.id}
            initialSeverity={safetyCase.severity}
            initialStatus={safetyCase.status}
            initialHold={safetyCase.financialHold}
            initialSuspended={safetyCase.wedding?.suspended ?? false}
            subjectUserId={safetyCase.subjectUserId || null}
            activeRestrictions={activeRestrictions}
            bookingId={safetyCase.bookingId}
            cancellationRequests={safetyCase.booking?.cancellationRequests || []}
          />
        </div>
      </div>
    </div>
  );
}

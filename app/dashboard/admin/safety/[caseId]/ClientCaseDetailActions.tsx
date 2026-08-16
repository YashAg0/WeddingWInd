"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminTriageCaseAction,
  adminToggleFinancialHoldAction,
  adminRestrictUserAction,
  adminRevokeRestrictionAction,
  adminResolveCaseAction,
  adminToggleWeddingSuspensionAction,
} from "@/lib/actions/safety";
import { processApprovedRefund } from "@/lib/services/refunds";
import { CaseSeverity, CaseStatus, RestrictionType } from "@prisma/client";
import { Lock, Unlock, AlertTriangle, Ban } from "lucide-react";

interface ClientCaseDetailActionsProps {
  caseId: string;
  initialSeverity: CaseSeverity;
  initialStatus: CaseStatus;
  initialHold: boolean;
  initialSuspended: boolean;
  subjectUserId: string | null;
  activeRestrictions: Array<{ id: string; type: RestrictionType; reasonCode: string }>;
  bookingId: string | null;
  weddingId?: string | null;
  cancellationRequests: Array<{ id: string; status: string; eligibleRefundAmount: number }>;
}

export default function ClientCaseDetailActions({
  caseId,
  initialSeverity,
  initialStatus,
  initialHold,
  initialSuspended,
  subjectUserId,
  activeRestrictions,
  bookingId: _bookingId,
  weddingId,
  cancellationRequests,
}: ClientCaseDetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [severity, setSeverity] = useState<CaseSeverity>(initialSeverity);
  const [status, setStatus] = useState<CaseStatus>(initialStatus);
  const [hold, setHold] = useState(initialHold);
  const [suspended, setSuspended] = useState(initialSuspended);

  // User restriction states
  const [restrictionType, setRestrictionType] = useState<RestrictionType>("BOOKING_RESTRICTED");
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionNotes, setRestrictionNotes] = useState("");

  // Resolution states
  const [resolutionCode, setResolutionCode] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleTriage = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminTriageCaseAction(caseId, severity, status, null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Triage failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHold = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminToggleFinancialHoldAction(caseId, !hold);
      setHold(!hold);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to toggle escrow hold.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    const targetWeddingId = weddingId;
    if (!targetWeddingId) {
      setError("No wedding event is associated with this safety case.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await adminToggleWeddingSuspensionAction(targetWeddingId, !suspended, caseId);
      setSuspended(!suspended);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to toggle wedding suspension.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestrict = async () => {
    if (!subjectUserId) return;
    setLoading(true);
    setError(null);
    try {
      await adminRestrictUserAction({
        userId: subjectUserId,
        type: restrictionType,
        reasonCode: restrictionReason || "POLICY_VIOLATION",
        notes: restrictionNotes,
        caseId,
      });
      setRestrictionReason("");
      setRestrictionNotes("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to apply restriction.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRestriction = async (restrictionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await adminRevokeRestrictionAction(restrictionId, caseId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to revoke restriction.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionCode) {
      setError("Resolution code is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await adminResolveCaseAction(caseId, resolutionCode, resolutionNotes);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to resolve case.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (cancellationRequestId: string) => {
    setLoading(true);
    setError(null);
    try {
      await processApprovedRefund(cancellationRequestId, "admin-system");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Refund processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-semibold rounded-xl text-[11px]">
          {error}
        </div>
      )}

      {/* Case Triage Controls */}
      <div className="bg-white border border-warm-200/50 p-5 rounded-[2rem] shadow-sm space-y-3">
        <h4 className="font-display font-bold text-charcoal-900 border-b border-warm-100 pb-2">
          Triaging & Triage Operations
        </h4>
        
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="font-bold text-charcoal-600 block">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as CaseSeverity)}
              className="w-full border border-warm-200 rounded-xl px-2 py-1.5 bg-warm-50/20 text-charcoal-800 font-bold"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-600 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CaseStatus)}
              className="w-full border border-warm-200 rounded-xl px-2 py-1.5 bg-warm-50/20 text-charcoal-800 font-bold"
            >
              <option value="OPEN">OPEN</option>
              <option value="TRIAGED">TRIAGED</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="AWAITING_USER">AWAITING USER</option>
              <option value="AWAITING_ADMIN">AWAITING ADMIN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <button
            onClick={handleTriage}
            disabled={loading}
            className="w-full bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl py-2 font-bold transition-all text-[11px]"
          >
            Apply Triage Changes
          </button>
        </div>
      </div>

      {/* Escrow holds / suspensions */}
      <div className="bg-white border border-warm-200/50 p-5 rounded-[2rem] shadow-sm space-y-3">
        <h4 className="font-display font-bold text-charcoal-900 border-b border-warm-100 pb-2">
          Escrow holds & suspension controls
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <button
            onClick={handleToggleHold}
            disabled={loading}
            className={`border rounded-xl py-2 px-1 font-bold text-[10px] transition-all ${
              hold
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "bg-warm-50/20 border-warm-200 text-charcoal-700 hover:bg-warm-100"
            }`}
          >
            {hold ? (
              <span className="inline-flex items-center gap-1"><Lock size={12} /> Escrow Hold Enabled</span>
            ) : (
              <span className="inline-flex items-center gap-1"><Unlock size={12} /> Place Escrow Hold</span>
            )}
          </button>

          <button
            onClick={handleToggleSuspension}
            disabled={loading}
            className={`border rounded-xl py-2 px-1 font-bold text-[10px] transition-all ${
              suspended
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-warm-50/20 border-warm-200 text-charcoal-700 hover:bg-warm-100"
            }`}
          >
            {suspended ? (
              <span className="inline-flex items-center gap-1"><AlertTriangle size={12} /> Wedding Suspended</span>
            ) : (
              <span className="inline-flex items-center gap-1"><Ban size={12} /> Suspend Wedding</span>
            )}
          </button>
        </div>
      </div>

      {/* Booking Cancellation & Refunds Resolution */}
      {cancellationRequests.length > 0 && (
        <div className="bg-white border border-warm-200/50 p-5 rounded-[2rem] shadow-sm space-y-3">
          <h4 className="font-display font-bold text-charcoal-900 border-b border-warm-100 pb-2">
            Disputed Refunds & Cancellations
          </h4>
          <div className="space-y-3">
            {cancellationRequests.map((req) => (
              <div key={req.id} className="border border-warm-200 p-3 rounded-xl space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Req #{req.id.substring(0, 8)}</span>
                  <span>Amount: ${req.eligibleRefundAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-charcoal-500">
                  <span>Status: {req.status}</span>
                </div>
                {req.status === "REQUESTED" && (
                  <button
                    onClick={() => handleProcessRefund(req.id)}
                    disabled={loading}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-1.5 font-bold transition-all text-[10px]"
                  >
                    Approve & Process Refund
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Restrictions Control */}
      {subjectUserId && (
        <div className="bg-white border border-warm-200/50 p-5 rounded-[2rem] shadow-sm space-y-4">
          <h4 className="font-display font-bold text-charcoal-900 border-b border-warm-100 pb-2">
            User Restrictions Controls
          </h4>

          {/* Active Restrictions list */}
          {activeRestrictions.length > 0 && (
            <div className="space-y-2 bg-red-50/50 p-3 rounded-xl border border-red-100">
              <span className="font-bold text-red-900 block text-[10px]">Active Restrictions:</span>
              <div className="space-y-1">
                {activeRestrictions.map((r) => (
                  <div key={r.id} className="flex justify-between items-center bg-white p-2 rounded border border-warm-150 text-[10px]">
                    <span className="font-semibold text-charcoal-800">{r.type}</span>
                    <button
                      onClick={() => handleRevokeRestriction(r.id)}
                      className="text-red-750 font-bold hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply restriction form */}
          <div className="space-y-2.5">
            <div className="space-y-1">
              <label className="font-bold text-charcoal-600 block">Restriction Type</label>
              <select
                value={restrictionType}
                onChange={(e) => setRestrictionType(e.target.value as RestrictionType)}
                className="w-full border border-warm-200 rounded-xl px-2 py-1.5 bg-warm-50/20 text-charcoal-800 font-bold"
              >
                <option value="BOOKING_RESTRICTED">Block Bookings</option>
                <option value="HOSTING_RESTRICTED">Block Hosting</option>
                <option value="MESSAGING_RESTRICTED">Block Messaging</option>
                <option value="PAYOUT_RESTRICTED">Block Payouts</option>
                <option value="AGENT_REFERRAL_RESTRICTED">Block Referrals</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-charcoal-600 block">Reason Code</label>
              <input
                type="text"
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                placeholder="e.g. MULTIPLE_COMPLAINTS"
                className="w-full border border-warm-200 rounded-xl px-2.5 py-1.5 bg-warm-50/20 text-charcoal-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-charcoal-600 block">Internal Investigation Notes</label>
              <textarea
                value={restrictionNotes}
                onChange={(e) => setRestrictionNotes(e.target.value)}
                placeholder="Details of the limitation..."
                className="w-full border border-warm-200 rounded-xl px-2.5 py-1.5 bg-warm-50/20 text-charcoal-800 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRestrict}
              disabled={loading}
              className="w-full bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl py-2 font-bold transition-all text-[11px]"
            >
              Apply Restriction
            </button>
          </div>
        </div>
      )}

      {/* Case Resolution Panel */}
      <div className="bg-white border border-warm-200/50 p-5 rounded-[2rem] shadow-sm space-y-3">
        <h4 className="font-display font-bold text-charcoal-900 border-b border-warm-100 pb-2">
          Incident Resolution Control
        </h4>
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="font-bold text-charcoal-600 block">Resolution Code</label>
            <input
              type="text"
              required
              value={resolutionCode}
              onChange={(e) => setResolutionCode(e.target.value)}
              placeholder="e.g. RESOLVED_REFUNDED, REJECTED"
              className="w-full border border-warm-200 rounded-xl px-2.5 py-1.5 bg-warm-50/20 text-charcoal-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-600 block">Resolution Notes</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Case resolution summary..."
              className="w-full border border-warm-200 rounded-xl px-2.5 py-1.5 bg-warm-50/20 text-charcoal-800 focus:outline-none"
            />
          </div>

          <button
            onClick={handleResolve}
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-2.5 font-bold transition-all text-[11px]"
          >
            Resolve Case & Close Files
          </button>
        </div>
      </div>
    </div>
  );
}

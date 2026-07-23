"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Star, ShieldCheck, Trash2, EyeOff, AlertTriangle, Activity, CheckSquare } from "lucide-react";
import { adminModerateReviewAction } from "@/lib/actions/reviews";

interface Report {
  id: string;
  reason: string;
  details: string;
  reporterName: string;
}

interface FraudSignal {
  id: string;
  type: string;
  severity: string;
  score: number;
  metadata: any;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  status: string;
  type: string;
  createdAt: string;
  travelerName: string;
  travelerEmail: string;
  weddingTitle: string;
  hostName: string;
  reports: Report[];
  fraudSignals: FraudSignal[];
}

interface AuditLog {
  id: string;
  action: string;
  reason: string;
  createdAt: string;
  moderatorName: string;
  reviewAuthor: string;
}

interface ClientAdminReviewsProps {
  initialReviews: ReviewData[];
  auditLogs: AuditLog[];
}

export function ClientAdminReviews({ initialReviews, auditLogs: initialLogs }: ClientAdminReviewsProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "logs">("queue");
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [moderationReason, setModerationReason] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleModeration = async (reviewId: string, action: "PUBLISH" | "HIDE" | "REMOVE" | "RESTORE") => {
    const reason = moderationReason[reviewId]?.trim() || `Moderator action: ${action}`;
    setProcessing((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await adminModerateReviewAction({ reviewId, action, reason });
      toast.success(`Review successfully marked as ${action}.`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      
      // Add to logs
      const author = reviews.find((r) => r.id === reviewId)?.travelerName || "Reviewer";
      const newLog: AuditLog = {
        id: `${reviewId}-${action.toLowerCase()}`,
        action,
        reason,
        createdAt: new Date().toISOString(),
        moderatorName: "Admin User",
        reviewAuthor: author
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to moderate review.");
    } finally {
      setProcessing((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Reviews Moderation Desk
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Audit reported guest feedback, inspect automated fraud signals, and issue moderation actions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-200 gap-6">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === "queue"
              ? "text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          Flagged Queue ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === "logs"
              ? "text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          Moderation History Logs ({logs.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "queue" ? (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-white border border-warm-200/50 rounded-[2rem] p-6 text-charcoal-400 font-semibold text-sm flex items-center justify-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              No reviews currently flagged for moderation review.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-5 flex flex-col md:flex-row gap-6 justify-between items-start hover:shadow-md transition-shadow duration-200"
              >
                {/* Left details */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-charcoal-800">
                      {rev.travelerName} ({rev.travelerEmail})
                    </span>
                    <span className="text-charcoal-400">•</span>
                    <span className="text-xs text-charcoal-500 font-medium">
                      Reviewed: {rev.weddingTitle} (Host: {rev.hostName})
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="bg-warm-50/50 border border-warm-200/40 p-4 rounded-2xl">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < rev.rating
                              ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                              : "text-warm-200"
                          }
                        />
                      ))}
                      <span className="text-xs text-charcoal-400 font-semibold ml-2">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-charcoal-700 text-xs sm:text-sm leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  {/* Fraud Signals and Reports */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Reports */}
                    {rev.reports.length > 0 && (
                      <div className="border border-red-100 bg-red-50/20 p-3.5 rounded-2xl space-y-2">
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          User Flag Reports ({rev.reports.length})
                        </span>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto">
                          {rev.reports.map((rep) => (
                            <div key={rep.id} className="text-xs text-charcoal-600 leading-normal border-b border-warm-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-bold text-charcoal-800">{rep.reporterName}</span>:{" "}
                              <span className="italic">{rep.reason}</span> - {rep.details}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fraud Flags */}
                    {rev.fraudSignals.length > 0 && (
                      <div className="border border-amber-100 bg-amber-50/20 p-3.5 rounded-2xl space-y-2">
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                          <ShieldCheck size={11} />
                          Heuristic Fraud Signals ({rev.fraudSignals.length})
                        </span>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto">
                          {rev.fraudSignals.map((fs) => (
                            <div key={fs.id} className="text-xs text-charcoal-600 leading-normal border-b border-warm-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-bold text-charcoal-800">{fs.type}</span>{" "}
                              <span className={`px-1.5 py-0.5 rounded text-[0.625rem] font-bold ${
                                fs.severity === "CRITICAL" || fs.severity === "HIGH"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-150"
                              }`}>
                                {fs.severity}
                              </span>
                              <div className="text-[0.625rem] text-charcoal-400 mt-0.5">
                                Confidence Score: {fs.score}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="space-y-3 w-full md:w-64 border-t md:border-t-0 md:border-l border-warm-250/30 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                  <div>
                    <label className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-1">
                      Audit Notes / Decision Rationale
                    </label>
                    <textarea
                      value={moderationReason[rev.id] || ""}
                      onChange={(e) =>
                        setModerationReason((prev) => ({
                          ...prev,
                          [rev.id]: e.target.value
                        }))
                      }
                      placeholder="Type details for the audit history log..."
                      rows={2}
                      className="w-full border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-850 p-2.5 outline-none focus:ring-1 focus:ring-maroon-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={processing[rev.id]}
                      onClick={() => handleModeration(rev.id, "PUBLISH")}
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckSquare size={13} />
                      Publish & Clear Flags
                    </button>

                    <button
                      disabled={processing[rev.id]}
                      onClick={() => handleModeration(rev.id, "HIDE")}
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl border border-warm-200 text-charcoal-600 hover:bg-warm-50 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      <EyeOff size={13} />
                      Hide Review
                    </button>

                    <button
                      disabled={processing[rev.id]}
                      onClick={() => handleModeration(rev.id, "REMOVE")}
                      className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Remove Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // History tab logs
        <div className="bg-white border border-warm-200/50 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-warm-200 text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Author</th>
                <th className="p-4">Moderator</th>
                <th className="p-4 rounded-tr-[2rem]">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 text-xs text-charcoal-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-charcoal-400 font-semibold">
                    No moderation logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-warm-50/50">
                    <td className="p-4 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[0.625rem] font-bold ${
                        log.action === "PUBLISH" || log.action === "RESTORE"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : log.action === "REMOVE"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-charcoal-50 text-charcoal-600 border border-charcoal-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-charcoal-900">{log.reviewAuthor}</td>
                    <td className="p-4">{log.moderatorName}</td>
                    <td className="p-4 max-w-xs truncate">{log.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

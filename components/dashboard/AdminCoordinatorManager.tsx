"use client";

import { useState } from "react";
import {
  adminAssignCoordinatorAction,
  adminUnassignCoordinatorAction,
} from "@/lib/actions/admin";
import {
  Compass,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CoordinatorItem {
  id: string;
  city: string;
  availability: string;
  eventExperience: string;
  status: string;
  assignedWeddingId: string | null;
  assignedEventTitle: string | null;
  assignedDate: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    status: string;
  } | null;
}

interface WeddingItem {
  id: string;
  title: string;
  location: string;
  date: Date | string;
}

export function AdminCoordinatorManager({
  initialCoordinators,
  publishedWeddings,
}: {
  initialCoordinators: CoordinatorItem[];
  publishedWeddings: WeddingItem[];
}) {
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>(initialCoordinators);
  const [selectedWedding, setSelectedWedding] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAssign = async (coordinatorId: string) => {
    const weddingId = selectedWedding[coordinatorId];
    if (!weddingId) {
      setMessage({ type: "error", text: "Please select a wedding to assign this coordinator." });
      return;
    }

    setLoading((prev) => ({ ...prev, [coordinatorId]: true }));
    setMessage(null);

    try {
      const res = await adminAssignCoordinatorAction(coordinatorId, weddingId);
      if (res.success && res.coordinator) {
        setCoordinators((prev) =>
          prev.map((c) =>
            c.id === coordinatorId
              ? {
                  ...c,
                  assignedWeddingId: res.coordinator.assignedWeddingId,
                  assignedEventTitle: res.coordinator.assignedEventTitle,
                  assignedDate: res.coordinator.assignedDate,
                }
              : c
          )
        );
        setMessage({ type: "success", text: `Assigned shift for "${res.coordinator.assignedEventTitle}" successfully!` });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to assign coordinator." });
    } finally {
      setLoading((prev) => ({ ...prev, [coordinatorId]: false }));
    }
  };

  const handleUnassign = async (coordinatorId: string) => {
    setLoading((prev) => ({ ...prev, [coordinatorId]: true }));
    setMessage(null);

    try {
      const res = await adminUnassignCoordinatorAction(coordinatorId);
      if (res.success && res.coordinator) {
        setCoordinators((prev) =>
          prev.map((c) =>
            c.id === coordinatorId
              ? {
                  ...c,
                  assignedWeddingId: null,
                  assignedEventTitle: null,
                  assignedDate: null,
                }
              : c
          )
        );
        setMessage({ type: "success", text: "Coordinator unassigned from shift." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to unassign coordinator." });
    } finally {
      setLoading((prev) => ({ ...prev, [coordinatorId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-warm-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <Compass size={20} className="text-[var(--color-brand-primary)]" />
              Active Coordinator Roster & Shift Deployments ({coordinators.length})
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Assign verified ground cultural coordinators to upcoming published wedding celebrations.
            </p>
          </div>
        </div>

        {coordinators.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400 font-semibold">
            No registered coordinator profiles found.
          </div>
        ) : (
          <div className="divide-y divide-warm-100">
            {coordinators.map((c) => {
              const isAssigned = !!c.assignedWeddingId;
              const isBusy = !!loading[c.id];

              return (
                <div key={c.id} className="p-6 hover:bg-warm-50/40 transition-colors space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Coordinator Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-charcoal-900">
                          {c.user?.name || c.user?.email || "Coordinator"}
                        </span>
                        <span
                          className={`text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-xs text-charcoal-400 font-medium">({c.city})</span>
                      </div>
                      <div className="text-xs text-charcoal-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-charcoal-400" />
                          {c.availability || "Full-time availability"}
                        </span>
                        <span>•</span>
                        <span>Exp: {c.eventExperience || "Hospitality & Cultural Events"}</span>
                      </div>
                    </div>

                    {/* Current Shift Badge */}
                    <div className="flex items-center gap-2">
                      {isAssigned ? (
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1 min-w-[220px]">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <UserCheck size={14} className="text-emerald-700" />
                            Assigned to Shift
                          </div>
                          <div className="text-emerald-800 font-semibold text-[0.6875rem] truncate max-w-[240px]">
                            {c.assignedEventTitle}
                          </div>
                          {c.assignedDate && (
                            <div className="text-emerald-600 text-[0.625rem] flex items-center gap-1">
                              <Calendar size={11} />
                              {formatDate(c.assignedDate)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-warm-100/60 border border-warm-200 rounded-2xl text-xs space-y-0.5 min-w-[220px]">
                          <div className="font-semibold text-charcoal-600 flex items-center gap-1.5">
                            <UserX size={14} className="text-charcoal-400" />
                            Unassigned (Available)
                          </div>
                          <div className="text-[0.6875rem] text-charcoal-400">Ready for ground placement.</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Assignment controls */}
                  <div className="pt-2 border-t border-warm-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {isAssigned ? (
                      <button
                        onClick={() => handleUnassign(c.id)}
                        disabled={isBusy}
                        className="btn btn-secondary text-xs font-bold py-1.5 px-3 text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center justify-center gap-1.5"
                      >
                        {isBusy ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
                        Unassign Shift
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <select
                          value={selectedWedding[c.id] || ""}
                          onChange={(e) =>
                            setSelectedWedding((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          disabled={isBusy}
                          className="text-xs bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-charcoal-800 font-medium focus:ring-1 focus:ring-[var(--color-brand-primary)] min-w-[260px]"
                        >
                          <option value="">Select Published Wedding Celebration...</option>
                          {publishedWeddings.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.title} ({w.location} • {formatDate(w.date)})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleAssign(c.id)}
                          disabled={isBusy || !selectedWedding[c.id]}
                          className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isBusy ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                          Deploy Shift
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

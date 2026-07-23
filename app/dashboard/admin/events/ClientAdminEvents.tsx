"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { manualCheckInAction, markAttendanceAction } from "@/lib/actions/event-operations";
import { Calendar, Users, ShieldAlert, History, UserCheck, CheckCircle, XCircle } from "lucide-react";

interface ClientAdminEventsProps {
  weddings: Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    hostCouple: {
      user: {
        name: string;
      };
    };
    bookings: Array<{
      id: string;
      guestsCount: number;
      status: string;
      traveler: {
        fullName: string;
        user: {
          email: string;
        };
      };
    }>;
  }>;
  checkInLogs: Array<{
    id: string;
    scanType: string;
    result: string;
    createdAt: string;
    guestPass: {
      booking: {
        traveler: {
          fullName: string;
        };
      };
    } | null;
  }>;
}

export default function ClientAdminEvents({ weddings, checkInLogs: initialLogs }: ClientAdminEventsProps) {
  const [selectedWedding, setSelectedWedding] = useState<any>(null);
  const [logs, setLogs] = useState(initialLogs);

  const handleManualCheckIn = async (bookingId: string) => {
    if (!confirm("Confirm administrator bypass manual check-in?")) return;
    try {
      await manualCheckInAction(bookingId, "Manual override by Admin");
      toast.success("Traveler marked as checked-in!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Override failed.");
    }
  };

  const handleMarkAttendance = async (bookingId: string, status: "ATTENDED" | "NO_SHOW") => {
    if (!confirm(`Mark booking attendance as ${status}?`)) return;
    try {
      await markAttendanceAction(bookingId, status);
      toast.success(`Attendance updated to ${status}!`);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Override failed.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
      {/* Wedding Events List Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-warm-100 flex items-center justify-between">
            <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <Calendar className="text-maroon-700" size={16} />
              Active Weddings & Experiences ({weddings.length})
            </span>
          </div>

          <div className="divide-y divide-warm-100">
            {weddings.map((w) => (
              <div key={w.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-warm-50/20 transition-all">
                <div className="space-y-1">
                  <div className="font-bold text-charcoal-900 text-sm">{w.title}</div>
                  <div className="text-[10px] text-charcoal-500">
                    Host: {w.hostCouple.user.name} • Location: {w.location}
                  </div>
                  <div className="text-[9px] text-charcoal-400">
                    Date: {new Date(w.date).toLocaleDateString()} • {w.bookings.length} Bookings
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedWedding(w)}
                    className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-4 py-2 font-bold transition-all"
                  >
                    Manage Bookings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Wedding Bookings Drawer list */}
        {selectedWedding && (
          <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-warm-100 flex items-center justify-between bg-warm-50/30">
              <div>
                <span className="font-display font-bold text-sm text-charcoal-900 block">
                  Bookings Manager: {selectedWedding.title}
                </span>
                <span className="text-[9px] text-charcoal-500">
                  Directly override statuses or scan registers for this wedding.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWedding(null)}
                className="text-charcoal-500 hover:text-charcoal-800 font-bold"
              >
                Close
              </button>
            </div>

            {selectedWedding.bookings.length === 0 ? (
              <p className="p-8 text-center text-charcoal-400">No bookings logged for this wedding.</p>
            ) : (
              <div className="divide-y divide-warm-100">
                {selectedWedding.bookings.map((b: any) => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-warm-50/10">
                    <div>
                      <div className="font-bold text-charcoal-900">{b.traveler.fullName}</div>
                      <div className="text-[10px] text-charcoal-500">
                        {b.traveler.user.email} • {b.guestsCount} guest(s)
                      </div>
                      <div className="text-[9px] text-charcoal-400">Status: {b.status}</div>
                    </div>

                    <div className="flex gap-2">
                      {b.status === "PAID" || b.status === "READY_FOR_EVENT" ? (
                        <button
                          type="button"
                          onClick={() => handleManualCheckIn(b.id)}
                          className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg px-3 py-1 font-bold text-[10px]"
                        >
                          Manual Check In
                        </button>
                      ) : b.status === "CHECKED_IN" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(b.id, "ATTENDED")}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg px-3 py-1 font-bold text-[10px]"
                          >
                            Mark Attended
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(b.id, "NO_SHOW")}
                            className="bg-red-800 hover:bg-red-900 text-white rounded-lg px-3 py-1 font-bold text-[10px]"
                          >
                            Mark No-Show
                          </button>
                        </div>
                      ) : (
                        <span className="text-charcoal-400 font-bold">Processed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Check-In Scan Logs Side Column */}
      <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
        <h2 className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5 border-b border-warm-100 pb-3">
          <History size={16} className="text-maroon-700 animate-spin-slow" />
          Live Gate Check-In Scans ({logs.length})
        </h2>

        {logs.length === 0 ? (
          <p className="text-charcoal-400 text-[10px] text-center p-4">No scans logged today.</p>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 border border-warm-100 rounded-xl space-y-1.5 text-[10px] hover:bg-warm-50/20 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-charcoal-900">
                    {log.guestPass?.booking.traveler.fullName || "Anonymous pass"}
                  </span>
                  <span
                    className={`font-black uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded ${
                      log.result === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {log.result}
                  </span>
                </div>
                <div className="text-[9px] text-charcoal-400">
                  Scan Type: {log.scanType} • {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

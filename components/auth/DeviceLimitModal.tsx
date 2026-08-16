"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, ShieldAlert, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";
import { DeviceSessionDTO } from "@/lib/services/device-session";
import { revokeDeviceSessionAction } from "@/lib/actions/device-session";

interface DeviceLimitModalProps {
  isOpen: boolean;
  activeSessions: DeviceSessionDTO[];
  onDeviceRevoked: () => Promise<void>;
  onCancelLogout: () => void;
}

export default function DeviceLimitModal({
  isOpen,
  activeSessions,
  onDeviceRevoked,
  onCancelLogout,
}: DeviceLimitModalProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await revokeDeviceSessionAction(sessionId);
      if (res.success) {
        setSuccessMessage("Device session logged out successfully. Initializing this device...");
        await onDeviceRevoked();
      } else {
        setErrorMessage(res.message || "Failed to log out device session.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-warm-200/80 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            Maximum 2 Devices Reached
          </h2>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            Your account is currently active on 2 devices. For security and fraud prevention,
            you can have a maximum of 2 active devices simultaneously.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        <div className="space-y-3 text-left">
          <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block px-1">
            Active Sessions ({activeSessions.length}/2)
          </span>

          <div className="divide-y divide-warm-100 border border-warm-200 rounded-2xl overflow-hidden bg-warm-50/50">
            {activeSessions.map((s) => {
              const isMobile = s.deviceName?.toLowerCase().includes("mobile") ||
                s.deviceName?.toLowerCase().includes("phone") ||
                s.deviceName?.toLowerCase().includes("android") ||
                s.deviceName?.toLowerCase().includes("ipad");

              const formattedDate = new Date(s.lastActiveAt).toLocaleString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={s.id} className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-warm-50/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-warm-100 text-charcoal-700 flex items-center justify-center flex-shrink-0">
                      {isMobile ? <Smartphone size={20} /> : <Laptop size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal-900 truncate">
                        {s.deviceName || "Web Browser"}
                      </p>
                      <p className="text-xs text-charcoal-500 truncate">
                        Active {formattedDate} {s.ipAddress ? `• IP: ${s.ipAddress}` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(s.id)}
                    disabled={revokingId !== null}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {revokingId === s.id ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <LogOut size={13} />
                    )}
                    {revokingId === s.id ? "Logging out..." : "Log out"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCancelLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-warm-100 text-charcoal-700 hover:bg-warm-200 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
}

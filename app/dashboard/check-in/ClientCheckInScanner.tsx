"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { checkInGuestAction } from "@/lib/actions/event-operations";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ClientCheckInScannerProps {
  weddings: Array<{
    id: string;
    title: string;
    location: string;
  }>;
}

interface CheckInPass {
  id: string;
  passCode: string;
  status: string;
  scanCount: number;
  firstScannedAt?: Date | string | null;
  revokedReason?: string | null;
  booking: {
    id: string;
    guestsCount: number;
    traveler: {
      fullName: string;
    };
  };
}

interface CheckInResult {
  success: boolean;
  result: string;
  pass?: CheckInPass;
}

export default function ClientCheckInScanner({ weddings }: ClientCheckInScannerProps) {
  const searchParams = useSearchParams();

  const [selectedWeddingId, setSelectedWeddingId] = useState(weddings[0]?.id || "");
  const [rawToken, setRawToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  // Auto handle QR scanned URL redirects
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setRawToken(token);
    }
  }, [searchParams]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !rawToken.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await checkInGuestAction(rawToken.trim(), selectedWeddingId);
      setResult(res as CheckInResult);
    } catch {
      setResult({
        success: false,
        result: "INVALID",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheckIn} className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
        {/* Select Event */}
        <div className="space-y-1">
          <label htmlFor="scan-wedding" className="font-bold text-charcoal-700">Select Wedding Event</label>
          <select
            id="scan-wedding"
            value={selectedWeddingId}
            onChange={(e) => {
              setSelectedWeddingId(e.target.value);
              setResult(null);
            }}
            className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-850 font-bold focus:outline-none"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.location})
              </option>
            ))}
          </select>
        </div>

        {/* Input Raw Token */}
        <div className="space-y-1">
          <label htmlFor="scan-token" className="font-bold text-charcoal-700">Enter QR Pass Token</label>
          <div className="flex gap-2">
            <input
              id="scan-token"
              type="text"
              required
              value={rawToken}
              onChange={(e) => setRawToken(e.target.value)}
              placeholder="e.g. 7f4a5c92..."
              className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
            />
            <button
              type="submit"
              disabled={loading || !selectedWeddingId}
              className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-6 py-2 font-bold disabled:opacity-50 transition-all"
            >
              {loading ? "Checking..." : "Verify"}
            </button>
          </div>
        </div>
      </form>

      {/* Result Card Banner */}
      {result && (
        <div className="space-y-4">
          {result.result === "SUCCESS" && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-emerald-950 flex gap-4">
              <CheckCircle className="text-emerald-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-emerald-900">Access Granted</h3>
                <p>Guest checked in successfully at gates.</p>
                <div className="border-t border-emerald-200/50 pt-2 text-[10px] space-y-0.5 text-emerald-800 font-semibold">
                  <p>Guest: {result.pass?.booking?.traveler?.fullName ?? "—"}</p>
                  <p>Pass Count: {result.pass?.booking?.guestsCount ?? "—"} Attendee(s)</p>
                  <p>Ref: {result.pass?.booking?.id?.substring(0, 8) ?? "—"}</p>
                </div>
              </div>
            </div>
          )}

          {result.result === "ALREADY_USED" && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl text-amber-950 flex gap-4">
              <AlertCircle className="text-amber-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-amber-900">Pass Already Used</h3>
                <p>This entry code has already completed check-in gates registration.</p>
                <div className="border-t border-amber-200/50 pt-2 text-[10px] space-y-0.5 text-amber-800 font-semibold">
                  <p>Guest: {result.pass?.booking?.traveler?.fullName ?? "—"}</p>
                  {result.pass?.firstScannedAt && (
                    <p>First Scanned: {formatDateTime(result.pass.firstScannedAt)}</p>
                  )}
                  <p>Total Scans: {result.pass?.scanCount ?? "—"}</p>
                </div>
              </div>
            </div>
          )}

          {result.result === "REVOKED" && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-950 flex gap-4">
              <XCircle className="text-rose-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-rose-900">Pass Revoked</h3>
                <p className="font-semibold">Reason: {result.pass?.revokedReason ?? "N/A"}</p>
              </div>
            </div>
          )}

          {result.result === "EXPIRED" && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-950 flex gap-4">
              <XCircle className="text-rose-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-rose-900">Pass Expired</h3>
                <p>This pass validity window has closed.</p>
              </div>
            </div>
          )}

          {result.result === "WRONG_EVENT" && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-950 flex gap-4">
              <XCircle className="text-rose-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-rose-900">Wrong Event Location</h3>
                <p>This pass belongs to another wedding experience outlet.</p>
              </div>
            </div>
          )}

          {result.result === "INVALID" && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-950 flex gap-4">
              <XCircle className="text-rose-800 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-2 text-xs">
                <h3 className="font-display font-black text-sm text-rose-900">Invalid Entry Pass</h3>
                <p>No matching active check-in credentials found.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

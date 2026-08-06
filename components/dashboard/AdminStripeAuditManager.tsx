"use client";

import React, { useState } from "react";
import { processFullRefundAction, processPartialRefundAction, retryStripeWebhookEventAction } from "@/lib/actions/stripe";
import { RefreshCcw, Activity, RotateCw } from "lucide-react";

interface AdminStripeAuditManagerProps {
  transactions: any[];
  refundQueue: any[];
  payoutQueue: any[];
  webhookEvents: any[];
}

export default function AdminStripeAuditManager({
  transactions: _transactions,
  refundQueue: _refundQueue,
  payoutQueue: _payoutQueue,
  webhookEvents: initialWebhooks,
}: AdminStripeAuditManagerProps) {
  const [webhooks, setWebhooks] = useState(initialWebhooks || []);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState<number>(50);
  const [refundReason, setRefundReason] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    setLoading(true);
    setMsg(null);

    try {
      if (refundType === "full") {
        await processFullRefundAction(selectedTx.paymentId, refundReason || "Audited Full Refund");
        setMsg(`Full refund issued successfully for transaction ${selectedTx.referenceId}!`);
      } else {
        await processPartialRefundAction(selectedTx.paymentId, partialAmount, refundReason || "Audited Partial Refund");
        setMsg(`Partial refund of $${partialAmount} USD issued successfully!`);
      }
      setSelectedTx(null);
    } catch (err: any) {
      setMsg(`Error: ${err.message || "Failed to process refund."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWebhook = async (eventId: string) => {
    try {
      await retryStripeWebhookEventAction(eventId);
      setWebhooks(webhooks.map((w) => (w.id === eventId ? { ...w, status: "PROCESSED" } : w)));
      setMsg("Webhook event manually retried and processed!");
    } catch (err: any) {
      setMsg(`Error retrying webhook: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-4 bg-maroon-50 border border-maroon-200 rounded-2xl text-xs font-semibold text-maroon-800 flex items-center gap-2">
          <Activity size={16} />
          {msg}
        </div>
      )}

      {/* Webhook Audit Register */}
      <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-warm-100 pb-3">
          <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-maroon-600" />
            Stripe Webhook Event Audit Register ({webhooks.length})
          </h3>
          <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest">
            Production Webhook Queue
          </span>
        </div>

        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No webhook events recorded in system registry yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {webhooks.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3.5 bg-warm-50/60 border border-warm-200/80 rounded-2xl text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-charcoal-900 text-xs flex items-center gap-2">
                    <span>{w.type}</span>
                    <span className="text-[0.625rem] text-charcoal-400">({w.stripeEventId.slice(0, 14)})</span>
                  </div>
                  <div className="text-[0.6875rem] text-charcoal-500">
                    Logged: {new Date(w.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ${
                      w.status === "PROCESSED"
                        ? "bg-emerald-100 text-emerald-800"
                        : w.status === "FAILED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {w.status}
                  </span>

                  {w.status === "FAILED" && (
                    <button
                      onClick={() => handleRetryWebhook(w.id)}
                      className="px-3 py-1 bg-maroon-600 text-white rounded-xl font-bold text-[0.625rem] hover:bg-maroon-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw size={12} /> Retry Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actionable Refund Trigger Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleIssueRefund} className="bg-white border border-warm-200 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2 border-b border-warm-100 pb-3">
              <RefreshCcw className="w-5 h-5 text-rose-600" />
              Issue Stripe Refund
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-warm-50 rounded-xl text-xs space-y-1">
                <div><strong>Transaction:</strong> {selectedTx.referenceId}</div>
                <div><strong>Total Paid:</strong> ${selectedTx.amount} USD</div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-charcoal-800 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    checked={refundType === "full"}
                    onChange={() => setRefundType("full")}
                    className="text-maroon-600"
                  />
                  Full Refund (${selectedTx.amount})
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-charcoal-800 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    checked={refundType === "partial"}
                    onChange={() => setRefundType("partial")}
                    className="text-maroon-600"
                  />
                  Partial Refund
                </label>
              </div>

              {refundType === "partial" && (
                <div className="space-y-1">
                  <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Partial Amount ($ USD)</label>
                  <input
                    type="number"
                    max={selectedTx.amount - 1}
                    min={1}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(parseFloat(e.target.value))}
                    className="input-luxury text-xs font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Audit Reason / Notes</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Traveler requested date modification / Host mutual agreement..."
                  rows={3}
                  className="input-luxury text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn bg-rose-600 text-white hover:bg-rose-700 btn-sm cursor-pointer"
              >
                {loading ? "Processing..." : "Confirm & Execute Refund"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

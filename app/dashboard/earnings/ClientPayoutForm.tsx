"use client";

import React, { useState } from "react";
import { submitPayoutRequestAction } from "@/lib/actions/referrals";
import { Coins, AlertCircle } from "lucide-react";

interface ClientPayoutFormProps {
  payableBalance: number;
}

export default function ClientPayoutForm({ payableBalance }: ClientPayoutFormProps) {
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState<"BANK_TRANSFER" | "STRIPE_CONNECT" | "MANUAL">("BANK_TRANSFER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const MIN_THRESHOLD = 50;
  const canRequest = payableBalance >= MIN_THRESHOLD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      if (amount > payableBalance) {
        throw new Error("Payout amount exceeds your payable balance.");
      }
      if (amount < MIN_THRESHOLD) {
        throw new Error(`Minimum payout threshold is $${MIN_THRESHOLD}.`);
      }

      await submitPayoutRequestAction({ amount, method });
      setSuccess(true);
      setAmount(MIN_THRESHOLD);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
      <h2 className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
        <Coins size={16} className="text-maroon-700" />
        Submit Payout Request
      </h2>

      {!canRequest ? (
        <div className="bg-warm-50 border border-warm-100 p-4 rounded-2xl flex gap-2 text-[10px] text-charcoal-600">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={16} />
          <div>
            <p className="font-bold text-charcoal-700">Minimum Threshold Unreached</p>
            <p className="mt-0.5">
              You must reach a payable balance of at least <strong>${MIN_THRESHOLD}.00</strong> before requesting a payout transfer.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium">
              Payout requested successfully! The finance team is reviewing your transfer.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1">
            <label htmlFor="payout-amount" className="font-bold text-charcoal-700">Transfer Amount ($)</label>
            <input
              id="payout-amount"
              type="number"
              min={MIN_THRESHOLD}
              max={payableBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
              required
            />
            <span className="text-[9px] text-charcoal-400">
              Maximum request limit is your payable balance of ${payableBalance.toFixed(2)}.
            </span>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label htmlFor="payout-method" className="font-bold text-charcoal-700">Withdrawal Method</label>
            <select
              id="payout-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as "BANK_TRANSFER" | "STRIPE_CONNECT" | "MANUAL")}
              className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
            >
              <option value="BANK_TRANSFER">Bank Wire Transfer</option>
              <option value="STRIPE_CONNECT">Stripe Connect Instant Payout</option>
              <option value="MANUAL">Manual Wire (Agent Invoice)</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl py-2.5 font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Payout Request"}
          </button>
        </form>
      )}
    </div>
  );
}

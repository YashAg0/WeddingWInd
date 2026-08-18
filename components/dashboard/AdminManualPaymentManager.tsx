"use client";

import React, { useState } from "react";
import {
  adminRequestPaymentAction,
  adminUpdatePaymentRequestAction,
  adminMarkPaymentPaidAction,
  adminRecordManualRefundAction,
} from "@/lib/actions/payment-manual";
import {
  RefreshCcw,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Clock,
  History,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";

interface AdminManualPaymentManagerProps {
  transactions: any[];
  refundQueue: any[];
  payoutQueue: any[];
  pendingBookings?: any[];
  allPayments?: any[];
}

export default function AdminManualPaymentManager({
  transactions: initialTransactions = [],
  refundQueue: initialRefunds = [],
  payoutQueue: _initialPayouts = [],
  pendingBookings: initialBookings = [],
  allPayments: initialAllPayments = [],
}: AdminManualPaymentManagerProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "create" | "refunds" | "ledger">("pending");
  const [transactions] = useState(initialTransactions);
  const [refunds] = useState(initialRefunds);
  const [payments] = useState(initialAllPayments);
  const [bookings] = useState(initialBookings);

  // Mark Paid Modal state
  const [selectedPaymentToPay, setSelectedPaymentToPay] = useState<any | null>(null);
  const [paypalTxnId, setPaypalTxnId] = useState("");
  const [markPaidNotes, setMarkPaidNotes] = useState("");

  // Edit Payment Request Modal state
  const [selectedPaymentToEdit, setSelectedPaymentToEdit] = useState<any | null>(null);
  const [editBaseAmount, setEditBaseAmount] = useState<number>(0);
  const [editFeePercent, setEditFeePercent] = useState<number>(3.5);
  const [editFeeFixed, setEditFeeFixed] = useState<number>(0);
  const [editPaymentLink, setEditPaymentLink] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editNotes, setEditNotes] = useState("");

  // Create Payment Request state
  const [createBookingId, setCreateBookingId] = useState("");
  const [createBaseAmount, setCreateBaseAmount] = useState<number>(100);
  const [createFeePercent, setCreateFeePercent] = useState<number>(3.5);
  const [createFeeFixed, setCreateFeeFixed] = useState<number>(0);
  const [createPaymentLink, setCreatePaymentLink] = useState("");
  const [createCurrency, setCreateCurrency] = useState("USD");
  const [createNotes, setCreateNotes] = useState("");

  // Refund Modal state
  const [selectedPaymentToRefund, setSelectedPaymentToRefund] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundTxnId, setRefundTxnId] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fee calculation helper
  const calculateTotal = (base: number, pct: number, fixed: number) => {
    const fee = Math.round(((base * pct) / 100 + fixed) * 100) / 100;
    const total = Math.round((base + fee) * 100) / 100;
    return { fee, total };
  };

  const createCalc = calculateTotal(createBaseAmount, createFeePercent, createFeeFixed);
  const editCalc = calculateTotal(editBaseAmount, editFeePercent, editFeeFixed);

  // 1. Submit Mark as Paid
  const handleMarkAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentToPay) return;
    if (!paypalTxnId.trim()) {
      setFeedback({ type: "error", message: "PayPal Transaction ID is required." });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      await adminMarkPaymentPaidAction({
        paymentId: selectedPaymentToPay.id,
        transactionId: paypalTxnId.trim(),
        paymentNotes: markPaidNotes.trim() || undefined,
      });
      setFeedback({
        type: "success",
        message: `Payment marked as PAID! Transaction ID: ${paypalTxnId}. Pass confirmed & email dispatched.`,
      });
      setSelectedPaymentToPay(null);
      setPaypalTxnId("");
      setMarkPaidNotes("");
      window.location.reload();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to confirm payment." });
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Edit Payment Request
  const handleUpdatePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentToEdit) return;
    setLoading(true);
    setFeedback(null);
    try {
      await adminUpdatePaymentRequestAction({
        paymentId: selectedPaymentToEdit.id,
        baseAmount: editBaseAmount,
        feePercent: editFeePercent,
        feeFixedAmount: editFeeFixed,
        currency: editCurrency,
        paymentLink: editPaymentLink.trim(),
        paymentNotes: editNotes.trim() || undefined,
      });
      setFeedback({ type: "success", message: "Payment request updated successfully!" });
      setSelectedPaymentToEdit(null);
      window.location.reload();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update payment request." });
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Create Payment Request
  const handleCreatePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBookingId) {
      setFeedback({ type: "error", message: "Please select a booking." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await adminRequestPaymentAction({
        bookingId: createBookingId,
        baseAmount: createBaseAmount,
        feePercent: createFeePercent,
        feeFixedAmount: createFeeFixed,
        currency: createCurrency,
        paymentLink: createPaymentLink.trim(),
        paymentNotes: createNotes.trim() || undefined,
      });
      setFeedback({ type: "success", message: "Payment request created & dispatched to traveler!" });
      setCreateBookingId("");
      setCreatePaymentLink("");
      setCreateNotes("");
      window.location.reload();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create payment request." });
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Manual Refund
  const handleRecordRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentToRefund) return;
    setLoading(true);
    setFeedback(null);
    try {
      await adminRecordManualRefundAction({
        paymentId: selectedPaymentToRefund.id,
        refundAmount: refundAmount,
        reason: refundReason.trim() || "Manual PayPal Refund",
        refundTransactionId: refundTxnId.trim() || undefined,
        refundNotes: refundNotes.trim() || undefined,
      });
      setFeedback({ type: "success", message: `Manual refund of $${refundAmount} USD recorded successfully!` });
      setSelectedPaymentToRefund(null);
      setRefundReason("");
      setRefundTxnId("");
      setRefundNotes("");
      window.location.reload();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to record refund." });
    } finally {
      setLoading(false);
    }
  };

  // Filter pending payments
  const pendingPayments = payments.filter((p) => p.status === "PENDING" || !p.status || p.status === "AWAITING_PAYMENT");
  const paidPayments = payments.filter((p) => p.status === "PAID");

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
      (t.type && t.type.toLowerCase().includes(q)) ||
      (t.payment?.booking?.traveler?.fullName && t.payment.booking.traveler.fullName.toLowerCase().includes(q)) ||
      (t.payment?.booking?.wedding?.title && t.payment.booking.wedding.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-charcoal-400 hover:text-charcoal-700 text-sm font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-warm-200 gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "pending"
              ? "text-maroon-700 border-b-2 border-maroon-700 font-black"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          <Clock size={16} />
          Pending Verification ({pendingPayments.length})
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "create"
              ? "text-maroon-700 border-b-2 border-maroon-700 font-black"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          <PlusCircle size={16} />
          Request Payment
        </button>

        <button
          onClick={() => setActiveTab("refunds")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "refunds"
              ? "text-maroon-700 border-b-2 border-maroon-700 font-black"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          <RefreshCcw size={16} />
          Manual Refunds ({refunds.length})
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "ledger"
              ? "text-maroon-700 border-b-2 border-maroon-700 font-black"
              : "text-charcoal-400 hover:text-charcoal-700"
          }`}
        >
          <History size={16} />
          Full Transaction Ledger ({transactions.length})
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION QUEUE */}
      {activeTab === "pending" && (
        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-warm-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Payments Awaiting Admin Verification
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Verify external PayPal transactions, enter the Transaction ID, and confirm pass issuance.
              </p>
            </div>
            <span className="text-[0.6875rem] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Manual PayPal Queue
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-charcoal-400 font-semibold space-y-2">
              <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2" />
              <p>No pending payments awaiting verification at this time.</p>
              <p className="text-[0.6875rem] text-charcoal-400">All customer payment requests are verified or none have been submitted.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((p) => {
                const travelerName = p.booking?.traveler?.fullName || "Guest Traveler";
                const travelerEmail = p.booking?.traveler?.user?.email || "—";
                const weddingTitle = p.booking?.wedding?.title || "Celebration Event";
                const base = p.baseAmount ?? p.amount;
                const fee = p.processingFeeAmount ?? 0;
                const feePct = p.processingFeePercent ?? 0;
                const total = p.totalAmount ?? p.amount;
                const currency = p.currency || "USD";

                return (
                  <div
                    key={p.id}
                    className="border border-warm-200 rounded-2xl p-5 hover:border-warm-300 transition-all bg-warm-50/30 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-charcoal-900">{travelerName}</div>
                        <div className="text-[0.6875rem] text-charcoal-500">{travelerEmail}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black text-base text-maroon-700">
                          ${total.toLocaleString()} {currency}
                        </span>
                        <div className="text-[0.625rem] text-charcoal-400">
                          Base: ${base.toLocaleString()} + Fee ({feePct}%): ${fee.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[0.6875rem] text-charcoal-600">
                      <div>
                        <strong>Wedding:</strong> {weddingTitle}
                      </div>
                      <div>
                        <strong>Booking ID:</strong> <span className="font-mono">{p.bookingId}</span>
                      </div>
                      <div>
                        <strong>Requested At:</strong>{" "}
                        {p.paymentRequestedAt ? new Date(p.paymentRequestedAt).toLocaleString() : new Date(p.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md uppercase text-[0.625rem]">
                          {p.status || "PENDING"}
                        </span>
                      </div>
                    </div>

                    {p.paymentLink && (
                      <div className="p-2.5 bg-white rounded-xl border border-warm-200/80 flex items-center justify-between gap-2">
                        <span className="text-[0.6875rem] font-mono text-charcoal-600 truncate">
                          <strong>PayPal URL:</strong> {p.paymentLink}
                        </span>
                        <a
                          href={p.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[0.6875rem] font-bold text-maroon-700 hover:underline flex-shrink-0"
                        >
                          Open <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {p.paymentNotes && (
                      <div className="text-[0.6875rem] text-charcoal-500 bg-white p-2 rounded-lg border border-warm-100">
                        <em>Notes: {p.paymentNotes}</em>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex justify-end gap-2 pt-1 border-t border-warm-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentToEdit(p);
                          setEditBaseAmount(base);
                          setEditFeePercent(feePct || 3.5);
                          setEditFeeFixed(0);
                          setEditPaymentLink(p.paymentLink || "");
                          setEditCurrency(currency);
                          setEditNotes(p.paymentNotes || "");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-warm-200 bg-white hover:bg-warm-50 text-[0.6875rem] font-bold text-charcoal-700 cursor-pointer"
                      >
                        Edit Request
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentToPay(p);
                          setPaypalTxnId("");
                          setMarkPaidNotes(p.paymentNotes || "");
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[0.6875rem] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 size={13} />
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE PAYMENT REQUEST */}
      {activeTab === "create" && (
        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-warm-100 pb-3">
            <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-maroon-600" />
              Create PayPal Payment Request
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Set the price, processing fee %, currency, and your PayPal payment/invoice URL for an approved booking.
            </p>
          </div>

          <form onSubmit={handleCreatePaymentRequest} className="space-y-4 text-xs">
            {/* Booking Selector */}
            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Select Booking *
              </label>
              {bookings.length === 0 ? (
                <p className="text-rose-600 italic">No bookings found in database.</p>
              ) : (
                <select
                  value={createBookingId}
                  onChange={(e) => {
                    setCreateBookingId(e.target.value);
                    const selected = bookings.find((b) => b.id === e.target.value);
                    if (selected) {
                      setCreateBaseAmount(selected.totalAmount || 100);
                    }
                  }}
                  required
                  className="input-luxury text-xs w-full"
                >
                  <option value="">-- Choose Approved / Pending Booking --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.traveler?.fullName || "Guest"} — {b.wedding?.title} ({b.status}, ${b.totalAmount} USD)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Base Amount & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  Base Amount ($) *
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={createBaseAmount}
                  onChange={(e) => setCreateBaseAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="input-luxury text-xs font-mono w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  Currency
                </label>
                <select
                  value={createCurrency}
                  onChange={(e) => setCreateCurrency(e.target.value)}
                  className="input-luxury text-xs w-full"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Processing Fee Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  PayPal Processing Fee % (Default: 3.5%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step="0.1"
                  value={createFeePercent}
                  onChange={(e) => setCreateFeePercent(parseFloat(e.target.value) || 0)}
                  className="input-luxury text-xs font-mono w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  Fixed Surcharge ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={createFeeFixed}
                  onChange={(e) => setCreateFeeFixed(parseFloat(e.target.value) || 0)}
                  className="input-luxury text-xs font-mono w-full"
                />
              </div>
            </div>

            {/* Real-time Calculation Breakdown Preview */}
            <div className="p-4 bg-maroon-50/60 border border-maroon-100 rounded-2xl space-y-1.5">
              <div className="text-[0.6875rem] font-bold uppercase tracking-wider text-maroon-900">
                Customer Breakdown Preview
              </div>
              <div className="flex justify-between text-charcoal-700">
                <span>Base Wedding Price:</span>
                <span className="font-mono">${createCalc.total > 0 ? createBaseAmount.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <span>PayPal Processing Surcharge ({createFeePercent}%):</span>
                <span className="font-mono">${createCalc.fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-maroon-200 pt-1.5 flex justify-between font-bold text-maroon-900 text-sm">
                <span>Total Payment Requested:</span>
                <span className="font-mono font-black">${createCalc.total.toFixed(2)} {createCurrency}</span>
              </div>
            </div>

            {/* PayPal Payment / Invoice URL */}
            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                PayPal Payment Link / Invoice URL *
              </label>
              <input
                type="url"
                placeholder="https://www.paypal.com/invoice/p/#... or https://paypal.me/..."
                value={createPaymentLink}
                onChange={(e) => setCreatePaymentLink(e.target.value)}
                required
                className="input-luxury text-xs font-mono w-full"
              />
              <p className="text-[0.625rem] text-charcoal-400">
                Must be an HTTPS link from an allowed domain (e.g. paypal.com, paypal.me).
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Instructions / Notes for Customer (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Please include your booking reference in PayPal notes..."
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                className="input-luxury text-xs resize-none w-full"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create & Send Payment Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MANUAL REFUNDS */}
      {activeTab === "refunds" && (
        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-warm-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-rose-600" />
                Manual Refund Records
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Issue manual refunds for paid bookings after refunding the customer outside WeddingWithIndia via PayPal.
              </p>
            </div>
          </div>

          {/* Paid bookings list available for refund */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-charcoal-800 uppercase tracking-wider">
              Paid Bookings Eligible for Manual Refund
            </h4>
            {paidPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-400 font-semibold border border-dashed rounded-2xl">
                No paid bookings available in the system.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paidPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border border-warm-200 rounded-2xl bg-warm-50/40 text-xs flex justify-between items-center gap-3"
                  >
                    <div>
                      <div className="font-bold text-charcoal-900">
                        {p.booking?.traveler?.fullName || "Guest"}
                      </div>
                      <div className="text-[0.6875rem] text-charcoal-500">{p.booking?.wedding?.title}</div>
                      <div className="text-[0.6875rem] text-emerald-700 font-bold mt-0.5">
                        Paid: ${p.amount} {p.currency} (Txn: {p.transactionId || "Recorded"})
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentToRefund(p);
                        setRefundAmount(p.amount);
                        setRefundReason("Customer Requested Refund");
                        setRefundTxnId(`REF-PP-${Date.now()}`);
                        setRefundNotes("");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[0.6875rem] uppercase tracking-wider cursor-pointer flex-shrink-0"
                    >
                      Issue Refund
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Refund Records */}
          <div className="space-y-3 pt-4 border-t border-warm-100">
            <h4 className="font-bold text-xs text-charcoal-800 uppercase tracking-wider">
              Executed Refund History ({refunds.length})
            </h4>
            {refunds.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-400">No refunds recorded yet.</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {refunds.map((r) => (
                  <div key={r.id} className="p-3.5 border border-warm-200 rounded-xl text-xs flex justify-between items-center bg-white">
                    <div>
                      <div className="font-bold text-rose-700">-${r.amount} USD</div>
                      <div className="text-[0.6875rem] text-charcoal-500">
                        Reason: {r.reason || "Manual Refund"} | Ref: {r.refundTransactionId || r.stripeRefundId || r.id}
                      </div>
                    </div>
                    <span className="text-[0.625rem] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                      {r.status || "REFUNDED"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FULL TRANSACTION LEDGER */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-warm-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <History className="w-5 h-5 text-maroon-600" />
                Complete Financial Ledger
              </h3>
              <p className="text-xs text-charcoal-500">
                Authoritative transaction ledger with reference IDs and provider tags.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Txn ID, Guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-luxury text-xs pl-9 w-full py-1.5"
              />
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400">
              No transactions match your search query.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredTransactions.map((t) => {
                const travelerName = t.payment?.booking?.traveler?.fullName || "Guest";
                const weddingTitle = t.payment?.booking?.wedding?.title || "Celebration";
                const isRefund = t.type === "REFUND";

                return (
                  <div
                    key={t.id}
                    className="p-3.5 border border-warm-200 rounded-2xl text-xs hover:border-warm-300 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-white"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isRefund ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {isRefund ? "-$" : "+$"}{t.amount} USD
                        </span>
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-warm-100 text-charcoal-700 px-2 py-0.5 rounded-full">
                          {t.type}
                        </span>
                        <span className="text-[0.625rem] text-charcoal-400 font-mono">
                          Ref: {t.referenceId || t.id}
                        </span>
                      </div>
                      <div className="text-[0.6875rem] text-charcoal-500">
                        {travelerName} • {weddingTitle}
                      </div>
                    </div>

                    <div className="text-right text-[0.625rem] text-charcoal-400 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                      <span className="font-bold text-emerald-700 uppercase">
                        {t.status || "SUCCESS"}
                      </span>
                      <span>{t.createdAt ? new Date(t.createdAt).toLocaleString() : "Recently"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: MARK AS PAID */}
      {selectedPaymentToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleMarkAsPaid}
            className="bg-white border border-warm-200 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-5 text-left animate-scale-in"
          >
            <div className="border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Confirm & Mark Payment as Paid
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter the verified PayPal transaction reference ID to atomically confirm pass issuance.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
              <div>
                <strong>Guest:</strong> {selectedPaymentToPay.booking?.traveler?.fullName || "Guest"}
              </div>
              <div>
                <strong>Amount Paid:</strong>{" "}
                <span className="font-bold text-emerald-800">
                  ${selectedPaymentToPay.totalAmount ?? selectedPaymentToPay.amount}{" "}
                  {selectedPaymentToPay.currency || "USD"}
                </span>
              </div>
              <div>
                <strong>Wedding:</strong> {selectedPaymentToPay.booking?.wedding?.title}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                PayPal Transaction ID * (Mandatory)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5XY89201A9482012L"
                value={paypalTxnId}
                onChange={(e) => setPaypalTxnId(e.target.value)}
                className="input-luxury text-xs font-mono w-full"
              />
              <p className="text-[0.625rem] text-charcoal-400">
                Copy the 17-character Transaction ID from your PayPal merchant dashboard.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Verification Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Verified against PayPal statement on..."
                value={markPaidNotes}
                onChange={(e) => setMarkPaidNotes(e.target.value)}
                className="input-luxury text-xs resize-none w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentToPay(null)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !paypalTxnId.trim()}
                className="btn bg-emerald-600 text-white hover:bg-emerald-700 btn-sm cursor-pointer disabled:opacity-50 font-bold"
              >
                {loading ? "Confirming..." : "Confirm & Issue Pass"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT PAYMENT REQUEST */}
      {selectedPaymentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleUpdatePaymentRequest}
            className="bg-white border border-warm-200 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-4 text-left animate-scale-in"
          >
            <div className="border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-maroon-600" />
                Edit Payment Request
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Update amount, fee, or PayPal URL before payment is confirmed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={editBaseAmount}
                  onChange={(e) => setEditBaseAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="input-luxury text-xs font-mono w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                  Fee %
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step="0.1"
                  value={editFeePercent}
                  onChange={(e) => setEditFeePercent(parseFloat(e.target.value) || 0)}
                  className="input-luxury text-xs font-mono w-full"
                />
              </div>
            </div>

            <div className="p-3 bg-warm-50 rounded-xl text-xs flex justify-between font-bold text-charcoal-800">
              <span>Total Request Amount:</span>
              <span className="text-maroon-700 font-mono">${editCalc.total.toFixed(2)} {editCurrency}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                PayPal Payment Link *
              </label>
              <input
                type="url"
                required
                value={editPaymentLink}
                onChange={(e) => setEditPaymentLink(e.target.value)}
                className="input-luxury text-xs font-mono w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Notes
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="input-luxury text-xs resize-none w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentToEdit(null)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn bg-maroon-700 text-white hover:bg-maroon-800 btn-sm cursor-pointer font-bold"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ISSUE MANUAL REFUND */}
      {selectedPaymentToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleRecordRefund}
            className="bg-white border border-warm-200 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-4 text-left animate-scale-in"
          >
            <div className="border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-rose-600" />
                Record Manual PayPal Refund
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Record the refund transaction after executing it in PayPal.
              </p>
            </div>

            <div className="p-3 bg-warm-50 rounded-xl text-xs space-y-1">
              <div>
                <strong>Guest:</strong> {selectedPaymentToRefund.booking?.traveler?.fullName || "Guest"}
              </div>
              <div>
                <strong>Original Paid:</strong> ${selectedPaymentToRefund.amount} USD
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Refund Amount ($ USD) *
              </label>
              <input
                type="number"
                min={1}
                max={selectedPaymentToRefund.amount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                required
                className="input-luxury text-xs font-mono w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                PayPal Refund Transaction ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. REF-PP-..."
                value={refundTxnId}
                onChange={(e) => setRefundTxnId(e.target.value)}
                className="input-luxury text-xs font-mono w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-wider block">
                Refund Reason *
              </label>
              <input
                type="text"
                required
                placeholder="Traveler request / Host mutual cancellation..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="input-luxury text-xs w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentToRefund(null)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn bg-rose-600 text-white hover:bg-rose-700 btn-sm cursor-pointer font-bold"
              >
                {loading ? "Processing..." : "Confirm & Save Refund"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

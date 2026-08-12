import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { adminGetPaymentsAndQueuesAction } from "@/lib/actions/admin";
import AdminStripeAuditManager from "@/components/dashboard/AdminStripeAuditManager";
import { Coins, CreditCard, RefreshCcw, Landmark, ArrowUpRight, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { formatCurrencyINR, formatSecondaryCurrency } from "@/lib/constants/financial-model";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // 1. Server-Authoritative Admin RBAC
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch financial records with error handling for distinct error states
  let data: Awaited<ReturnType<typeof adminGetPaymentsAndQueuesAction>> | null = null;
  let fetchError: string | null = null;

  try {
    data = await adminGetPaymentsAndQueuesAction();
  } catch (err: any) {
    console.error("[AdminPaymentsPage] Error fetching payments data:", err);
    fetchError = err?.message || "Failed to retrieve financial records from database.";
  }

  if (fetchError || !data) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Financial Operations Ledger
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Monitor transaction logs, track pending traveler refund queues, and audit couple payouts.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-rose-900">
              Database Payment Query Failure
            </h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              {fetchError}
            </p>
            <span className="inline-block mt-2 text-[0.6875rem] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
              State: PAYMENT_QUERY_FAILURE
            </span>
          </div>
          <p className="text-[0.6875rem] text-charcoal-500">
            Your login session remains active and authenticated as Administrator. Please refresh to retry database query.
          </p>
        </div>
      </div>
    );
  }

  // Calculate high-level financial metrics
  const totalLoggedVolumeINR = data.transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const platformCommissionAccruedINR = Math.round(totalLoggedVolumeINR * 0.22);
  const _hostAllocationINR = totalLoggedVolumeINR - platformCommissionAccruedINR;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
            <ShieldCheck size={12} />
            Marketplace Financial Ledger
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Financial Operations Ledger
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-1">
            Monitor transaction logs, track pending traveler refund queues, and audit couple payouts.
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          Admin Authorized
        </span>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Logged Transactions</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.transactions.length} Records</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-650 flex items-center justify-center flex-shrink-0">
            <RefreshCcw size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Refund Queue</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.refundQueue.length} Processed</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Landmark size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Payout Ledger</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.payoutQueue.length} Settled</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Platform Share (22%)</span>
            <span className="font-display font-bold text-lg text-[var(--color-brand-primary)]">
              {formatCurrencyINR(platformCommissionAccruedINR)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Transaction Ledger */}
        <div className="lg:col-span-7 bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins size={18} className="text-maroon-600" />
              System Transaction Log
            </span>
            <span className="text-xs text-charcoal-400 font-normal">
              Total Volume: {formatCurrencyINR(totalLoggedVolumeINR)} ({formatSecondaryCurrency(totalLoggedVolumeINR)})
            </span>
          </h3>
          {data.transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
              No financial transactions registered yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {data.transactions.map((t: any) => {
                const travelerName = t.payment?.booking?.traveler?.fullName || "Guest Traveler";
                const weddingTitle = t.payment?.booking?.wedding?.title || "Celebration Event";
                const amountFormatted = typeof t.amount === "number" ? formatCurrencyINR(t.amount) : "₹0";

                return (
                  <div key={t.id} className="border border-warm-200 p-4 rounded-2xl space-y-2 text-xs hover:border-warm-300 transition-colors">
                    <div className="flex justify-between items-center font-bold text-charcoal-850">
                      <span className="flex items-center gap-1.5">
                        <ArrowUpRight size={14} className="text-emerald-600" />
                        {t.type || "PAYMENT"}
                      </span>
                      <span className="text-emerald-700 font-display font-bold text-sm">{amountFormatted}</span>
                    </div>
                    <p className="text-charcoal-400 text-[0.6875rem] font-mono">
                      Ref ID: {t.referenceId || t.id}
                    </p>
                    <div className="p-2.5 bg-warm-50/70 rounded-xl text-charcoal-600 text-[0.6875rem] space-y-0.5 border border-warm-100">
                      <div><strong>Traveler:</strong> {travelerName}</div>
                      <div><strong>Experience:</strong> {weddingTitle}</div>
                    </div>
                    <div className="flex justify-between items-center text-[0.625rem] text-charcoal-400 pt-1">
                      <span>Status: <strong className="text-emerald-700 uppercase">{t.status || "SUCCESS"}</strong></span>
                      <span>{t.createdAt ? new Date(t.createdAt).toLocaleString() : "Recently"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Refund & Payout Queues */}
        <div className="lg:col-span-5 space-y-8">
          {/* Refund Queue */}
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <RefreshCcw size={18} className="text-maroon-600" />
              Refund Requests Ledger
            </h3>
            {data.refundQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No refunds processed in system registry.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {data.refundQueue.map((r: any) => {
                  const travelerName = r.payment?.booking?.traveler?.fullName || "Guest Traveler";
                  const weddingTitle = r.payment?.booking?.wedding?.title || "Celebration Event";
                  const refundAmount = typeof r.amount === "number" ? formatCurrencyINR(r.amount) : "₹0";

                  return (
                    <div key={r.id} className="border border-warm-200 p-3.5 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between font-bold text-charcoal-850">
                        <span>{travelerName}</span>
                        <span className="text-rose-650 font-bold">{refundAmount}</span>
                      </div>
                      <p className="text-charcoal-400 text-[0.6875rem]">{weddingTitle}</p>
                      <div className="flex justify-between items-center text-[0.625rem] text-purple-650 pt-1 font-mono">
                        <span>Reason: {r.reason || "Audited Refund"}</span>
                        <span className="bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase">{r.status || "REFUNDED"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payout Queue */}
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Landmark size={18} className="text-maroon-600" />
              Host Payout Registry
            </h3>
            {data.payoutQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No couple payouts cleared in system yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {data.payoutQueue.map((p: any) => {
                  const hostName = p.payment?.booking?.wedding?.hostCouple?.user?.name || p.payment?.booking?.wedding?.hostCouple?.familyBio || "Host Family";
                  const payoutAmount = typeof p.amount === "number" ? formatCurrencyINR(p.amount) : "₹0";

                  return (
                    <div key={p.id} className="border border-warm-200 p-3.5 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between font-bold text-charcoal-850">
                        <span>{hostName}</span>
                        <span className="text-amber-700 font-bold">{payoutAmount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[0.625rem] text-charcoal-400 pt-1 font-mono">
                        <span>Ref: {p.stripeTransferId || p.id}</span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">{p.status || "CLEARED"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stripe Webhook Audit Register & Refund Operations Manager */}
      <AdminStripeAuditManager
        transactions={data.transactions}
        refundQueue={data.refundQueue}
        payoutQueue={data.payoutQueue}
        webhookEvents={data.webhookEvents}
      />
    </div>
  );
}


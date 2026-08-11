import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { adminGetPaymentsAndQueuesAction } from "@/lib/actions/admin";
import AdminStripeAuditManager from "@/components/dashboard/AdminStripeAuditManager";
import { Coins, CreditCard, RefreshCcw, Landmark, ArrowUpRight } from "lucide-react";


export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch payments, transactions, refunds, payouts queues
  const data = await adminGetPaymentsAndQueuesAction();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Financial Operations Ledger
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Monitor transaction logs, track pending traveler refund queues, and audit couple payouts.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Logged Transactions</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.transactions.length} Records</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-650 flex items-center justify-center flex-shrink-0">
            <RefreshCcw size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Refund Queue</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.refundQueue.length} Pending</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Landmark size={22} />
          </div>
          <div>
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Payout Ledger</span>
            <span className="font-display font-bold text-xl text-charcoal-900">{data.payoutQueue.length} Settled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Transaction Ledger */}
        <div className="lg:col-span-7 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <Coins size={18} className="text-maroon-600" />
            System Transaction Log
          </h3>
          {data.transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
              No financial transactions registered yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {data.transactions.map((t: any) => (
                <div key={t.id} className="border border-warm-200 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-charcoal-850">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight size={14} className="text-emerald-600" />
                      {t.type}
                    </span>
                    <span className="text-emerald-600">${t.amount.toLocaleString()} USD</span>
                  </div>
                  <p className="text-charcoal-400 text-[0.6875rem]">
                    Reference: {t.referenceId || "N/A"}
                  </p>
                  {t.payment?.booking && (
                    <div className="p-2 bg-warm-50 rounded text-charcoal-500 text-[0.6875rem] space-y-0.5">
                      <div><strong>Traveler:</strong> {t.payment.booking.traveler.fullName}</div>
                      <div><strong>Experience:</strong> {t.payment.booking.wedding.title}</div>
                    </div>
                  )}
                  <div className="flex justify-between text-[0.625rem] text-charcoal-400 pt-1">
                    <span>Status: <strong className="text-emerald-600">{t.status}</strong></span>
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refund & Payout Queues */}
        <div className="lg:col-span-5 space-y-8">
          {/* Refund Queue */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <RefreshCcw size={18} className="text-maroon-600" />
              Refund Requests Ledger
            </h3>
            {data.refundQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No refunds processed in system registry.
              </div>
            ) : (
              <div className="space-y-3">
                {data.refundQueue.map((r: any) => (
                  <div key={r.id} className="border border-warm-200 p-3.5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between font-bold text-charcoal-850">
                      <span>{r.payment.booking.traveler.fullName}</span>
                      <span className="text-rose-650 font-bold">${r.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-charcoal-400 text-[0.6875rem]">{r.payment.booking.wedding.title}</p>
                    <div className="flex justify-between items-center text-[0.625rem] text-purple-650 pt-1 font-mono">
                      <span>Reason: {r.reason || "Audited Refund"}</span>
                      <span className="bg-purple-50 px-1.5 py-0.5 rounded font-bold uppercase">REFUNDED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Queue */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Landmark size={18} className="text-maroon-600" />
              Host Payout Registry
            </h3>
            {data.payoutQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No couple payouts cleared in system yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.payoutQueue.map((p: any) => (
                  <div key={p.id} className="border border-warm-200 p-3.5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between font-bold text-charcoal-850">
                      <span>{p.payment.booking.wedding.hostCouple.familyBio || "Host Family"}</span>
                      <span className="text-amber-600 font-bold">${p.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[0.625rem] text-charcoal-400 pt-1">
                      <span>Reference: {p.stripeTransferId || "Bank Wire"}</span>
                      <span className="bg-amber-50 text-amber-650 border border-amber-100 px-1.5 py-0.5 rounded font-bold uppercase">CLEARED</span>
                    </div>
                  </div>
                ))}
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

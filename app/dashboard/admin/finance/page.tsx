import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getFinanceDashboardAction } from "@/lib/actions/admin-dashboards";
import { DollarSign, CreditCard, RefreshCcw, Landmark, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExecutiveFinanceDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const finance = await getFinanceDashboardAction();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
          <DollarSign className="text-emerald-600 w-8 h-8" />
          Executive Finance Dashboard
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Real-time gross merchandise value, net revenue, escrow holds, processed refunds, and travel agent commission payouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Gross Volume</span>
            <TrendingUp size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-charcoal-900">
            ${finance.grossVolume.toLocaleString()} USD
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Total guest payments processed.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-maroon-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Net Platform Revenue</span>
            <DollarSign size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-maroon-700">
            ${finance.netRevenue.toLocaleString()} USD
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Revenue after processed refunds.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Processed Refunds</span>
            <RefreshCcw size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-rose-700">
            ${finance.refundedVolume.toLocaleString()} USD
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Full & partial guest refunds.</p>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">Agent Commissions</span>
            <Landmark size={18} />
          </div>
          <div className="font-display font-bold text-2xl text-amber-700">
            ₹{finance.agentCommissionsPaid.toLocaleString("en-IN")} INR
          </div>
          <p className="text-[0.6875rem] text-charcoal-400">Fixed payouts awarded to travel agents (INR).</p>
        </div>
      </div>

      {/* Transaction & Commission Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" />
            Recent Payment Ledger ({finance.payments.length})
          </h3>
          {finance.payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">No payment records logged yet.</div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {finance.payments.map((p: any) => (
                <div key={p.id} className="p-3.5 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-charcoal-900">
                    <span>{p.booking.traveler.fullName}</span>
                    <span className="text-emerald-600">${p.amount} {p.currency}</span>
                  </div>
                  <div className="text-[0.6875rem] text-charcoal-500">{p.booking.wedding.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <Landmark size={18} className="text-amber-600" />
            Agent Commission Ledger ({finance.commissions.length})
          </h3>
          {finance.commissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">No commission records logged yet.</div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {finance.commissions.map((c: any) => (
                <div key={c.id} className="p-3.5 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-charcoal-900">
                    <span>{c.agent.user.name || c.agent.user.email}</span>
                    <span className="text-amber-600">₹{c.commissionAmount?.toLocaleString() || 0} INR</span>
                  </div>
                  <div className="text-[0.6875rem] text-charcoal-500">Gross Booking: ${c.grossAmount} USD • Status: {c.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

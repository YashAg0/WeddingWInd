import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { adminGetPaymentsAndQueuesAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import AdminManualPaymentManager from "@/components/dashboard/AdminManualPaymentManager";
import { CreditCard, RefreshCcw, Landmark, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // 1. Server-Authoritative Admin RBAC
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch financial records with error handling for distinct error states
  let data: Awaited<ReturnType<typeof adminGetPaymentsAndQueuesAction>> | null = null;
  let allPayments: any[] = [];
  let pendingBookings: any[] = [];
  let fetchError: string | null = null;

  try {
    const [queueData, paymentsList, bookingsList] = await Promise.all([
      adminGetPaymentsAndQueuesAction(),
      prisma.payment.findMany({
        include: {
          booking: {
            include: {
              traveler: { include: { user: true } },
              wedding: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "APPROVED", "AWAITING_PAYMENT"] },
        },
        include: {
          traveler: { include: { user: true } },
          wedding: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    data = queueData;
    allPayments = JSON.parse(JSON.stringify(paymentsList));
    pendingBookings = JSON.parse(JSON.stringify(bookingsList));
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
            Monitor transaction logs, track manual PayPal verification queues, and audit payouts.
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
  const totalGrossVolumeUSD = data.transactions
    .filter((t: any) => t.type === "CHARGE")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalHostPayoutsSettledINR = data.payoutQueue
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

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
            Manual PayPal payment verification, transaction logs, and refund operations.
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
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Gross Volume</span>
            <span className="font-display font-bold text-lg text-emerald-700">
              ${totalGrossVolumeUSD.toLocaleString("en-US")} USD
            </span>
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
            <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest block">Settled Host Payouts</span>
            <span className="font-display font-bold text-lg text-[var(--color-brand-primary)]">
              ₹{totalHostPayoutsSettledINR.toLocaleString("en-IN")} INR
            </span>
          </div>
        </div>
      </div>

      {/* Manual Payment Manager */}
      <AdminManualPaymentManager
        transactions={data.transactions}
        refundQueue={data.refundQueue}
        payoutQueue={data.payoutQueue}
        allPayments={allPayments}
        pendingBookings={pendingBookings}
      />
    </div>
  );
}


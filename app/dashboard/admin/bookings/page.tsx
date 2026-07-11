import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, BookingStatus, PaymentStatus } from "@prisma/client";
import { adminOverrideBookingStatusAction, adminExportBookingsCSVAction } from "@/lib/actions/admin";
import { cancelBookingAction, refundBookingAction } from "@/lib/actions";
import { Calendar as CalendarIcon, MapPin, Users, Coins, Download, AlertCircle, CheckCircle, Ban } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ export?: string }>;
}) {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch all bookings
  const bookings = await prisma.booking.findMany({
    include: {
      traveler: { include: { user: true } },
      wedding: { include: { hostCouple: { include: { user: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve searchParams
  const params = await searchParams;
  const triggerExport = params.export;

  // 3. Define Server Actions for Form submissions
  async function handleOverride(formData: FormData) {
    "use server";
    const bId = formData.get("id") as string;
    const status = formData.get("status") as BookingStatus;
    await adminOverrideBookingStatusAction(bId, status);
    redirect("/dashboard/admin/bookings");
  }

  async function handleCancel(formData: FormData) {
    "use server";
    const bId = formData.get("id") as string;
    // We can call the base cancel action (simulating the traveler cancellation or a forced cancellation)
    await prisma.booking.update({
      where: { id: bId },
      data: { status: BookingStatus.CANCELLED },
    });
    redirect("/dashboard/admin/bookings");
  }

  async function handleRefund(formData: FormData) {
    "use server";
    const bId = formData.get("id") as string;
    // We call the built-in refundBookingAction
    await refundBookingAction(bId);
    redirect("/dashboard/admin/bookings");
  }

  // 4. Return CSV trigger if searchParam exists
  if (triggerExport === "csv") {
    const csvResult = await adminExportBookingsCSVAction();
    return (
      <div className="space-y-6">
        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Download size={24} />
          </div>
          <h2 className="font-display font-bold text-lg text-charcoal-900">CSV Export Generated</h2>
          <p className="text-charcoal-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Your booking register CSV is compiled successfully. Copy the content below and save it as <code>bookings.csv</code>.
          </p>
          <textarea
            readOnly
            value={csvResult.csv}
            className="w-full h-64 p-4 font-mono text-xs bg-warm-50 border border-warm-250 rounded-xl focus:ring-0"
          />
          <div className="pt-2">
            <Link
              href="/dashboard/admin/bookings"
              className="inline-block px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-charcoal-850"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Booking & Reservation Manager
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Review registration requests, override statuses, cancel tickets, or issue refunds.
          </p>
        </div>
        <Link
          href="/dashboard/admin/bookings?export=csv"
          className="inline-flex items-center gap-2 border border-warm-250 bg-white text-charcoal-700 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-warm-50 transition-colors shadow-sm"
        >
          <Download size={14} />
          Export CSV
        </Link>
      </div>

      {/* Bookings Ledger */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
          Global Booking Ledger ({bookings.length} Bookings)
        </h3>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No booking requests cataloged in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-warm-200 text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                  <th className="p-3 pl-4 rounded-tl-xl">Traveler</th>
                  <th className="p-3">Wedding Experience</th>
                  <th className="p-3">Guests & Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4 rounded-tr-xl">Manage Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-xs text-charcoal-600">
                {bookings.map((b) => {
                  let statusColor = "text-amber-600 bg-amber-50";
                  if (b.status === BookingStatus.PAID) {
                    statusColor = "text-emerald-600 bg-emerald-50";
                  } else if (b.status === BookingStatus.CANCELLED) {
                    statusColor = "text-rose-600 bg-rose-50";
                  } else if (b.status === BookingStatus.REFUNDED) {
                    statusColor = "text-purple-600 bg-purple-50";
                  } else if (b.status === BookingStatus.AWAITING_PAYMENT) {
                    statusColor = "text-blue-600 bg-blue-50";
                  } else if (b.status === BookingStatus.APPROVED) {
                    statusColor = "text-indigo-650 bg-indigo-50";
                  }
                  
                  const isPaid = b.status === BookingStatus.PAID;
                  const isRefundable = isPaid && b.payments.some((p) => p.status === PaymentStatus.PAID);
                  const isCancellable = b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.REFUNDED;

                  return (
                    <tr key={b.id} className="hover:bg-warm-50/20">
                      {/* Traveler */}
                      <td className="p-3 pl-4">
                        <div className="font-semibold text-charcoal-850">{b.traveler.fullName}</div>
                        <div className="text-[0.6875rem] text-charcoal-400 mt-0.5">{b.traveler.user.email}</div>
                      </td>

                      {/* Wedding */}
                      <td className="p-3">
                        <div className="font-bold text-charcoal-850 line-clamp-1">{b.wedding.title}</div>
                        <div className="text-[0.6875rem] text-charcoal-400 mt-0.5">{b.wedding.location}</div>
                      </td>

                      {/* Guests & Date */}
                      <td className="p-3">
                        <div className="font-semibold text-charcoal-850 flex items-center gap-1">
                          <Users size={12} className="text-maroon-600" />
                          {b.guestsCount} guests
                        </div>
                        <div className="text-[0.6875rem] text-charcoal-400 mt-0.5 flex items-center gap-1">
                          <CalendarIcon size={12} className="text-maroon-600" />
                          {new Date(b.date).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3 font-black text-charcoal-900">${b.totalAmount.toLocaleString()}</td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`inline-block text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Manage Override */}
                      <td className="p-3 text-right pr-4">
                        <div className="flex gap-2 justify-end items-center">
                          {/* Status Override Form */}
                          <form action={handleOverride} className="flex gap-1 items-center">
                            <input type="hidden" name="id" value={b.id} />
                            <select
                              name="status"
                              defaultValue={b.status}
                              className="input-luxury text-[0.6875rem] h-8 py-0.5 px-2 bg-white rounded-lg border border-warm-200 select-reset text-charcoal-700 cursor-pointer focus:ring-[1px] focus:ring-maroon-300"
                            >
                              {Object.values(BookingStatus).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              title="Override status"
                              className="p-1 rounded-lg border border-warm-200 text-charcoal-600 hover:bg-warm-50 text-[0.6875rem] font-bold cursor-pointer px-2 h-8"
                            >
                              Override
                            </button>
                          </form>

                          {/* Quick Cancel */}
                          {isCancellable && (
                            <form action={handleCancel}>
                              <input type="hidden" name="id" value={b.id} />
                              <button
                                type="submit"
                                title="Cancel Ticket"
                                className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer h-8 flex items-center justify-center font-bold"
                              >
                                <Ban size={13} />
                              </button>
                            </form>
                          )}

                          {/* Quick Refund */}
                          {isRefundable && (
                            <form action={handleRefund}>
                              <input type="hidden" name="id" value={b.id} />
                              <button
                                type="submit"
                                title="Issue Refund"
                                className="p-1 px-2 rounded-lg border border-purple-100 bg-purple-50 text-purple-650 hover:bg-purple-500 hover:text-white cursor-pointer h-8 flex items-center justify-center font-bold text-[0.625rem] uppercase tracking-wider"
                              >
                                Refund
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  adminReviewSponsorshipRequestAction,
  adminGetSponsorshipRequestsAction,
} from "@/lib/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Users,
  CalendarDays,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireRole([UserRole.ADMIN]);

  const params = await searchParams;
  const filter = params.filter || "PENDING";

  const requests = await adminGetSponsorshipRequestsAction(filter);

  async function handleApprove(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const adminNotes = (formData.get("adminNotes") as string) || undefined;
    const sponsorshipStart = (formData.get("sponsorshipStart") as string) || null;
    const sponsorshipEnd = (formData.get("sponsorshipEnd") as string) || null;
    await adminReviewSponsorshipRequestAction(
      requestId,
      "APPROVED",
      adminNotes,
      sponsorshipStart,
      sponsorshipEnd
    );
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const adminNotes = (formData.get("adminNotes") as string) || undefined;
    await adminReviewSponsorshipRequestAction(requestId, "REJECTED", adminNotes);
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  const filterOptions = [
    { value: "PENDING", label: "Pending Review", count: null },
    { value: "APPROVED", label: "Approved", count: null },
    { value: "REJECTED", label: "Rejected", count: null },
    { value: "CANCELLED", label: "Cancelled", count: null },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "CANCELLED":
        return "bg-charcoal-100 text-charcoal-700 border-charcoal-300";
      default:
        return "bg-warm-100 text-charcoal-700 border-warm-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/admin/weddings"
              className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Weddings
            </Link>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
            <Sparkles size={24} className="text-amber-500" />
            Sponsorship Requests
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Review and action host-submitted marketplace sponsorship requests.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-warm-200 pb-3">
        {filterOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/dashboard/admin/weddings/sponsorship?filter=${opt.value}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === opt.value
                ? "bg-maroon-800 text-white shadow-sm"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white border border-warm-200/50 rounded-3xl p-12 text-center">
          <Sparkles size={32} className="text-charcoal-300 mx-auto mb-3" />
          <p className="font-display font-bold text-base text-charcoal-700">
            No {filter.toLowerCase()} sponsorship requests
          </p>
          <p className="text-charcoal-500 text-xs mt-1">
            Host couples can submit requests from their listings dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-warm-200/60 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                {/* Wedding Image */}
                <div className="relative w-full md:w-40 h-40 flex-shrink-0 bg-warm-200">
                  <Image
                    src={req.wedding.mainImageUrl}
                    alt={req.wedding.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-charcoal-900">
                        {req.wedding.title}
                      </h3>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        Host:{" "}
                        <span className="font-semibold text-charcoal-700">
                          {req.wedding.hostCouple.user.name || req.wedding.hostCouple.user.email}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase px-2.5 py-1 rounded-full border flex-shrink-0 ${statusBadge(req.status)}`}
                    >
                      {req.status === "PENDING" && <Clock size={9} />}
                      {req.status === "APPROVED" && <CheckCircle size={9} />}
                      {req.status === "REJECTED" && <XCircle size={9} />}
                      {req.status}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-[0.6875rem] text-charcoal-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-maroon-600" />
                      {req.wedding.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={11} className="text-maroon-600" />
                      Wedding: {new Date(req.wedding.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={11} className="text-maroon-600" />
                      {req.wedding._count.bookings} confirmed bookings
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="text-charcoal-400" />
                      Requested: {new Date(req.requestedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Message & Budget */}
                  {(req.message || req.budget) && (
                    <div className="p-3 bg-warm-50 rounded-2xl border border-warm-200/50 space-y-1.5">
                      {req.message && (
                        <p className="text-xs text-charcoal-700 leading-relaxed">
                          <span className="font-bold text-charcoal-500 text-[0.6875rem] uppercase tracking-wide">
                            Host note:{" "}
                          </span>
                          {req.message}
                        </p>
                      )}
                      {req.budget && (
                        <p className="text-xs text-charcoal-700">
                          <span className="font-bold text-charcoal-500 text-[0.6875rem] uppercase tracking-wide">
                            Budget:{" "}
                          </span>
                          {req.budget}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Admin Notes (for reviewed requests) */}
                  {req.adminNotes && (
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/50">
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <span className="font-bold text-[0.6875rem] uppercase tracking-wide">
                          Admin note:{" "}
                        </span>
                        {req.adminNotes}
                      </p>
                      {req.reviewedBy && (
                        <p className="text-[0.5625rem] text-blue-600 mt-1">
                          Reviewed by {req.reviewedBy} on{" "}
                          {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "—"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Forms — Only for PENDING */}
                  {req.status === "PENDING" && (
                    <div className="border-t border-warm-100 pt-4 space-y-3">
                      {/* Approve Form */}
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors list-none">
                          <CheckCircle size={14} />
                          Approve with sponsorship dates
                          <ChevronDown
                            size={12}
                            className="ml-auto transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <form action={handleApprove} className="mt-3 space-y-3">
                          <input type="hidden" name="requestId" value={req.id} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                                Sponsorship Start
                              </label>
                              <input
                                type="date"
                                name="sponsorshipStart"
                                className="input-luxury w-full text-xs"
                                defaultValue={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                                Sponsorship End (optional)
                              </label>
                              <input
                                type="date"
                                name="sponsorshipEnd"
                                className="input-luxury w-full text-xs"
                              />
                            </div>
                          </div>
                          <textarea
                            name="adminNotes"
                            rows={2}
                            placeholder="Admin notes for the host (optional)"
                            className="w-full text-xs border border-warm-200 rounded-xl px-3 py-2 text-charcoal-700 bg-white resize-none focus:outline-none focus:border-emerald-300"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <CheckCircle size={12} />
                            Approve Sponsorship
                          </button>
                        </form>
                      </details>

                      {/* Reject Form */}
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700 hover:text-rose-900 transition-colors list-none">
                          <XCircle size={14} />
                          Reject request
                          <ChevronDown
                            size={12}
                            className="ml-auto transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <form action={handleReject} className="mt-3 space-y-3">
                          <input type="hidden" name="requestId" value={req.id} />
                          <textarea
                            name="adminNotes"
                            rows={2}
                            placeholder="Reason for rejection (recommended — shown to host)"
                            className="w-full text-xs border border-warm-200 rounded-xl px-3 py-2 text-charcoal-700 bg-white resize-none focus:outline-none focus:border-rose-300"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle size={12} />
                            Reject Request
                          </button>
                        </form>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

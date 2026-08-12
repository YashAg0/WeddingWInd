"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import {
  adminGetHostApplicationsAction,
  adminReviewHostApplicationAction
} from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export default function AdminHostsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetHostApplicationsAction();
      setApplications(data || []);
    } catch (err: any) {
      const msg = err.message || "Failed to load host applications";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleQuickReview = async (
    weddingId: string,
    status: "APPROVED" | "REJECTED" | "NEED_MORE_DOCUMENTS"
  ) => {
    setProcessingId(weddingId);
    try {
      const res = await adminReviewHostApplicationAction(
        weddingId,
        status,
        `Quick action by admin on host queue: ${status}`
      );
      if (res?.success) {
        toast.success(`Application updated to ${status}`);
        await loadApplications();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status");
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics calculation
  const pendingCount = applications.filter((a) => {
    const verStatus = a.hostCouple?.user?.verification?.status;
    return verStatus === "PENDING" || a.status === "DRAFT";
  }).length;

  const approvedCount = applications.filter((a) => a.status === "PUBLISHED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;
  const needDocsCount = applications.filter(
    (a) => a.hostCouple?.user?.verification?.status === "NEED_MORE_DOCUMENTS"
  ).length;

  // Filtering logic
  const filteredApplications = applications.filter((app) => {
    const hostUser = app.hostCouple?.user;
    const hostName = hostUser?.name || app.title || "";
    const email = hostUser?.email || "";
    const location = app.location || "";
    const verStatus = hostUser?.verification?.status || "NOT_SUBMITTED";

    const matchesSearch =
      hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "PENDING") return verStatus === "PENDING" || app.status === "DRAFT";
    if (selectedFilter === "PUBLISHED") return app.status === "PUBLISHED";
    if (selectedFilter === "REJECTED") return app.status === "REJECTED" || verStatus === "REJECTED";
    if (selectedFilter === "NEED_MORE_DOCUMENTS") return verStatus === "NEED_MORE_DOCUMENTS";

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
            <Building2 size={13} />
            Host Application Review Suite
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Host Applications & Celebrations
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-1">
            Review host wedding applications submitted via /list-wedding, verify host identity, and approve for public publishing.
          </p>
        </div>

        <button
          onClick={loadApplications}
          disabled={loading}
          className="btn btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Queue
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Pending Review</span>
          <div className="font-display font-bold text-3xl text-amber-700 flex items-center gap-2">
            {loading ? "…" : pendingCount}
            <span className="text-[0.625rem] font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Requires Action
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Applications awaiting verification</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Approved & Published</span>
          <div className="font-display font-bold text-3xl text-emerald-600 flex items-center gap-2">
            {loading ? "…" : approvedCount}
            <span className="text-[0.625rem] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Active on global marketplace</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Need More Docs</span>
          <div className="font-display font-bold text-3xl text-blue-600 flex items-center gap-2">
            {loading ? "…" : needDocsCount}
            <span className="text-[0.625rem] font-bold uppercase text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Follow-up
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Additional details requested</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Total Applications</span>
          <div className="font-display font-bold text-3xl text-charcoal-900">
            {loading ? "…" : applications.length}
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Total submitted host entries</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white border border-warm-200/60 p-4 sm:p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search host name, email, city, wedding title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury pl-10 w-full text-xs sm:text-sm bg-warm-50/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs font-bold">
          {["ALL", "PENDING", "PUBLISHED", "NEED_MORE_DOCUMENTS", "REJECTED"].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setSelectedFilter(filterKey)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedFilter === filterKey
                  ? "bg-maroon-800 text-white shadow-sm"
                  : "bg-warm-100/70 text-charcoal-600 hover:bg-warm-200/60"
              }`}
            >
              {filterKey === "ALL"
                ? "All Applications"
                : filterKey.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* State Renderers: Loading / Error / Empty / Data Table */}
      {loading ? (
        <div className="bg-white border border-warm-200/60 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <RefreshCw size={28} className="animate-spin text-[var(--color-brand-primary)] mx-auto" />
          <p className="text-xs font-bold text-charcoal-500">Loading host applications from database...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <AlertCircle size={36} className="text-red-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">Unable to Load Host Applications</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100 font-mono">
            {error}
          </p>
          <button
            onClick={loadApplications}
            className="btn btn-primary text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Retry Query
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-warm-200/60 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <Building2 size={36} className="text-charcoal-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Host Applications Found</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            {searchQuery || selectedFilter !== "ALL"
              ? "No applications matched your search or status filter criteria."
              : "No host applications have been submitted yet via /list-wedding."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-warm-50/80 border-b border-warm-200 text-charcoal-500 font-bold uppercase tracking-wider text-[0.6875rem]">
                  <th className="py-4 px-6">Host / Celebration</th>
                  <th className="py-4 px-6">Location & Date</th>
                  <th className="py-4 px-6">Capacity & Price</th>
                  <th className="py-4 px-6">Verification Status</th>
                  <th className="py-4 px-6">Wedding Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 font-medium text-charcoal-700">
                {filteredApplications.map((app) => {
                  const hostUser = app.hostCouple?.user;
                  const hostName = hostUser?.name || "Unassigned Host";
                  const email = hostUser?.email || "No email";
                  const verStatus = hostUser?.verification?.status || "NOT_SUBMITTED";

                  return (
                    <tr key={app.id} className="hover:bg-warm-50/40 transition-colors">
                      {/* Host / Celebration */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-warm-200 flex-shrink-0 relative">
                            <Image
                              src={app.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&q=80"}
                              alt={app.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/admin/hosts/${app.id}`}
                              className="font-bold text-sm text-charcoal-900 hover:text-[var(--color-brand-primary)] transition-colors block"
                            >
                              {app.title}
                            </Link>
                            <span className="text-charcoal-500 text-[0.6875rem] block">
                              Host: <strong>{hostName}</strong> ({email})
                            </span>
                            <span className="text-[0.625rem] text-charcoal-400">
                              Submitted: {formatDate(app.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location & Date */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-charcoal-800 font-semibold">
                          <MapPin size={13} className="text-maroon-700 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{app.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-charcoal-500 text-[0.6875rem]">
                          <Calendar size={12} className="text-charcoal-400 flex-shrink-0" />
                          <span>{formatDate(app.date)}</span>
                        </div>
                      </td>

                      {/* Capacity & Price */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-charcoal-800 font-bold">
                          <Users size={13} className="text-amber-700 flex-shrink-0" />
                          <span>{app.capacity} Guests</span>
                        </div>
                        <div className="text-[0.6875rem] text-charcoal-500">
                          ₹{app.pricePerGuest?.toLocaleString()} / guest
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ${
                            verStatus === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : verStatus === "REJECTED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : verStatus === "NEED_MORE_DOCUMENTS"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <ShieldCheck size={11} />
                          {verStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Wedding Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider ${
                            app.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-warm-100 text-charcoal-700 border border-warm-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/hosts/${app.id}`}
                            className="btn btn-secondary text-[0.6875rem] font-bold py-1.5 px-3 flex items-center gap-1"
                          >
                            <Eye size={13} />
                            Inspect
                          </Link>

                          {app.status !== "PUBLISHED" && (
                            <button
                              onClick={() => handleQuickReview(app.id, "APPROVED")}
                              disabled={processingId === app.id}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[0.6875rem] rounded-xl transition-colors flex items-center gap-1"
                              title="Approve & Publish"
                            >
                              <CheckCircle2 size={13} />
                              Approve
                            </button>
                          )}

                          {app.status !== "REJECTED" && (
                            <button
                              onClick={() => handleQuickReview(app.id, "REJECTED")}
                              disabled={processingId === app.id}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[0.6875rem] rounded-xl transition-colors flex items-center gap-1"
                              title="Reject Application"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

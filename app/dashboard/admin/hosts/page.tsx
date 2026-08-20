"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Search,
  Eye,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  adminGetHostApplicationsAction,
  adminReviewHostApplicationAction,
  adminVerifyHostApplicationAction,
} from "@/lib/actions/admin";
import { formatDate, cn } from "@/lib/utils";

export default function AdminHostsPage() {
  const [hostApplications, setHostApplications] = useState<any[]>([]);
  const [legacyWeddings, setLegacyWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await adminGetHostApplicationsAction();
      if (data && typeof data === "object" && ("hostApps" in data || "weddings" in data)) {
        setHostApplications(data.hostApps || []);
        setLegacyWeddings(data.weddings || []);
      } else if (Array.isArray(data)) {
        setLegacyWeddings(data);
      }
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
    id: string,
    status: "APPROVED_FOR_LISTING" | "REJECTED" | "ACTION_REQUIRED",
    isHostApp: boolean
  ) => {
    setProcessingId(id);
    try {
      if (isHostApp) {
        await adminVerifyHostApplicationAction({
          applicationId: id,
          verifiedTier: "ROYAL",
          verifiedDurationDays: 3,
          status,
          adminNotesHostFacing: `Quick admin review: marked as ${status}`,
          publishImmediately: status === "APPROVED_FOR_LISTING",
        });
      } else {
        const legacyStatus = status === "APPROVED_FOR_LISTING" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "NEED_MORE_DOCUMENTS";
        await adminReviewHostApplicationAction(id, legacyStatus, `Quick admin action: ${status}`);
      }
      toast.success(`Application updated to ${status}`);
      await loadApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status");
    } finally {
      setProcessingId(null);
    }
  };

  // Combine structured hostApps and unique legacy weddings
  const unifiedList = [
    ...hostApplications.map((app) => ({
      id: app.id,
      isHostApp: true,
      title: app.coupleNames,
      hostName: app.hostName,
      email: app.email,
      phone: app.phone,
      location: `${app.city}${app.state ? `, ${app.state}` : ""}`,
      city: app.city,
      date: app.weddingDate,
      durationDays: app.durationDays,
      requestedTier: app.requestedTier,
      verifiedTier: app.verifiedTier,
      scale: app.weddingScale,
      guests: app.expectedInternationalGuests,
      status: app.status,
      verStatus: app.user?.verification?.status || "NOT_SUBMITTED",
      docRequestsCount: app.documentRequests?.length || 0,
      pendingDocsCount: (app.documentRequests || []).filter((r: any) => r.status === "PENDING").length,
      daysCount: app.days?.length || 0,
      createdAt: app.createdAt,
    })),
    ...legacyWeddings
      .filter((w) => !hostApplications.some((ha) => ha.weddingId === w.id || ha.id === w.id))
      .map((w) => ({
        id: w.id,
        isHostApp: false,
        title: w.title,
        hostName: w.hostCouple?.user?.name || w.title,
        email: w.hostCouple?.user?.email || "",
        phone: "",
        location: w.location,
        city: w.location?.split(",")[0] || "",
        date: w.date,
        durationDays: w.durationDays || 3,
        requestedTier: w.tier || "STANDARD",
        verifiedTier: w.tier || null,
        scale: w.weddingScale || "MEDIUM",
        guests: w.capacity || 10,
        status: w.status,
        verStatus: w.hostCouple?.user?.verification?.status || "NOT_SUBMITTED",
        docRequestsCount: 0,
        pendingDocsCount: 0,
        daysCount: 0,
        createdAt: w.createdAt,
      })),
  ];

  // Metrics
  const pendingCount = unifiedList.filter(
    (a) => a.status === "DRAFT" || a.status === "SUBMITTED" || a.status === "UNDER_REVIEW" || a.verStatus === "PENDING"
  ).length;
  const actionRequiredCount = unifiedList.filter(
    (a) => a.status === "ACTION_REQUIRED" || a.verStatus === "NEED_MORE_DOCUMENTS"
  ).length;
  const approvedCount = unifiedList.filter(
    (a) => a.status === "PUBLISHED" || a.status === "APPROVED_FOR_LISTING" || a.status === "VERIFIED"
  ).length;

  // Filter
  const filteredList = unifiedList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "PENDING") {
      return (
        item.status === "SUBMITTED" ||
        item.status === "UNDER_REVIEW" ||
        item.status === "DRAFT" ||
        item.verStatus === "PENDING"
      );
    }
    if (selectedFilter === "ACTION_REQUIRED") {
      return item.status === "ACTION_REQUIRED" || item.verStatus === "NEED_MORE_DOCUMENTS";
    }
    if (selectedFilter === "APPROVED") {
      return item.status === "PUBLISHED" || item.status === "APPROVED_FOR_LISTING" || item.status === "VERIFIED";
    }
    if (selectedFilter === "REJECTED") {
      return item.status === "REJECTED" || item.verStatus === "REJECTED";
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full border border-maroon-100/50 mb-2">
            <Building2 size={13} />
            Host Application Review Suite
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Host Applications &amp; Celebrations
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm mt-1">
            Inspect day-by-day itineraries, request documents, verify commercial tiers, and approve celebrations for international bookings.
          </p>
        </div>

        <button
          onClick={loadApplications}
          disabled={loading}
          className="btn btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Applications
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-warm-200/70 p-6 rounded-3xl shadow-xs space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
            Pending Admin Review
          </span>
          <div className="font-display font-bold text-3xl text-amber-700 flex items-center gap-2">
            {loading ? "…" : pendingCount}
            <span className="text-[0.625rem] font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              In Review Queue
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Awaiting itinerary verification</span>
        </div>

        <div className="bg-white border border-warm-200/70 p-6 rounded-3xl shadow-xs space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
            Action Required (Docs Requested)
          </span>
          <div className="font-display font-bold text-3xl text-blue-700 flex items-center gap-2">
            {loading ? "…" : actionRequiredCount}
            <span className="text-[0.625rem] font-bold uppercase text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Host Uploading
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Document requests pending fulfillment</span>
        </div>

        <div className="bg-white border border-warm-200/70 p-6 rounded-3xl shadow-xs space-y-2">
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
            Verified &amp; Published
          </span>
          <div className="font-display font-bold text-3xl text-emerald-600 flex items-center gap-2">
            {loading ? "…" : approvedCount}
            <span className="text-[0.625rem] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-500">Active celebrations on marketplace</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-warm-200/70 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search host, couple, city..."
            className="w-full pl-9 pr-4 py-2 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:border-maroon-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All" },
            { key: "PENDING", label: "Pending" },
            { key: "ACTION_REQUIRED", label: "Action Required" },
            { key: "APPROVED", label: "Verified / Published" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedFilter(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                selectedFilter === tab.key
                  ? "bg-maroon-900 text-white"
                  : "bg-warm-50 text-charcoal-700 hover:bg-warm-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-warm-200/80 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-maroon-700 mx-auto" />
            <p className="text-xs text-charcoal-500 font-semibold">Loading host applications from database...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle size={28} className="text-charcoal-400 mx-auto" />
            <h3 className="font-display font-bold text-lg text-charcoal-900">No applications match your criteria</h3>
            <p className="text-xs text-charcoal-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-warm-50/80 border-b border-warm-200 text-charcoal-600 font-bold uppercase tracking-wider text-[0.6875rem]">
                  <th className="py-4 px-5">Celebration / Couple</th>
                  <th className="py-4 px-4">Host / Contact</th>
                  <th className="py-4 px-4">Location &amp; Date</th>
                  <th className="py-4 px-4">Duration &amp; Scale</th>
                  <th className="py-4 px-4">Tier (Req / Ver)</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 text-charcoal-800">
                {filteredList.map((app) => {
                  const isBusy = processingId === app.id;

                  return (
                    <tr key={app.id} className="hover:bg-warm-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-charcoal-900 block">{app.title}</span>
                          <span className="text-[0.6875rem] text-charcoal-500 font-mono">
                            ID: #{app.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-charcoal-900">{app.hostName}</span>
                          <span className="text-[0.6875rem] text-charcoal-500 block">{app.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-charcoal-900 flex items-center gap-1">
                            <MapPin size={11} className="text-maroon-700" />
                            {app.city || app.location}
                          </span>
                          <span className="text-[0.6875rem] text-charcoal-500 flex items-center gap-1">
                            <Calendar size={11} />
                            {app.date ? formatDate(app.date) : "TBD"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-charcoal-900">{app.durationDays} Days</span>
                          <span className="text-[0.6875rem] text-charcoal-500 block">
                            {app.guests} intl guests · {app.scale}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[var(--color-brand-primary)]">
                            {app.requestedTier}
                          </span>
                          {app.verifiedTier && (
                            <span className="text-[0.625rem] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block w-fit">
                              Ver: {app.verifiedTier}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={cn(
                              "text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-block",
                              app.status === "PUBLISHED" || app.status === "APPROVED_FOR_LISTING" || app.status === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : app.status === "ACTION_REQUIRED"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : app.status === "REJECTED"
                                ? "bg-red-50 text-red-800 border-red-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            )}
                          >
                            {app.status}
                          </span>

                          {app.pendingDocsCount > 0 && (
                            <span className="text-[0.5625rem] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 block w-fit">
                              {app.pendingDocsCount} docs requested
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/hosts/${app.id}`}
                            className="btn btn-secondary text-xs font-bold py-1.5 px-3 inline-flex items-center gap-1"
                          >
                            <Eye size={13} />
                            Inspect &amp; Verify
                          </Link>

                          {app.status !== "PUBLISHED" && app.status !== "APPROVED_FOR_LISTING" && (
                            <button
                              type="button"
                              onClick={() => handleQuickReview(app.id, "APPROVED_FOR_LISTING", app.isHostApp)}
                              disabled={isBusy}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Quick Approve"
                            >
                              <CheckCircle2 size={16} />
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
        )}
      </div>
    </div>
  );
}

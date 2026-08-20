"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  Star,
} from "lucide-react";
import {
  adminGetHostApplicationByIdAction,
  adminVerifyHostApplicationAction,
  adminCreateDocumentRequestAction,
  adminReviewDocumentAction,
  adminReviewHostApplicationAction,
  adminToggleWeddingFeaturedAction,
} from "@/lib/actions/admin";
import { formatDate, cn } from "@/lib/utils";
import {
  WeddingTier,
  WeddingDurationDays,
  WEDDING_TIER_CONFIG,
  getHostPayoutPerGuestINR,
  getCustomerPriceUSD,
} from "@/lib/services/pricing-engine";

const REQUEST_TYPES = [
  { key: "VENUE_PHOTO", label: "Venue Confirmation Photo" },
  { key: "WEDDING_INVITATION", label: "Official Wedding Invitation (PDF/Card)" },
  { key: "VENUE_PROOF", label: "Venue Booking / Contract Receipt" },
  { key: "IDENTITY_VERIFICATION", label: "Host Government ID (Aadhaar/Passport)" },
  { key: "CEREMONY_SCHEDULE", label: "Detailed Ceremony Schedule" },
  { key: "COUPLE_PHOTO", label: "Couple / Family Celebration Photo" },
  { key: "OTHER", label: "Other Verification Document" },
];

export default function AdminHostDetailPage() {
  const params = useParams();
  const _router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // Verification Form State
  const [verifiedTier, setVerifiedTier] = useState<WeddingTier>("ROYAL");
  const [verifiedDuration, setVerifiedDuration] = useState<WeddingDurationDays>(3);
  const [internalNotes, setInternalNotes] = useState("");
  const [hostFacingNotes, setHostFacingNotes] = useState("");

  // New Document Request Modal / Form State
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  const [docReqType, setDocReqType] = useState("VENUE_PHOTO");
  const [docReqTitle, setDocReqTitle] = useState("Venue Confirmation Photo");
  const [docReqDesc, setDocReqDesc] = useState("Please upload one clear photo or contract confirming your wedding venue booking.");
  const [docReqRequired, setDocReqRequired] = useState(true);

  // Expanded Day in Accordion
  const [expandedDay, setExpandedDay] = useState<number>(1);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminGetHostApplicationByIdAction(id);
      if (!res) {
        toast.error("Host application record not found.");
      } else {
        setData(res);
        if (res.isHostApp && res.hostApp) {
          const app = res.hostApp;
          setVerifiedTier((app.verifiedTier || app.requestedTier || "ROYAL") as WeddingTier);
          setVerifiedDuration((app.verifiedDurationDays || app.durationDays || 3) as WeddingDurationDays);
          setInternalNotes(app.adminNotesInternal || "");
          setHostFacingNotes(app.adminNotesHostFacing || "");
        } else if (res.wedding) {
          const w = res.wedding;
          setVerifiedTier((w.tier || "STANDARD") as WeddingTier);
          setVerifiedDuration((w.durationDays || 3) as WeddingDurationDays);
          setHostFacingNotes(w.hostCouple?.user?.verification?.notes || "");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load application.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadDetail();
  }, [id, loadDetail]);

  const handleDecision = async (
    status: "APPROVED_FOR_LISTING" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED" | "UNDER_REVIEW",
    publishImmediately: boolean = false
  ) => {
    startTransition(async () => {
      try {
        if (data?.isHostApp && data.hostApp) {
          await adminVerifyHostApplicationAction({
            applicationId: data.hostApp.id,
            verifiedTier,
            verifiedDurationDays: verifiedDuration,
            status,
            adminNotesInternal: internalNotes,
            adminNotesHostFacing: hostFacingNotes,
            publishImmediately,
          });
        } else if (data?.wedding) {
          const legacyStatus = status === "APPROVED_FOR_LISTING" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "NEED_MORE_DOCUMENTS";
          await adminReviewHostApplicationAction(data.wedding.id, legacyStatus, hostFacingNotes || internalNotes);
        }

        toast.success(`Application updated to ${status}${publishImmediately ? " and PUBLISHED!" : "!"}`);
        await loadDetail();
      } catch (err: any) {
        toast.error(err.message || "Failed to execute decision.");
      }
    });
  };

  const handleCreateDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docReqTitle || !docReqDesc) {
      toast.error("Please fill in document request title and description.");
      return;
    }

    startTransition(async () => {
      try {
        await adminCreateDocumentRequestAction({
          applicationId: data.hostApp?.id || data.wedding?.id || id,
          requestType: docReqType,
          title: docReqTitle,
          description: docReqDesc,
          isRequired: docReqRequired,
        });

        toast.success(`Document request '${docReqTitle}' sent to host!`);
        setShowDocRequestModal(false);
        await loadDetail();
      } catch (err: any) {
        toast.error(err.message || "Failed to create document request.");
      }
    });
  };

  const handleToggleFeatured = async (targetWeddingId: string, currentFeatured: boolean) => {
    startTransition(async () => {
      try {
        await adminToggleWeddingFeaturedAction(targetWeddingId, !currentFeatured);
        toast.success(!currentFeatured ? "Listing marked as FEATURED (#2 Priority)!" : "Featured status removed.");
        await loadDetail();
      } catch (err: any) {
        toast.error(err.message || "Failed to update featured status.");
      }
    });
  };

  const handleReviewDoc = async (documentId: string, status: "APPROVED" | "REJECTED", feedback?: string) => {
    startTransition(async () => {
      try {
        await adminReviewDocumentAction({
          documentId,
          status,
          adminFeedback: feedback || (status === "APPROVED" ? "Approved" : "Rejected"),
        });

        toast.success(`Document marked as ${status}!`);
        await loadDetail();
      } catch (err: any) {
        toast.error(err.message || "Failed to review document.");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={32} className="animate-spin text-[var(--color-brand-primary)]" />
        <p className="text-xs font-bold text-charcoal-500">Loading host application details...</p>
      </div>
    );
  }

  if (!data || (!data.hostApp && !data.wedding)) {
    return (
      <div className="bg-white border border-warm-200/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
        <AlertCircle size={40} className="text-amber-600 mx-auto" />
        <h2 className="font-display font-bold text-xl text-charcoal-900">Host Application Not Found</h2>
        <p className="text-xs text-charcoal-500">The requested application ID does not exist in the database.</p>
        <Link href="/dashboard/admin/hosts" className="btn btn-primary text-xs font-bold px-6 py-2.5 inline-block">
          Return to Queue
        </Link>
      </div>
    );
  }

  const app = data.hostApp || data.wedding;
  const _isHostApp = data.isHostApp;
  const userRecord = app.user || app.hostCouple?.user;
  const currentStatus = app.status || "DRAFT";

  // Calculations based on currently selected verified tier & duration
  const verifiedRatePerGuestINR = getHostPayoutPerGuestINR(verifiedTier, verifiedDuration);
  const totalVerifiedHostPayoutINR = verifiedRatePerGuestINR * (app.expectedInternationalGuests || app.capacity || 20);
  const authoritativeCustomerPriceUSD = getCustomerPriceUSD(verifiedTier, verifiedDuration);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/hosts"
          className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Host Applications Queue
        </Link>

        {app.wedding?.status === "PUBLISHED" && (
          <Link
            href={`/weddings/${app.wedding.slug}`}
            target="_blank"
            className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <ExternalLink size={14} />
            View Live Listing
          </Link>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-warm-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100">
                Application #{app.id.slice(-6).toUpperCase()}
              </span>
              <span
                className={cn(
                  "text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                  currentStatus === "PUBLISHED" || currentStatus === "APPROVED_FOR_LISTING" || currentStatus === "VERIFIED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : currentStatus === "ACTION_REQUIRED"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : currentStatus === "REJECTED"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                Status: {currentStatus}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              {app.coupleNames || app.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocRequestModal(true)}
              className="btn btn-secondary text-xs font-bold py-2.5 px-4 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              Request Document / Media
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-warm-50/60 rounded-xl border border-warm-100">
            <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase block">Host Contact</span>
            <span className="font-bold text-charcoal-900">{app.hostName || userRecord?.name}</span>
            <span className="text-[0.6875rem] text-charcoal-500 block truncate">{app.email || userRecord?.email}</span>
          </div>

          <div className="p-3 bg-warm-50/60 rounded-xl border border-warm-100">
            <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase block">Location &amp; Date</span>
            <span className="font-bold text-charcoal-900">{app.city || app.location}</span>
            <span className="text-[0.6875rem] text-charcoal-500 block">
              {app.weddingDate || app.date ? formatDate(app.weddingDate || app.date) : "TBD"}
            </span>
          </div>

          <div className="p-3 bg-warm-50/60 rounded-xl border border-warm-100">
            <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase block">Duration &amp; Scale</span>
            <span className="font-bold text-charcoal-900">{app.durationDays} Days Celebration</span>
            <span className="text-[0.6875rem] text-charcoal-500 block">{app.weddingScale || "MEDIUM"} Scale</span>
          </div>

          <div className="p-3 bg-warm-50/60 rounded-xl border border-warm-100">
            <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase block">Requested Tier</span>
            <span className="font-bold text-[var(--color-brand-primary)]">{app.requestedTier || app.tier}</span>
            <span className="text-[0.6875rem] text-charcoal-500 block">
              {app.expectedInternationalGuests || app.capacity || 20} Intl Guests
            </span>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid (8 cols Details, 4 cols Decision & Pricing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Itinerary, Ceremonies & Documents (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Day-by-Day Celebration Details */}
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Calendar size={18} className="text-maroon-700" />
                Day-by-Day Celebration Itinerary ({app.days?.length || app.durationDays || 3} Days)
              </h2>
            </div>

            {app.days && app.days.length > 0 ? (
              <div className="space-y-3">
                {app.days.map((day: any) => {
                  const isExpanded = expandedDay === day.dayNumber;

                  return (
                    <div
                      key={day.id || day.dayNumber}
                      className="border border-warm-200 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isExpanded ? 0 : day.dayNumber)}
                        className={cn(
                          "w-full px-5 py-3.5 flex items-center justify-between text-left transition-all cursor-pointer",
                          isExpanded ? "bg-maroon-50/70 border-b border-warm-200" : "bg-white hover:bg-warm-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                            D{day.dayNumber}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-charcoal-900 block">{day.title}</span>
                            <span className="text-[0.6875rem] text-charcoal-500">
                              {day.events?.length || 0} ceremonies · {day.expectedInternationalGuests} expected guests
                            </span>
                          </div>
                        </div>

                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {isExpanded && (
                        <div className="p-5 bg-warm-50/30 space-y-4 text-xs animate-fade-in">
                          {/* Ceremonies List */}
                          <div className="space-y-2">
                            <span className="font-bold text-charcoal-800 uppercase tracking-wider text-[0.6875rem] block">
                              Ceremonies &amp; Timings:
                            </span>
                            {(day.events || []).map((ev: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-warm-200 space-y-1">
                                <div className="flex items-center justify-between font-bold text-charcoal-900">
                                  <span>{ev.name}</span>
                                  <span className="font-mono text-charcoal-600">
                                    {ev.startTime} – {ev.endTime}
                                  </span>
                                </div>
                                {ev.location && (
                                  <span className="text-[0.6875rem] text-maroon-700 block">📍 {ev.location}</span>
                                )}
                                {ev.description && (
                                  <p className="text-[0.6875rem] text-charcoal-600 leading-snug">{ev.description}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Day Experiences */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-warm-200/60 text-[0.6875rem]">
                            <div className="bg-white p-3 rounded-xl border border-warm-100">
                              <span className="font-bold text-charcoal-500 uppercase block mb-0.5">Guest Experience:</span>
                              <span className="text-charcoal-800 font-medium">{day.guestExperience || "Standard hospitality"}</span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-warm-100">
                              <span className="font-bold text-charcoal-500 uppercase block mb-0.5">Food &amp; Dining:</span>
                              <span className="text-charcoal-800 font-medium">{day.foodExperience || "Traditional feast"}</span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-warm-100">
                              <span className="font-bold text-charcoal-500 uppercase block mb-0.5">Attire &amp; Dress Code:</span>
                              <span className="text-charcoal-800 font-medium">{day.dressCode || "Ethnic / Formal"}</span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-warm-100">
                              <span className="font-bold text-charcoal-500 uppercase block mb-0.5">Special Highlights:</span>
                              <span className="text-charcoal-800 font-medium">{day.specialActivities || "None specified"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-charcoal-500 italic">No multi-day itinerary provided (legacy application).</p>
            )}
          </div>

          {/* Document Requests & Uploaded Materials */}
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <FileText size={18} className="text-maroon-700" />
                Document Verification &amp; Media Requests ({app.documentRequests?.length || 0})
              </h2>

              <button
                type="button"
                onClick={() => setShowDocRequestModal(true)}
                className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Request
              </button>
            </div>

            {app.documentRequests && app.documentRequests.length > 0 ? (
              <div className="space-y-3">
                {app.documentRequests.map((req: any) => (
                  <div key={req.id} className="p-4 bg-warm-50/50 rounded-2xl border border-warm-200 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-charcoal-900">{req.title}</span>
                          <span
                            className={cn(
                              "text-[0.625rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                              req.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : req.status === "FULFILLED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {req.status}
                          </span>
                          {req.isRequired && (
                            <span className="text-[0.5625rem] font-bold bg-warm-200 text-charcoal-700 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600">{req.description}</p>
                      </div>
                    </div>

                    {/* Uploaded files for this request */}
                    {req.documents && req.documents.length > 0 ? (
                      <div className="space-y-2 pt-2 border-t border-warm-200/60">
                        {req.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="bg-white p-3 rounded-xl border border-warm-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={15} className="text-maroon-700 shrink-0" />
                              <span className="font-semibold text-charcoal-900 truncate">{doc.fileName}</span>
                              <span className="text-[0.625rem] text-charcoal-400">
                                ({(doc.fileSize / 1024).toFixed(0)} KB)
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-charcoal-600 hover:text-maroon-700"
                                title="View Document"
                              >
                                <Eye size={14} />
                              </a>

                              {doc.status !== "APPROVED" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewDoc(doc.id, "APPROVED")}
                                  className="btn btn-secondary text-[0.6875rem] font-bold py-1 px-2.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}

                              {doc.status !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewDoc(doc.id, "REJECTED", "Document blurry or invalid.")}
                                  className="btn btn-secondary text-[0.6875rem] font-bold py-1 px-2.5 text-red-700 border-red-300 hover:bg-red-50 cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[0.6875rem] text-charcoal-400 italic block">
                        Waiting for host upload...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-charcoal-500 italic">No document requests created yet.</p>
            )}
          </div>

          {/* Story & Host Message */}
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider">
              Host Message &amp; Celebration Story
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed italic bg-warm-50/50 p-4 rounded-2xl border border-warm-100">
              &quot;{app.story || "No message provided."}&quot;
            </p>
          </div>
        </div>

        {/* Right Column: Authoritative Verification Controls & Payout Economics (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          {/* Marketplace Visibility & Promotion Status Panel */}
          {(() => {
            const linkedWedding = data?.wedding || (!data?.isHostApp ? data : null);
            const isLinkedSponsored = Boolean(linkedWedding?.sponsored && (!linkedWedding?.sponsorshipEnd || new Date(linkedWedding.sponsorshipEnd) > new Date()));
            const isLinkedFeatured = !isLinkedSponsored && Boolean(linkedWedding?.featured);
            const currentPriority = isLinkedSponsored ? "SPONSORED" : isLinkedFeatured ? "FEATURED" : "NORMAL";
            const activePromotion = linkedWedding?.sponsorshipRequests?.[0];

            return (
              <div className="bg-white border border-warm-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="border-b border-warm-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[0.625rem] font-bold uppercase tracking-wider text-amber-700 block">
                      Discovery &amp; Ranking
                    </span>
                    <h3 className="font-display font-bold text-base text-charcoal-900">
                      Marketplace Visibility
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[0.625rem] font-extrabold uppercase tracking-wider flex items-center gap-1",
                      isLinkedSponsored
                        ? "bg-[#180309] text-amber-300 border border-amber-500/40 shadow-xs"
                        : isLinkedFeatured
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-warm-100 text-charcoal-600 border border-warm-200"
                    )}
                  >
                    {isLinkedSponsored && <Sparkles size={10} className="text-amber-400" />}
                    {isLinkedFeatured && <Star size={10} className="text-amber-600 fill-amber-500" />}
                    {currentPriority} (#{currentPriority === "SPONSORED" ? "1" : currentPriority === "FEATURED" ? "2" : "3"})
                  </span>
                </div>

                <p className="text-[0.6875rem] text-charcoal-500 leading-relaxed">
                  <strong>Verification &amp; Publishing</strong> confirms commercial listing details. <strong>Promotions</strong> control search &amp; homepage discovery boost.
                </p>

                {linkedWedding ? (
                  <div className="space-y-3 pt-1">
                    {activePromotion && (
                      <div className="p-3 bg-warm-50 rounded-xl border border-warm-100 text-[0.6875rem] space-y-1">
                        <div className="flex justify-between font-bold text-charcoal-800">
                          <span>Active Campaign:</span>
                          <span className="text-[var(--color-brand-primary)] font-bold">{activePromotion.promotionType || "SPONSORED"} ({activePromotion.status})</span>
                        </div>
                        {activePromotion.startsAt && activePromotion.endsAt && (
                          <div className="text-charcoal-500 flex justify-between">
                            <span>Validity:</span>
                            <span>{formatDate(activePromotion.startsAt)} — {formatDate(activePromotion.endsAt)}</span>
                          </div>
                        )}
                        {activePromotion.amount !== undefined && activePromotion.amount !== null && (
                          <div className="text-charcoal-500 flex justify-between">
                            <span>Approved Fee:</span>
                            <span className="font-semibold text-charcoal-800">{activePromotion.currency || "USD"} {activePromotion.amount}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(linkedWedding.id, Boolean(linkedWedding.featured))}
                        disabled={isPending}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border",
                          linkedWedding.featured
                            ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs"
                            : "bg-white hover:bg-warm-100 text-charcoal-800 border-warm-300"
                        )}
                      >
                        <Star size={12} className={linkedWedding.featured ? "fill-white" : ""} />
                        {linkedWedding.featured ? "Featured (Toggle Off)" : "Set Featured (#2)"}
                      </button>

                      <Link
                        href={`/dashboard/admin/weddings/sponsorship?weddingId=${linkedWedding.id}`}
                        className="py-2 px-3 bg-[var(--color-brand-primary)] hover:bg-maroon-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Sparkles size={12} />
                        Promotions CRM
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[0.6875rem] text-amber-800">
                    Publish this wedding to enable promotional boost and placement controls.
                  </div>
                )}
              </div>
            );
          })()}

          {/* Authoritative Tier & Duration Override Panel */}
          <div className="bg-white border border-warm-200/80 p-6 rounded-3xl shadow-sm space-y-5">
            <div className="border-b border-warm-100 pb-3">
              <span className="text-[0.625rem] font-bold uppercase tracking-wider text-[var(--color-brand-primary)] block">
                Admin Commercial Authority
              </span>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Verify Tier &amp; Duration
              </h3>
            </div>

            {/* Verified Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                Authoritative Commercial Tier
              </label>
              <select
                value={verifiedTier}
                onChange={(e) => setVerifiedTier(e.target.value as WeddingTier)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:border-maroon-600"
              >
                {(["STANDARD", "ENHANCED", "GRAND", "ROYAL", "SIGNATURE_ROYAL"] as WeddingTier[]).map((t) => (
                  <option key={t} value={t}>
                    {WEDDING_TIER_CONFIG[t].label} (Host Req: {app.requestedTier || "STANDARD"})
                  </option>
                ))}
              </select>
            </div>

            {/* Verified Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                Authoritative Duration (Days)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as WeddingDurationDays[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setVerifiedDuration(d)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                      verifiedDuration === d
                        ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                        : "bg-warm-50 text-charcoal-700 border-warm-200 hover:bg-warm-100"
                    )}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Authoritative Economics Calculation Box */}
            <div className="p-4 bg-maroon-950 text-white rounded-2xl space-y-2 text-xs">
              <span className="text-[0.625rem] font-bold text-gold-400 uppercase tracking-wider block">
                Authoritative Pricing Preview
              </span>

              <div className="flex justify-between text-white/80">
                <span>Customer Price / Guest:</span>
                <span className="font-bold text-white">${authoritativeCustomerPriceUSD} USD</span>
              </div>

              <div className="flex justify-between text-white/80">
                <span>Host Fixed Rate / Guest:</span>
                <span className="font-bold text-gold-300">₹{verifiedRatePerGuestINR.toLocaleString("en-IN")} INR</span>
              </div>

              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                <span>Potential Host Payout:</span>
                <span className="text-gradient-gold">₹{totalVerifiedHostPayoutINR.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Internal vs Host-Facing Notes */}
            <div className="space-y-3 pt-2 border-t border-warm-100 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 uppercase text-[0.6875rem]">
                  Host-Facing Feedback (Visible to Host)
                </label>
                <textarea
                  rows={3}
                  value={hostFacingNotes}
                  onChange={(e) => setHostFacingNotes(e.target.value)}
                  placeholder="e.g. Your application is verified as Royal Tier for 4 days. Please upload venue confirmation."
                  className="w-full p-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 uppercase text-[0.6875rem]">
                  Internal Admin Notes (Confidential)
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Verified venue directly with hotel GM. Safety score 95/100."
                  className="w-full p-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-900"
                />
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-warm-100">
              <button
                type="button"
                onClick={() => handleDecision("APPROVED_FOR_LISTING", true)}
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 size={15} />
                Verify &amp; Publish Immediately
              </button>

              <button
                type="button"
                onClick={() => handleDecision("VERIFIED", false)}
                disabled={isPending}
                className="w-full py-2.5 bg-warm-100 hover:bg-warm-200 text-charcoal-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={14} />
                Set Verified (Staged for Publishing)
              </button>

              <button
                type="button"
                onClick={() => handleDecision("ACTION_REQUIRED", false)}
                disabled={isPending}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertCircle size={14} />
                Request Changes / Action Required
              </button>

              <button
                type="button"
                onClick={() => handleDecision("REJECTED", false)}
                disabled={isPending}
                className="w-full py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle size={14} />
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Document Request */}
      {showDocRequestModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5 border border-warm-200">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Request Document or Media
              </h3>
              <button
                type="button"
                onClick={() => setShowDocRequestModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 uppercase">Document Request Type</label>
                <select
                  value={docReqType}
                  onChange={(e) => {
                    setDocReqType(e.target.value);
                    const matching = REQUEST_TYPES.find((t) => t.key === e.target.value);
                    if (matching) setDocReqTitle(matching.label);
                  }}
                  className="w-full p-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-medium"
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 uppercase">Request Title</label>
                <input
                  type="text"
                  required
                  value={docReqTitle}
                  onChange={(e) => setDocReqTitle(e.target.value)}
                  className="w-full p-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-700 uppercase">Description / Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={docReqDesc}
                  onChange={(e) => setDocReqDesc(e.target.value)}
                  className="w-full p-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-charcoal-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqIsRequired"
                  checked={docReqRequired}
                  onChange={(e) => setDocReqRequired(e.target.checked)}
                  className="rounded border-warm-300 accent-[var(--color-brand-primary)]"
                />
                <label htmlFor="reqIsRequired" className="font-bold text-charcoal-800">
                  Required before celebration can be approved
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-100">
                <button
                  type="button"
                  onClick={() => setShowDocRequestModal(false)}
                  className="btn btn-secondary text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary text-xs font-bold py-2 px-5 cursor-pointer"
                >
                  Send Request to Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

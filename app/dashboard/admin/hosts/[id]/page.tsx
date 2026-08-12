"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Mail,
  Phone,
  Heart,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import {
  adminGetHostApplicationByIdAction,
  adminReviewHostApplicationAction
} from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export default function AdminHostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await adminGetHostApplicationByIdAction(id);
      if (!data) {
        toast.error("Host application not found.");
      } else {
        setWedding(data);
        if (data.hostCouple?.user?.verification?.notes) {
          setReviewNotes(data.hostCouple.user.verification.notes);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load host application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const handleReviewAction = async (
    status: "APPROVED" | "REJECTED" | "NEED_MORE_DOCUMENTS" | "UNDER_REVIEW"
  ) => {
    setSubmittingAction(status);
    try {
      const res = await adminReviewHostApplicationAction(
        wedding.id,
        status,
        reviewNotes || `Admin reviewed host application: set to ${status}`
      );
      if (res?.success) {
        toast.success(`Host application status updated to ${status}!`);
        await loadDetail();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute review action.");
    } finally {
      setSubmittingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={32} className="animate-spin text-[var(--color-brand-primary)]" />
        <p className="text-xs font-bold text-charcoal-500">Loading host application details...</p>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="bg-white border border-warm-200/60 rounded-3xl p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="text-amber-600 mx-auto" />
        <h2 className="font-display font-bold text-xl text-charcoal-900">Host Application Not Found</h2>
        <p className="text-xs text-charcoal-500">
          The requested host application ID does not exist or has been removed.
        </p>
        <Link href="/dashboard/admin/hosts" className="btn btn-primary text-xs font-bold px-6 py-2.5 inline-block">
          Return to Host Applications
        </Link>
      </div>
    );
  }

  const hostCouple = wedding.hostCouple;
  const hostUser = hostCouple?.user;
  const verification = hostUser?.verification;
  const verStatus = verification?.status || "NOT_SUBMITTED";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/hosts"
          className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Host Applications Queue
        </Link>

        {wedding.status === "PUBLISHED" && (
          <Link
            href={`/weddings/${wedding.slug}`}
            target="_blank"
            className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <ExternalLink size={14} />
            View Live on Marketplace
          </Link>
        )}
      </div>

      {/* Header Info */}
      <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-100 pb-4">
          <div>
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)] block mb-1">
              Host Application #{wedding.id.slice(-6).toUpperCase()}
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              {wedding.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                verStatus === "APPROVED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : verStatus === "REJECTED"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : verStatus === "NEED_MORE_DOCUMENTS"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              Verification: {verStatus.replace(/_/g, " ")}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                wedding.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : wedding.status === "REJECTED"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-warm-100 text-charcoal-700 border-warm-300"
              }`}
            >
              Wedding: {wedding.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Submitted Date</span>
            <span className="font-semibold text-charcoal-800">{formatDate(wedding.createdAt)}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Category / Religion</span>
            <span className="font-semibold text-charcoal-800">{wedding.category || "Traditional"}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Capacity</span>
            <span className="font-semibold text-charcoal-800">{wedding.capacity} International Guests</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Price Per Guest</span>
            <span className="font-semibold text-charcoal-800">₹{wedding.pricePerGuest?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Review Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Host & Wedding Information */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Host Contact Information */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <User size={18} className="text-[var(--color-brand-primary)]" />
              1. Host Family Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/60 space-y-1">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Host Contact Name</span>
                <span className="font-bold text-sm text-charcoal-900 block">{hostUser?.name || "N/A"}</span>
              </div>

              <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/60 space-y-1">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Email Address</span>
                <span className="font-bold text-sm text-charcoal-900 block">{hostUser?.email || "N/A"}</span>
              </div>

              <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/60 space-y-1">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">User Role & Status</span>
                <span className="font-bold text-xs text-charcoal-800 block uppercase">
                  {hostUser?.role || "COUPLE"} · {hostUser?.status || "ONBOARDING"}
                </span>
              </div>

              <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/60 space-y-1">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Account User ID</span>
                <span className="font-mono text-xs text-charcoal-600 truncate block">{hostUser?.id || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* 2. Wedding Celebration Details */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Heart size={18} className="text-maroon-700" />
              2. Celebration Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-charcoal-400 uppercase text-[0.625rem] block mb-1">Bride & Groom / Couple</span>
                <span className="font-bold text-sm text-charcoal-900">{wedding.title}</span>
              </div>

              <div>
                <span className="font-bold text-charcoal-400 uppercase text-[0.625rem] block mb-1">Venue & Location</span>
                <span className="font-semibold text-charcoal-800">{wedding.location}</span>
              </div>

              <div>
                <span className="font-bold text-charcoal-400 uppercase text-[0.625rem] block mb-1">Wedding Date</span>
                <span className="font-semibold text-charcoal-800">{formatDate(wedding.date)}</span>
              </div>

              <div>
                <span className="font-bold text-charcoal-400 uppercase text-[0.625rem] block mb-1">Tradition / Religion</span>
                <span className="font-semibold text-charcoal-800">{wedding.category}</span>
              </div>
            </div>

            {/* Couple Story / Description */}
            <div className="bg-warm-50/60 border border-warm-200/60 p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-maroon-700" />
                Couple Story & Host Welcome Note
              </h4>
              <p className="text-xs text-charcoal-600 leading-relaxed italic">
                "{wedding.description || "No description provided."}"
              </p>
            </div>

            {/* Provided Image Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider">
                Submitted Image & Gallery Preview
              </h4>
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-warm-200 border border-warm-200">
                <Image
                  src={wedding.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80"}
                  alt={wedding.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Admin Review & Approval Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 sticky top-28">
            <div className="border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-amber-700" />
                Admin Verification Suite
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Review submitted documents, update verification status, and publish celebration to the live marketplace.
              </p>
            </div>

            {/* Existing Verification Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 block">
                Admin Review Notes & Decision Rationale
              </label>
              <textarea
                rows={4}
                placeholder="Enter internal verification notes, reviewer feedback, or reasons for status updates..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="input-luxury w-full text-xs bg-warm-50/50"
              />
            </div>

            {/* Interactive Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* 1. Approve & Publish */}
              <button
                onClick={() => handleReviewAction("APPROVED")}
                disabled={submittingAction !== null}
                className="w-full btn btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                <CheckCircle2 size={16} />
                {submittingAction === "APPROVED" ? "Publishing..." : "Approve & Publish Celebration"}
              </button>

              {/* 2. Request Changes / Need More Docs */}
              <button
                onClick={() => handleReviewAction("NEED_MORE_DOCUMENTS")}
                disabled={submittingAction !== null}
                className="w-full btn btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-blue-300 text-blue-800 hover:bg-blue-50"
              >
                <AlertCircle size={16} className="text-blue-600" />
                {submittingAction === "NEED_MORE_DOCUMENTS" ? "Updating..." : "Request Additional Documents"}
              </button>

              {/* 3. Set Under Review */}
              <button
                onClick={() => handleReviewAction("UNDER_REVIEW")}
                disabled={submittingAction !== null}
                className="w-full btn btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-warm-300 text-charcoal-700 hover:bg-warm-100"
              >
                <Clock size={16} className="text-amber-600" />
                {submittingAction === "UNDER_REVIEW" ? "Updating..." : "Mark Under Review"}
              </button>

              {/* 4. Reject Application */}
              <button
                onClick={() => handleReviewAction("REJECTED")}
                disabled={submittingAction !== null}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                {submittingAction === "REJECTED" ? "Rejecting..." : "Reject Application"}
              </button>
            </div>

            <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/60 text-[0.6875rem] text-charcoal-500 space-y-1">
              <span className="font-bold text-charcoal-800 block">Verification Audit Trail:</span>
              <p>· Reviewed By: <strong>{verification?.reviewedBy || "Pending Review"}</strong></p>
              <p>· Expiry Date: <strong>{verification?.expiryDate ? formatDate(verification.expiryDate) : "N/A"}</strong></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

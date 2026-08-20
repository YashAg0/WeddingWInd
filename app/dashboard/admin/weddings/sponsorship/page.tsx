import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  adminReviewSponsorshipRequestAction,
  adminGetSponsorshipRequestsAction,
  adminRevokeSponsorshipAction,
  adminExtendSponsorshipAction,
  adminDirectAddSponsorshipAction,
  adminVerifyPaymentAndActivateAction,
  adminUpdateChecklistAction,
  adminGetPaymentConfigAction,
  adminUpdatePaymentConfigAction,
  adminUpdatePromotionParametersAction,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronDown,
  DollarSign,
  AlertTriangle,
  Plus,
  CreditCard,
  Phone,
  ExternalLink,
  ShieldCheck,
  Tag,
  Settings,
  CheckSquare,
  Square,
  Star,
} from "lucide-react";
import type { ChecklistItem } from "@/lib/services/sponsorship";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipCRMPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; tab?: string }>;
}) {
  await requireRole([UserRole.ADMIN]);

  const params = await searchParams;
  const filter = params.filter || "ALL";

  const [allRequests, requests, publishedWeddings, paymentConfig] = await Promise.all([
    adminGetSponsorshipRequestsAction("ALL"),
    adminGetSponsorshipRequestsAction(filter === "ALL" ? undefined : filter),
    prisma.wedding.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: {
        id: true,
        title: true,
        location: true,
        sponsored: true,
        featured: true,
        hostCouple: { select: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { title: "asc" },
    }),
    adminGetPaymentConfigAction(),
  ]);

  const now = new Date();

  // Calculate CRM KPIs
  const totalCount = allRequests.length;
  const sponsoredCount = allRequests.filter((r) => r.promotionType === "SPONSORED" || !r.promotionType).length;
  const featuredCount = allRequests.filter((r) => r.promotionType === "FEATURED").length;
  const pendingCount = allRequests.filter((r) => r.status === "PENDING").length;
  const paymentPendingCount = allRequests.filter(
    (r) => r.status === "PAYMENT_PENDING" && r.paymentStatus !== "PAYMENT_SUBMITTED"
  ).length;
  const paymentSubmittedCount = allRequests.filter(
    (r) => r.paymentStatus === "PAYMENT_SUBMITTED" && r.status !== "ACTIVE"
  ).length;
  const activeCount = allRequests.filter(
    (r) => r.status === "ACTIVE" && !r.revokedAt && r.endsAt && new Date(r.endsAt) > now
  ).length;
  const expiringSoonCount = allRequests.filter((r) => {
    if (r.status !== "ACTIVE" || r.revokedAt || !r.endsAt) return false;
    const end = new Date(r.endsAt);
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return end > now && end <= soon;
  }).length;

  // Server Actions for CRM Operations
  async function handleApprove(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const promotionType = (formData.get("promotionType") as any) || "SPONSORED";
    const adminNotes = (formData.get("adminNotes") as string) || undefined;
    const sponsorshipStart = (formData.get("sponsorshipStart") as string) || null;
    const sponsorshipEnd = (formData.get("sponsorshipEnd") as string) || null;
    const amount = Number(formData.get("amount") || 299);
    const currency = (formData.get("currency") as string) || "INR";
    const durationDays = Number(formData.get("durationDays") || 7);
    const paymentMethod = (formData.get("paymentMethod") as any) || (currency === "INR" ? "UPI" : "PAYPAL");
    const paymentRequired = formData.get("paymentRequired") !== "false";

    await adminReviewSponsorshipRequestAction(
      requestId,
      "APPROVED",
      adminNotes,
      sponsorshipStart,
      sponsorshipEnd,
      { promotionType, amount, currency, durationDays, paymentMethod, paymentRequired }
    );
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    const rejectionReason = (formData.get("rejectionReason") as string) || undefined;
    const adminNotes = (formData.get("adminNotes") as string) || undefined;
    await adminReviewSponsorshipRequestAction(
      requestId,
      "REJECTED",
      adminNotes,
      null,
      null,
      { rejectionReason }
    );
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleVerifyPayment(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const transactionReference = (formData.get("transactionReference") as string) || undefined;
    const paymentMethod = (formData.get("paymentMethod") as any) || undefined;
    const verifiedAmount = formData.get("verifiedAmount") ? Number(formData.get("verifiedAmount")) : undefined;
    const currency = (formData.get("currency") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;

    await adminVerifyPaymentAndActivateAction({
      sponsorshipId,
      transactionReference,
      paymentMethod,
      verifiedAmount,
      currency,
      notes,
    });
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleToggleChecklist(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const itemKey = formData.get("itemKey") as string;
    const completed = formData.get("completed") === "true";

    await adminUpdateChecklistAction(sponsorshipId, itemKey, completed);
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleRevoke(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const reason = (formData.get("reason") as string) || "Revoked by marketplace administrator";
    await adminRevokeSponsorshipAction(sponsorshipId, reason);
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleExtend(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const extensionDays = Number(formData.get("extensionDays") || 7);
    const adminNotes = (formData.get("adminNotes") as string) || undefined;
    await adminExtendSponsorshipAction(sponsorshipId, extensionDays, adminNotes);
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleDirectAdd(formData: FormData) {
    "use server";
    const weddingId = formData.get("weddingId") as string;
    const promotionType = (formData.get("promotionType") as any) || "SPONSORED";
    const source = (formData.get("source") as any) || "ADMIN_OUTREACH";
    const contactMethod = (formData.get("contactMethod") as any) || "WHATSAPP";
    const contactNotes = (formData.get("contactNotes") as string) || undefined;
    const agreementNotes = (formData.get("agreementNotes") as string) || undefined;
    const durationDays = Number(formData.get("durationDays") || 7);
    const amount = Number(formData.get("amount") || 0);
    const currency = (formData.get("currency") as string) || "INR";
    const paymentMethod = (formData.get("paymentMethod") as any) || "UPI";
    const paymentStatus = (formData.get("paymentStatus") as any) || "PAYMENT_REQUESTED";
    const paymentRequired = paymentStatus !== "WAIVED";
    const adminNotes = (formData.get("adminNotes") as string) || undefined;

    await adminDirectAddSponsorshipAction({
      weddingId,
      promotionType,
      source,
      contactMethod,
      contactNotes,
      agreementNotes,
      durationDays,
      amount,
      currency,
      paymentMethod,
      paymentStatus,
      paymentRequired,
      adminNotes,
    });
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleUpdateParameters(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const promotionType = (formData.get("promotionType") as any) || undefined;
    const amount = formData.get("amount") ? Number(formData.get("amount")) : undefined;
    const currency = (formData.get("currency") as string) || undefined;
    const durationDays = formData.get("durationDays") ? Number(formData.get("durationDays")) : undefined;
    const paymentMethod = (formData.get("paymentMethod") as any) || undefined;
    const paymentStatus = (formData.get("paymentStatus") as any) || undefined;
    const startsAt = (formData.get("startsAt") as string) || undefined;
    const endsAt = (formData.get("endsAt") as string) || undefined;
    const adminNotes = (formData.get("adminNotes") as string) || undefined;

    await adminUpdatePromotionParametersAction({
      sponsorshipId,
      promotionType,
      amount,
      currency,
      durationDays,
      paymentMethod,
      paymentStatus,
      startsAt,
      endsAt,
      adminNotes,
    });
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  async function handleUpdateConfig(formData: FormData) {
    "use server";
    const upiId = formData.get("upiId") as string;
    const upiName = formData.get("upiName") as string;
    const upiQrImageUrl = (formData.get("upiQrImageUrl") as string) || null;
    const upiPaymentLink = (formData.get("upiPaymentLink") as string) || null;
    const upiInstructions = formData.get("upiInstructions") as string;
    const paypalPaymentLink = formData.get("paypalPaymentLink") as string;
    const paypalDisplayName = formData.get("paypalDisplayName") as string;
    const paypalInstructions = formData.get("paypalInstructions") as string;
    const bankTransferInstructions = formData.get("bankTransferInstructions") as string;

    await adminUpdatePaymentConfigAction({
      upiId,
      upiName,
      upiQrImageUrl,
      upiPaymentLink,
      upiInstructions,
      paypalPaymentLink,
      paypalDisplayName,
      paypalInstructions,
      bankTransferInstructions,
    });
    redirect("/dashboard/admin/weddings/sponsorship");
  }

  const filterOptions = [
    { value: "ALL", label: `All Records (${totalCount})` },
    { value: "SPONSORED_REQUESTS", label: `✦ Sponsored (${sponsoredCount})` },
    { value: "FEATURED_REQUESTS", label: `★ Featured (${featuredCount})` },
    { value: "PENDING", label: `Pending Review (${pendingCount})` },
    { value: "PAYMENT_PENDING", label: `Payment Pending (${paymentPendingCount})` },
    { value: "PAYMENT_SUBMITTED", label: `⚡ Payment Submitted (${paymentSubmittedCount})`, alert: paymentSubmittedCount > 0 },
    { value: "ACTIVE", label: `Active (${activeCount})` },
    { value: "EXPIRING_SOON", label: `Expiring Soon (${expiringSoonCount})` },
    { value: "EXPIRED", label: "Expired" },
    { value: "REVOKED", label: "Revoked" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const statusBadge = (status: string, paymentStatus?: string | null) => {
    if (paymentStatus === "PAYMENT_SUBMITTED" && status !== "ACTIVE") {
      return "bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-extrabold";
    }
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "PAYMENT_PENDING":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ACTIVE":
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "REVOKED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "CANCELLED":
      case "EXPIRED":
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
              Back to Weddings Directory
            </Link>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
            <Sparkles size={26} className="text-amber-500" />
            Sponsored Placements &amp; Outreach CRM
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Manage advertising partnerships, negotiate sponsor deals on WhatsApp/Phone, configure UPI &amp; PayPal payment instructions, verify host transaction references, and track 10-step progress checklists.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-warm-200/60 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-charcoal-500 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Total Placements</span>
            <Tag size={13} className="text-charcoal-400" />
          </div>
          <p className="font-display font-bold text-xl text-charcoal-900 mt-1">{totalCount}</p>
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Pending Review</span>
            <Clock size={13} className="text-amber-600" />
          </div>
          <p className="font-display font-bold text-xl text-amber-900 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white border border-blue-200/60 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Payment Pending</span>
            <DollarSign size={13} className="text-blue-600" />
          </div>
          <p className="font-display font-bold text-xl text-blue-900 mt-1">{paymentPendingCount}</p>
        </div>

        <div className={`rounded-2xl p-3.5 shadow-xs border ${
          paymentSubmittedCount > 0
            ? "bg-amber-500/10 border-amber-400 text-amber-950 ring-2 ring-amber-400/30"
            : "bg-white border-warm-200/60 text-charcoal-700"
        }`}>
          <div className="flex items-center justify-between text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Needs Verification</span>
            <ShieldCheck size={13} className={paymentSubmittedCount > 0 ? "text-amber-600 animate-bounce" : "text-charcoal-400"} />
          </div>
          <p className="font-display font-bold text-xl mt-1">{paymentSubmittedCount}</p>
        </div>

        <div className="bg-white border border-emerald-200/60 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Active Placements</span>
            <Sparkles size={13} className="text-emerald-600" />
          </div>
          <p className="font-display font-bold text-xl text-emerald-900 mt-1">{activeCount}</p>
        </div>

        <div className="bg-white border border-rose-200/60 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-[0.6875rem] font-bold uppercase tracking-wider">
            <span>Expiring Soon</span>
            <AlertTriangle size={13} className="text-rose-600" />
          </div>
          <p className="font-display font-bold text-xl text-rose-900 mt-1">{expiringSoonCount}</p>
        </div>
      </div>

      {/* Control Drawers: Direct Add & Payment Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Direct Outreach Placement Creation */}
        <details className="group bg-white border border-warm-200/60 rounded-3xl p-5 shadow-xs">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Plus size={16} />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-charcoal-900 block">
                  + Create Direct Sponsored Placement
                </span>
                <span className="text-[0.6875rem] text-charcoal-500">
                  Log WhatsApp / Phone outreach or close a negotiated sponsor deal
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-charcoal-400 group-open:rotate-180 transition-transform" />
          </summary>

          <form action={handleDirectAdd} className="mt-4 space-y-4 pt-4 border-t border-warm-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Target Published Wedding *
                </label>
                <select name="weddingId" required className="input-luxury w-full text-xs bg-white">
                  <option value="">Select celebration...</option>
                  {publishedWeddings.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.location}){w.sponsored ? " [Sponsored]" : w.featured ? " [Featured]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Promotion Placement Tier *
                </label>
                <select name="promotionType" defaultValue="SPONSORED" className="input-luxury w-full text-xs bg-white font-semibold">
                  <option value="SPONSORED">✦ SPONSORED (#1 Top Priority &amp; Gold Frame)</option>
                  <option value="FEATURED">★ FEATURED (#2 Highlighted Ribbon Above Standard)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Sponsorship Origin / Source
                </label>
                <select name="source" defaultValue="ADMIN_OUTREACH" className="input-luxury w-full text-xs bg-white">
                  <option value="ADMIN_OUTREACH">Admin Outreach (WhatsApp / Phone / In Person)</option>
                  <option value="HOST_REQUEST">Host Requested via Website</option>
                  <option value="PARTNER">Strategic / Brand Partner</option>
                  <option value="MANUAL">Manual Offline Arrangement</option>
                  <option value="OTHER">Other Promotional Placement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Contact Channel
                </label>
                <select name="contactMethod" defaultValue="WHATSAPP" className="input-luxury w-full text-xs bg-white">
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="IN_PERSON">In Person Meeting</option>
                  <option value="WEBSITE">Website Form</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Currency
                </label>
                <select name="currency" defaultValue="INR" className="input-luxury w-full text-xs bg-white">
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Placement Fee Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  defaultValue="15000"
                  min="0"
                  className="input-luxury w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Duration (Days)
                </label>
                <select name="durationDays" defaultValue="14" className="input-luxury w-full text-xs bg-white">
                  <option value="7">7 Days</option>
                  <option value="14">14 Days (Standard)</option>
                  <option value="30">30 Days (Full Season)</option>
                  <option value="60">60 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Payment Method
                </label>
                <select name="paymentMethod" defaultValue="UPI" className="input-luxury w-full text-xs bg-white">
                  <option value="UPI">UPI (QR Code / VPA)</option>
                  <option value="PAYPAL">PayPal External Link</option>
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CASH">Cash / Offline</option>
                  <option value="WAIVED">Waived / Complimentary</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Initial Payment Status
                </label>
                <select name="paymentStatus" defaultValue="PAYMENT_REQUESTED" className="input-luxury w-full text-xs bg-white">
                  <option value="PAYMENT_REQUESTED">Payment Requested (Waiting for Host)</option>
                  <option value="PAYMENT_VERIFIED">Payment Already Received &amp; Verified (Instant Active)</option>
                  <option value="WAIVED">Waived / Free Editorial (Instant Active)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Outreach / Agreement Notes (Internal)
                </label>
                <input
                  type="text"
                  name="contactNotes"
                  placeholder="e.g. Discussed ₹15,000 for 14-day placement on WhatsApp"
                  className="input-luxury w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Admin Display Note (Shown to Host)
                </label>
                <input
                  type="text"
                  name="adminNotes"
                  placeholder="e.g. Official Sponsored Placement arranged with WeddingWithIndia"
                  className="input-luxury w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
            >
              <Sparkles size={13} />
              Create &amp; Save Sponsorship
            </button>
          </form>
        </details>

        {/* Payment Configuration (UPI QR & PayPal Links) */}
        <details className="group bg-white border border-warm-200/60 rounded-3xl p-5 shadow-xs">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                <Settings size={16} />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-charcoal-900 block">
                  Configure Payment Destinations (UPI &amp; PayPal)
                </span>
                <span className="text-[0.6875rem] text-charcoal-500">
                  Update UPI QR image, VPA ID, and official PayPal payment link
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-charcoal-400 group-open:rotate-180 transition-transform" />
          </summary>

          <form action={handleUpdateConfig} className="mt-4 space-y-3.5 pt-4 border-t border-warm-100 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Official UPI ID (VPA)
                </label>
                <input
                  type="text"
                  name="upiId"
                  defaultValue={paymentConfig.upiId || ""}
                  required
                  placeholder="namaste@okhdfcbank"
                  className="input-luxury w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  UPI Display Name
                </label>
                <input
                  type="text"
                  name="upiName"
                  defaultValue={paymentConfig.upiName || ""}
                  required
                  placeholder="WeddingWithIndia Marketplace"
                  className="input-luxury w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                UPI QR Image URL (Optional)
              </label>
              <input
                type="text"
                name="upiQrImageUrl"
                defaultValue={paymentConfig.upiQrImageUrl || ""}
                placeholder="https://storage.weddingwithindia.com/... or /images/qr.png"
                className="input-luxury w-full text-xs"
              />
              <p className="text-[0.625rem] text-charcoal-400">
                If left blank or unavailable, the website renders the verified UPI ID and App deep-link without broken image placeholders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  Official PayPal Payment Link
                </label>
                <input
                  type="url"
                  name="paypalPaymentLink"
                  defaultValue={paymentConfig.paypalPaymentLink || ""}
                  required
                  placeholder="https://paypal.me/weddingwithindia"
                  className="input-luxury w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                  PayPal Display Name
                </label>
                <input
                  type="text"
                  name="paypalDisplayName"
                  defaultValue={paymentConfig.paypalDisplayName || ""}
                  required
                  placeholder="WeddingWithIndia"
                  className="input-luxury w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wide">
                Bank Wire Transfer Instructions
              </label>
              <textarea
                name="bankTransferInstructions"
                defaultValue={paymentConfig.bankTransferInstructions || ""}
                rows={2}
                className="input-luxury w-full text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 text-white text-xs font-bold rounded-xl hover:bg-charcoal-800 transition-colors cursor-pointer"
            >
              <CheckCircle size={12} />
              Save Payment Configuration
            </button>
          </form>
        </details>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-warm-200 pb-3">
        {filterOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/dashboard/admin/weddings/sponsorship?filter=${opt.value}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === opt.value
                ? "bg-maroon-800 text-white shadow-sm ring-2 ring-maroon-900/20"
                : opt.alert
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold hover:bg-amber-200"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Requests / Placements List */}
      {requests.length === 0 ? (
        <div className="bg-white border border-warm-200/50 rounded-3xl p-12 text-center">
          <Sparkles size={32} className="text-charcoal-300 mx-auto mb-3" />
          <p className="font-display font-bold text-base text-charcoal-700">
            No {filter.toLowerCase()} sponsorship records found
          </p>
          <p className="text-charcoal-500 text-xs mt-1">
            Placements created via Host requests or Direct Admin outreach will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const hostUser = req.wedding.hostCouple?.user;
            const hostName = hostUser?.name || hostUser?.email || "Host";
            const hostEmail = hostUser?.email;
            const checklistItems: ChecklistItem[] = Array.isArray(req.checklist) ? (req.checklist as any) : [];
            const symbol = req.currency === "INR" ? "₹" : req.currency === "EUR" ? "€" : req.currency === "GBP" ? "£" : "$";

            return (
              <div
                key={req.id}
                className={`bg-white border rounded-3xl overflow-hidden shadow-xs transition-shadow ${
                  req.paymentStatus === "PAYMENT_SUBMITTED" && req.status !== "ACTIVE"
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-warm-200/60"
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail & Badges */}
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-warm-200">
                    <Image
                      src={req.wedding.mainImageUrl}
                      alt={req.wedding.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded bg-charcoal-900/80 text-white backdrop-blur-xs">
                        {req.source?.replace("_", " ") || "HOST REQUEST"}
                      </span>
                      {req.contactMethod && (
                        <span className="text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded bg-blue-600/80 text-white backdrop-blur-xs">
                          {req.contactMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content & CRM Body */}
                  <div className="flex-1 p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/weddings/${req.weddingId}`}
                            className="font-display font-bold text-base text-charcoal-900 hover:text-maroon-700 transition-colors"
                          >
                            {req.wedding.title}
                          </Link>
                          <span className="text-xs text-charcoal-400">·</span>
                          <span className="text-xs text-charcoal-500 font-medium">{req.wedding.location}</span>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-2">
                          <span>Host: <strong className="text-charcoal-800">{hostName}</strong> ({hostEmail || "No email"})</span>
                          {req.contactMethod === "WHATSAPP" && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[0.625rem] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Phone size={10} /> WhatsApp Contacted
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[0.625rem] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                            req.promotionType === "FEATURED"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-[#180309] text-amber-300 border-amber-500/50"
                          }`}
                        >
                          {req.promotionType === "FEATURED" ? (
                            <>
                              <Star size={9} className="text-amber-600 fill-amber-500" />
                              ★ FEATURED (#2)
                            </>
                          ) : (
                            <>
                              <Sparkles size={9} className="text-amber-400" />
                              ✦ SPONSORED (#1)
                            </>
                          )}
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase px-2.5 py-1 rounded-full border ${statusBadge(req.status, req.paymentStatus)}`}>
                          {req.status === "PENDING" && <Clock size={9} />}
                          {req.status === "PAYMENT_PENDING" && <DollarSign size={9} />}
                          {(req.status === "ACTIVE" || req.status === "APPROVED") && <CheckCircle size={9} />}
                          {req.status === "REJECTED" && <XCircle size={9} />}
                          {req.status === "REVOKED" && <AlertTriangle size={9} />}
                          {req.paymentStatus === "PAYMENT_SUBMITTED" && req.status !== "ACTIVE"
                            ? "PAYMENT SUBMITTED (VERIFY)"
                            : req.status}
                        </span>

                        <span className="text-[0.625rem] font-bold uppercase px-2 py-1 rounded-full border bg-warm-100 text-charcoal-700 border-warm-200">
                          {req.paymentMethod || "UPI"}
                        </span>
                      </div>
                    </div>

                    {/* Operational Overview Bar */}
                    <div className="p-3 bg-warm-50/70 rounded-2xl border border-warm-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[0.625rem] font-bold uppercase text-charcoal-400 block">Placement Fee</span>
                        <strong className="text-charcoal-900 font-bold text-sm">
                          {req.paymentRequired && req.amount !== null
                            ? `${symbol}${req.amount.toLocaleString()} ${req.currency}`
                            : "Complimentary / Waived"}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[0.625rem] font-bold uppercase text-charcoal-400 block">Duration</span>
                        <strong className="text-charcoal-800">{req.durationDays || req.requestedDurationDays || 7} Days</strong>
                      </div>

                      <div>
                        <span className="text-[0.625rem] font-bold uppercase text-charcoal-400 block">Payment State</span>
                        <span className={`font-bold text-xs ${
                          req.paymentStatus === "PAYMENT_VERIFIED"
                            ? "text-emerald-700"
                            : req.paymentStatus === "PAYMENT_SUBMITTED"
                            ? "text-amber-700 underline font-extrabold"
                            : "text-charcoal-600"
                        }`}>
                          {req.paymentStatus || "PENDING"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.625rem] font-bold uppercase text-charcoal-400 block">Active Timeframe</span>
                        <span className="text-charcoal-700 font-medium text-[0.6875rem]">
                          {req.startsAt && req.endsAt
                            ? `${new Date(req.startsAt).toLocaleDateString()} — ${new Date(req.endsAt).toLocaleDateString()}`
                            : "Scheduled on Activation"}
                        </span>
                      </div>
                    </div>

                    {/* Host Payment Proof / UTR Details (Alert Box) */}
                    {(req.paymentReference || req.paymentProofUrl || req.paymentStatus === "PAYMENT_SUBMITTED") && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-300 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-amber-700" />
                            Host Payment Submission Details
                          </span>
                          {req.paymentSubmittedAt && (
                            <span className="text-[0.625rem] text-amber-800 font-medium">
                              Submitted: {new Date(req.paymentSubmittedAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {req.paymentReference && (
                            <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                              <span className="text-[0.625rem] font-bold text-charcoal-500 uppercase block">UTR / Txn Ref:</span>
                              <code className="text-xs font-mono font-bold text-charcoal-900 select-all">{req.paymentReference}</code>
                            </div>
                          )}
                          {req.paymentProofUrl && (
                            <div className="bg-white/80 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
                              <div>
                                <span className="text-[0.625rem] font-bold text-charcoal-500 uppercase block">Payment Receipt / Screenshot</span>
                                <span className="text-xs text-charcoal-700">Uploaded by host</span>
                              </div>
                              <a
                                href={req.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-[0.6875rem] font-bold hover:bg-amber-300 transition-colors"
                              >
                                View Proof <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>

                        {req.paymentNotes && (
                          <p className="text-[0.6875rem] text-amber-900 italic">
                            Host Note: &ldquo;{req.paymentNotes}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contact Notes & Internal Audit Log */}
                    {(req.contactNotes || req.agreementNotes || req.adminNotes || req.message) && (
                      <div className="p-3 bg-warm-50 rounded-2xl border border-warm-200/50 space-y-1 text-xs text-charcoal-700">
                        {req.contactNotes && (
                          <p><strong className="text-charcoal-900">Outreach Log:</strong> {req.contactNotes}</p>
                        )}
                        {req.agreementNotes && (
                          <p><strong className="text-charcoal-900">Deal Agreement:</strong> {req.agreementNotes}</p>
                        )}
                        {req.message && (
                          <p><strong className="text-charcoal-900">Host Request Message:</strong> {req.message}</p>
                        )}
                        {req.adminNotes && (
                          <p><strong className="text-charcoal-900">Admin Notes:</strong> {req.adminNotes}</p>
                        )}
                      </div>
                    )}

                    {/* Server-Backed 10-Step Progress Checklist */}
                    <details className="group border border-warm-200/80 rounded-2xl p-3 bg-white">
                      <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-charcoal-800 hover:text-maroon-800">
                        <div className="flex items-center gap-1.5">
                          <CheckSquare size={13} className="text-maroon-600" />
                          <span>Sponsorship Progress Checklist ({checklistItems.filter((i) => i.completed).length}/10 Completed)</span>
                        </div>
                        <ChevronDown size={12} className="text-charcoal-400 group-open:rotate-180 transition-transform" />
                      </summary>

                      <div className="mt-3 pt-3 border-t border-warm-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {checklistItems.map((item) => (
                          <form key={item.key} action={handleToggleChecklist} className="flex items-center justify-between p-2 rounded-xl bg-warm-50/50 hover:bg-warm-100/50 border border-warm-200/50">
                            <input type="hidden" name="sponsorshipId" value={req.id} />
                            <input type="hidden" name="itemKey" value={item.key} />
                            <input type="hidden" name="completed" value={item.completed ? "false" : "true"} />
                            <button type="submit" className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0">
                              {item.completed ? (
                                <CheckSquare size={14} className="text-emerald-600 flex-shrink-0" />
                              ) : (
                                <Square size={14} className="text-charcoal-300 flex-shrink-0" />
                              )}
                              <span className={`text-[0.6875rem] ${item.completed ? "font-semibold text-charcoal-900 line-through opacity-80" : "font-medium text-charcoal-700"}`}>
                                {item.label}
                              </span>
                            </button>
                            {item.completed && item.completedAt && (
                              <span className="text-[0.5625rem] text-charcoal-400 ml-2 flex-shrink-0">
                                {new Date(item.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </form>
                        ))}
                      </div>
                    </details>

                    {/* ACTION BUTTONS & FORMS */}
                    <div className="border-t border-warm-100 pt-3 flex flex-wrap items-center gap-3">
                      {/* VERIFY PAYMENT & ACTIVATE BUTTON (Always available when payment is pending or submitted) */}
                      {(req.status === "PAYMENT_PENDING" || req.paymentStatus === "PAYMENT_SUBMITTED" || req.status === "PENDING") && (
                        <details className="group">
                          <summary className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer list-none">
                            <ShieldCheck size={13} />
                            Verify Payment &amp; Activate Placement ✦
                          </summary>
                          <form action={handleVerifyPayment} className="mt-3 space-y-3 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-300">
                            <input type="hidden" name="sponsorshipId" value={req.id} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                                  Verified Transaction Ref / UTR *
                                </label>
                                <input
                                  type="text"
                                  name="transactionReference"
                                  defaultValue={req.paymentReference || ""}
                                  required
                                  placeholder="e.g. 423819283123 or PAYPAL-TXN-981"
                                  className="input-luxury w-full text-xs bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                                  Verified Amount ({symbol})
                                </label>
                                <input
                                  type="number"
                                  name="verifiedAmount"
                                  defaultValue={req.amount || 15000}
                                  className="input-luxury w-full text-xs bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                                  Payment Method
                                </label>
                                <select name="paymentMethod" defaultValue={req.paymentMethod || "UPI"} className="input-luxury w-full text-xs bg-white">
                                  <option value="UPI">UPI Transfer</option>
                                  <option value="PAYPAL">PayPal External</option>
                                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                                  <option value="CASH">Cash / Offline</option>
                                  <option value="WAIVED">Waived / Complimentary</option>
                                </select>
                              </div>
                            </div>

                            <input
                              type="text"
                              name="notes"
                              placeholder="Admin payment verification notes (e.g. Bank statement confirmed credited on 20 Aug)"
                              className="input-luxury w-full text-xs bg-white"
                            />

                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
                            >
                              <CheckCircle size={12} />
                              Confirm Verification &amp; Activate Priority Discovery
                            </button>
                          </form>
                        </details>
                      )}

                      {/* CONFIGURE PRICING & APPROVE (For PENDING) */}
                      {req.status === "PENDING" && (
                        <details className="group">
                          <summary className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer list-none">
                            <Tag size={12} /> Set Price &amp; Issue Payment Request
                          </summary>
                          <form action={handleApprove} className="mt-3 space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
                            <input type="hidden" name="requestId" value={req.id} />
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Promotion Tier</label>
                                <select name="promotionType" defaultValue={req.promotionType || "SPONSORED"} className="input-luxury w-full text-xs bg-white font-semibold">
                                  <option value="SPONSORED">✦ SPONSORED (#1)</option>
                                  <option value="FEATURED">★ FEATURED (#2)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Currency</label>
                                <select name="currency" defaultValue="INR" className="input-luxury w-full text-xs bg-white">
                                  <option value="INR">₹ INR</option>
                                  <option value="USD">$ USD</option>
                                  <option value="EUR">€ EUR</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Amount</label>
                                <input type="number" name="amount" defaultValue={req.proposedAmount || req.amount || 15000} className="input-luxury w-full text-xs" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Duration</label>
                                <select name="durationDays" defaultValue={req.durationDays || req.requestedDurationDays || 14} className="input-luxury w-full text-xs bg-white">
                                  <option value="7">7 Days</option>
                                  <option value="14">14 Days</option>
                                  <option value="30">30 Days</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Method</label>
                                <select name="paymentMethod" defaultValue="UPI" className="input-luxury w-full text-xs bg-white">
                                  <option value="UPI">UPI</option>
                                  <option value="PAYPAL">PayPal</option>
                                  <option value="BANK_TRANSFER">Bank Wire</option>
                                </select>
                              </div>
                            </div>
                            <textarea
                              name="adminNotes"
                              rows={2}
                              placeholder="Notes for host regarding pricing & payment"
                              className="input-luxury w-full text-xs resize-none"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Send Payment Instructions to Host
                            </button>
                          </form>
                        </details>
                      )}

                      {/* EDIT PARAMETERS DRAWER (Always available for admin adjustments) */}
                      <details className="group">
                        <summary className="inline-flex items-center gap-1 px-3 py-1.5 bg-warm-100 text-charcoal-800 text-xs font-bold rounded-xl hover:bg-warm-200 transition-colors cursor-pointer list-none">
                          <Settings size={12} /> Edit Parameters
                        </summary>
                        <form action={handleUpdateParameters} className="mt-3 space-y-3 p-4 bg-warm-50 rounded-2xl border border-warm-200 text-xs">
                          <input type="hidden" name="sponsorshipId" value={req.id} />
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Promotion Tier</label>
                              <select name="promotionType" defaultValue={req.promotionType || "SPONSORED"} className="input-luxury w-full text-xs bg-white font-semibold">
                                <option value="SPONSORED">✦ SPONSORED (#1 Top Priority)</option>
                                <option value="FEATURED">★ FEATURED (#2 Highlighted Ribbon)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Fee Amount</label>
                              <input type="number" name="amount" defaultValue={req.amount || 0} className="input-luxury w-full text-xs bg-white" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Duration (Days)</label>
                              <input type="number" name="durationDays" defaultValue={req.durationDays || req.requestedDurationDays || 7} className="input-luxury w-full text-xs bg-white" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Payment Status</label>
                              <select name="paymentStatus" defaultValue={req.paymentStatus || "PAYMENT_REQUESTED"} className="input-luxury w-full text-xs bg-white">
                                <option value="NOT_REQUESTED">NOT REQUESTED</option>
                                <option value="PAYMENT_REQUESTED">PAYMENT REQUESTED</option>
                                <option value="PAYMENT_SUBMITTED">PAYMENT SUBMITTED</option>
                                <option value="PAYMENT_VERIFIED">PAYMENT VERIFIED (ACTIVE)</option>
                                <option value="WAIVED">WAIVED / FREE</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Start Date</label>
                              <input type="datetime-local" name="startsAt" defaultValue={req.startsAt ? new Date(req.startsAt).toISOString().slice(0, 16) : ""} className="input-luxury w-full text-xs bg-white" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">End Date</label>
                              <input type="datetime-local" name="endsAt" defaultValue={req.endsAt ? new Date(req.endsAt).toISOString().slice(0, 16) : ""} className="input-luxury w-full text-xs bg-white" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase">Admin Notes</label>
                            <input type="text" name="adminNotes" defaultValue={req.adminNotes || ""} placeholder="Internal / Host notes..." className="input-luxury w-full text-xs bg-white" />
                          </div>
                          <button type="submit" className="px-4 py-2 bg-charcoal-900 text-white text-xs font-bold rounded-xl hover:bg-charcoal-800 transition-colors cursor-pointer">
                            Save Parameters &amp; Re-evaluate Placement
                          </button>
                        </form>
                      </details>

                      {/* REJECT REQUEST */}
                      {req.status === "PENDING" && (
                        <details className="group">
                          <summary className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer list-none flex items-center gap-1">
                            <XCircle size={12} /> Reject
                          </summary>
                          <form action={handleReject} className="mt-2 space-y-2 p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                            <input type="hidden" name="requestId" value={req.id} />
                            <input
                              type="text"
                              name="rejectionReason"
                              required
                              placeholder="Reason for declining request..."
                              className="input-luxury text-xs w-full"
                            />
                            <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors">
                              Confirm Reject
                            </button>
                          </form>
                        </details>
                      )}

                      {/* ACTIVE ACTIONS: EXTEND & REVOKE */}
                      {req.status === "ACTIVE" && (
                        <>
                          <details className="group">
                            <summary className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer list-none flex items-center gap-1">
                              <Sparkles size={12} /> Extend Duration
                            </summary>
                            <form action={handleExtend} className="mt-2 flex items-center gap-2">
                              <input type="hidden" name="sponsorshipId" value={req.id} />
                              <select name="extensionDays" defaultValue="7" className="input-luxury text-xs py-1 px-2">
                                <option value="7">+7 Days</option>
                                <option value="14">+14 Days</option>
                                <option value="30">+30 Days</option>
                              </select>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                              >
                                Extend
                              </button>
                            </form>
                          </details>

                          <details className="group">
                            <summary className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer list-none flex items-center gap-1">
                              <AlertTriangle size={12} /> Revoke Placement
                            </summary>
                            <form action={handleRevoke} className="mt-2 space-y-2">
                              <input type="hidden" name="sponsorshipId" value={req.id} />
                              <input
                                type="text"
                                name="reason"
                                required
                                placeholder="Mandatory revocation reason..."
                                className="input-luxury text-xs w-64"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
                              >
                                Confirm Revoke
                              </button>
                            </form>
                          </details>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

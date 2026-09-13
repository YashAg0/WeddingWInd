import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, WeddingStatus } from "@prisma/client";
import {
  adminDeleteWeddingAction,
  adminRestoreWeddingAction,
  adminToggleWeddingStatusAction,
  adminToggleWeddingFeaturedAction,
  adminToggleSponsoredAction,
} from "@/lib/actions/admin";
import {
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Star,
  Zap,
  FlaskConical,
  User as UserIcon,
  RotateCcw,
  Search,
  Sparkles,
  Archive,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminWeddingEditor } from "@/components/admin/AdminWeddingEditor";

export const dynamic = "force-dynamic";

function isSponsorshipActive(w: { sponsored: boolean; sponsorshipStart?: Date | null; sponsorshipEnd?: Date | null }) {
  if (!w.sponsored) return false;
  const now = new Date();
  if (w.sponsorshipStart && new Date(w.sponsorshipStart) > now) return false;
  if (w.sponsorshipEnd && new Date(w.sponsorshipEnd) <= now) return false;
  return true;
}

function getSponsorshipStatusLabel(w: { sponsored: boolean; sponsorshipStart?: Date | null; sponsorshipEnd?: Date | null }) {
  if (!w.sponsored) return null;
  const now = new Date();
  if (w.sponsorshipStart && new Date(w.sponsorshipStart) > now) {
    return {
      type: "scheduled",
      text: `Starts ${new Date(w.sponsorshipStart).toLocaleDateString()}`,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  if (w.sponsorshipEnd && new Date(w.sponsorshipEnd) <= now) {
    return {
      type: "expired",
      text: `Expired ${new Date(w.sponsorshipEnd).toLocaleDateString()}`,
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    };
  }
  if (w.sponsorshipEnd) {
    return {
      type: "active",
      text: `Active (Ends ${new Date(w.sponsorshipEnd).toLocaleDateString()})`,
      badgeClass: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
    };
  }
  return {
    type: "active",
    text: "Active (No Expiry)",
    badgeClass: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
  };
}

function getWeddingClassification(w: {
  isDemo: boolean;
  deletedAt: Date | null;
  slug: string;
  hostCouple?: { user?: { email?: string | null } | null } | null;
}) {
  const email = w.hostCouple?.user?.email || "";
  const isSeedOrE2E = email.includes("example.com") || email.includes("seed.") || email.includes("test.") || email.includes("e2e");
  const isE2ESlug = w.slug.startsWith("e2e-") || w.slug.includes("test-");

  if (w.deletedAt) {
    return {
      key: "archived",
      label: "Archived / Soft-Deleted",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
      icon: Archive,
    };
  }
  if (w.isDemo) {
    return {
      key: "demo",
      label: "Showcase Demo",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
      icon: FlaskConical,
    };
  }
  if (!isSeedOrE2E && !isE2ESlug) {
    return {
      key: "real_user",
      label: "Real User Submission",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold",
      icon: ShieldCheck,
    };
  }
  return {
    key: "test",
    label: "Test Fixture",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Sparkles,
  };
}

export default async function AdminWeddingsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; filter?: string; q?: string }>;
}) {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch Weddings and Couple options with bookings count
  const weddings = await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      gallery: true,
      events: true,
      traditions: true,
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED", "CHECKED_IN", "ATTENDED", "READY_FOR_EVENT"],
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const couples = await prisma.coupleProfile.findMany({
    include: { user: true },
  });

  // Resolve searchParams
  const params = await searchParams;
  const action = params.action;
  const editId = params.id;
  const activeFilter = params.filter || "all";
  const searchQuery = (params.q || "").trim().toLowerCase();

  let editWedding = null;
  if (action === "edit" && editId) {
    editWedding = weddings.find((w) => w.id === editId);
  }

  // Pre-calculate counts across all categories
  const countAllActive = weddings.filter((w) => !w.deletedAt).length;
  const countPublished = weddings.filter((w) => w.status === WeddingStatus.PUBLISHED && !w.deletedAt && !w.suspended).length;
  const countSubmissions = weddings.filter((w) => !w.deletedAt && getWeddingClassification(w).key === "real_user").length;
  const countDraft = weddings.filter((w) => w.status === WeddingStatus.DRAFT && !w.deletedAt).length;
  const countDemo = weddings.filter((w) => w.isDemo && !w.deletedAt).length;
  const countTest = weddings.filter((w) => getWeddingClassification(w).key === "test" && !w.deletedAt).length;
  const countArchived = weddings.filter((w) => !!w.deletedAt).length;
  const countFeatured = weddings.filter((w) => w.featured && !w.deletedAt).length;
  const countActiveSponsored = weddings.filter((w) => isSponsorshipActive(w) && !w.deletedAt).length;

  // Filter weddings
  let filteredWeddings = weddings.filter((w) => {
    // Archived filter shows only soft-deleted records
    if (activeFilter === "archived") {
      return !!w.deletedAt;
    }

    // All other filters exclude soft-deleted records by default
    if (w.deletedAt) return false;

    if (activeFilter === "published") {
      return w.status === WeddingStatus.PUBLISHED && !w.suspended;
    }
    if (activeFilter === "submissions") {
      return getWeddingClassification(w).key === "real_user";
    }
    if (activeFilter === "demo") {
      return w.isDemo;
    }
    if (activeFilter === "test") {
      return getWeddingClassification(w).key === "test";
    }
    if (activeFilter === "featured") {
      return w.featured;
    }
    if (activeFilter === "sponsored_active") {
      return isSponsorshipActive(w);
    }
    if (activeFilter === "sponsored_expired") {
      return w.sponsored && !isSponsorshipActive(w);
    }
    if (activeFilter === "draft") {
      return w.status === WeddingStatus.DRAFT;
    }

    // Default "all": all active, non-deleted weddings
    return true;
  });

  // Apply optional text search
  if (searchQuery) {
    filteredWeddings = filteredWeddings.filter((w) => {
      const title = (w.title || "").toLowerCase();
      const slug = (w.slug || "").toLowerCase();
      const location = (w.location || "").toLowerCase();
      const hostName = (w.hostCouple?.user?.name || "").toLowerCase();
      const hostEmail = (w.hostCouple?.user?.email || "").toLowerCase();
      return (
        title.includes(searchQuery) ||
        slug.includes(searchQuery) ||
        location.includes(searchQuery) ||
        hostName.includes(searchQuery) ||
        hostEmail.includes(searchQuery)
      );
    });
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteWeddingAction(id);
    redirect("/dashboard/admin/weddings");
  }

  async function handleRestore(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminRestoreWeddingAction(id);
    redirect("/dashboard/admin/weddings?filter=archived");
  }

  async function handleToggleStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const currentStatus = formData.get("status") as WeddingStatus;
    const nextStatus = currentStatus === WeddingStatus.PUBLISHED ? WeddingStatus.DRAFT : WeddingStatus.PUBLISHED;
    await adminToggleWeddingStatusAction(id, nextStatus);
    redirect("/dashboard/admin/weddings");
  }

  async function handleToggleFeatured(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const currentFeatured = formData.get("featured") === "true";
    await adminToggleWeddingFeaturedAction(id, !currentFeatured);
    redirect("/dashboard/admin/weddings");
  }

  async function handleToggleSponsored(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const currentSponsored = formData.get("sponsored") === "true";
    await adminToggleSponsoredAction(id, !currentSponsored);
    redirect("/dashboard/admin/weddings");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Wedding Directory &amp; Discovery Control Center
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Manage marketplace inventory, genuine host submissions, demo showcases, and soft-deleted archives.
          </p>
        </div>
        {!action && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/admin/weddings/sponsorship"
              className="inline-flex items-center gap-2 border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Zap size={14} className="text-amber-600" />
              Sponsorship Queue
            </Link>
            <Link
              href="/dashboard/admin/weddings?action=create"
              className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Create Celebration
            </Link>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      {!action && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warm-200 pb-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/admin/weddings"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeFilter === "all"
                    ? "bg-maroon-800 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                All Active ({countAllActive})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=published"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeFilter === "published"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                Live / Published ({countPublished})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=submissions"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeFilter === "submissions"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                <ShieldCheck size={13} />
                User Submissions ({countSubmissions})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=draft"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeFilter === "draft"
                    ? "bg-warm-700 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                Drafts ({countDraft})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=demo"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeFilter === "demo"
                    ? "bg-purple-700 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                <FlaskConical size={13} />
                Showcase Demos ({countDemo})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=featured"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeFilter === "featured"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                <Star size={12} className={activeFilter === "featured" ? "fill-white" : "text-amber-500"} />
                Featured ({countFeatured})
              </Link>
              <Link
                href="/dashboard/admin/weddings?filter=sponsored_active"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeFilter === "sponsored_active"
                    ? "bg-yellow-500 text-charcoal-900 shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                <Zap size={12} className={activeFilter === "sponsored_active" ? "fill-charcoal-900" : "text-amber-500"} />
                Sponsored ({countActiveSponsored})
              </Link>
              {countTest > 0 && (
                <Link
                  href="/dashboard/admin/weddings?filter=test"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeFilter === "test"
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                  }`}
                >
                  Test Fixtures ({countTest})
                </Link>
              )}
              <Link
                href="/dashboard/admin/weddings?filter=archived"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeFilter === "archived"
                    ? "bg-rose-800 text-white shadow-sm"
                    : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                }`}
              >
                <Archive size={12} />
                Archived / Deleted ({countArchived})
              </Link>
            </div>

            {/* Search input form */}
            <form method="GET" action="/dashboard/admin/weddings" className="relative shrink-0 w-full sm:w-64">
              <input type="hidden" name="filter" value={activeFilter} />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search weddings or host..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-warm-200 rounded-xl text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-maroon-700"
              />
            </form>
          </div>
        </div>
      )}

      {/* Interactive Collapsible Admin Editor */}
      {action && (
        <AdminWeddingEditor
          wedding={editWedding}
          couples={couples}
          isEdit={action === "edit"}
        />
      )}

      {/* Directory Grid */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-warm-100 pb-3">
          <h3 className="font-display font-bold text-base text-charcoal-900">
            Marketplace Weddings ({filteredWeddings.length})
          </h3>
          <span className="text-xs font-bold text-charcoal-400">
            Showing: {activeFilter.replace("_", " ").toUpperCase()} {searchQuery ? `(Query: "${searchQuery}")` : ""}
          </span>
        </div>

        {filteredWeddings.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400 font-semibold space-y-2">
            <p>No wedding experiences match the selected filter.</p>
            <Link href="/dashboard/admin/weddings" className="text-maroon-800 underline font-bold">
              View all active listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((w) => {
              const spStatus = getSponsorshipStatusLabel(w);
              const isSpActive = isSponsorshipActive(w);
              const bookedCount = w._count?.bookings || 0;
              const classification = getWeddingClassification(w);
              const ClassIcon = classification.icon;

              return (
                <div
                  key={w.id}
                  className={`border rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow ${
                    w.deletedAt ? "border-rose-200 bg-rose-50/20 opacity-80" : "border-warm-200/60 bg-warm-50/10"
                  }`}
                >
                  <div className="relative h-44 w-full bg-warm-200">
                    <Image src={w.mainImageUrl} alt={w.title} fill className="object-cover" />

                    {/* Classification Type Badge */}
                    <span
                      className={`absolute top-3 left-3 text-[0.625rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border shadow-sm ${
                        classification.badgeClass
                      }`}
                    >
                      <ClassIcon size={10} />
                      {classification.label}
                    </span>

                    {/* Featured Badge */}
                    {w.featured && (
                      <span className="absolute top-9 left-3 bg-amber-500 text-white font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Star size={10} className="fill-white" /> Featured
                      </span>
                    )}

                    {/* Sponsored Status Badge */}
                    {spStatus && (
                      <span
                        className={`absolute ${
                          w.featured ? "top-15" : "top-9"
                        } left-3 font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border shadow-sm ${
                          spStatus.badgeClass
                        }`}
                      >
                        <Zap size={10} className={isSpActive ? "fill-white" : ""} />
                        {spStatus.text}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded ${
                        w.deletedAt
                          ? "bg-rose-600 text-white"
                          : w.status === "PUBLISHED"
                          ? "bg-emerald-500 text-white"
                          : w.status === "COMPLETED"
                          ? "bg-charcoal-500 text-white"
                          : "bg-warm-500 text-white"
                      }`}
                    >
                      {w.deletedAt ? "ARCHIVED" : w.status}
                    </span>
                  </div>

                  <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-sm text-charcoal-900 line-clamp-1">{w.title}</h4>
                      <p className="text-charcoal-500 text-xs line-clamp-2 leading-relaxed">{w.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.6875rem] text-charcoal-600 font-medium">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-maroon-600 shrink-0" />
                        <span className="truncate">{w.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag size={12} className="text-maroon-600 shrink-0" />
                        <span className="truncate">{w.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} className="text-maroon-600 shrink-0" />
                        <span>{new Date(w.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-maroon-600 shrink-0" />
                        <span>
                          {bookedCount} / {w.capacity} Booked
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2 truncate text-charcoal-500">
                        <UserIcon size={12} className="text-charcoal-400 shrink-0" />
                        <span className="truncate">Host: {w.hostCouple?.user?.name || w.hostCouple?.user?.email || "Host"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2 truncate text-[0.625rem] text-charcoal-400">
                        <span>Tradition: {w.religion || "Hindu"}</span>
                        <span>•</span>
                        <span>Added: {new Date(w.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-warm-150 flex items-center justify-between">
                      <div>
                        <span className="font-display font-bold text-xs text-charcoal-900 block">
                          ${w.pricePerGuest ? w.pricePerGuest.toLocaleString() : 149} USD / guest
                        </span>
                        <span className="text-[0.625rem] text-charcoal-500 font-semibold">
                          {w.tier || "STANDARD"} • {w.durationDays || 3} {w.durationDays === 1 ? "Day" : "Days"}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {w.deletedAt ? (
                          /* Restore Action for Soft-Deleted Records */
                          <form action={handleRestore}>
                            <input type="hidden" name="id" value={w.id} />
                            <button
                              type="submit"
                              title="Restore Archived Wedding"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer flex items-center gap-1 text-xs font-bold"
                            >
                              <RotateCcw size={13} />
                              <span className="hidden sm:inline text-[10px]">Restore</span>
                            </button>
                          </form>
                        ) : (
                          <>
                            {/* Toggle publish status */}
                            <form action={handleToggleStatus}>
                              <input type="hidden" name="id" value={w.id} />
                              <input type="hidden" name="status" value={w.status} />
                              <button
                                type="submit"
                                title="Toggle Status (Publish/Draft)"
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  w.status === "PUBLISHED"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-warm-100 border-warm-200 text-charcoal-500 hover:bg-warm-200"
                                }`}
                              >
                                <CheckCircle size={13} />
                              </button>
                            </form>

                            {/* Toggle Featured */}
                            <form action={handleToggleFeatured}>
                              <input type="hidden" name="id" value={w.id} />
                              <input type="hidden" name="featured" value={w.featured ? "true" : "false"} />
                              <button
                                type="submit"
                                title={w.featured ? "Remove Featured" : "Mark as Featured"}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  w.featured
                                    ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100"
                                    : "bg-warm-100 border-warm-200 text-charcoal-500 hover:bg-warm-200"
                                }`}
                              >
                                <Star size={13} className={w.featured ? "fill-amber-500 text-amber-500" : ""} />
                              </button>
                            </form>

                            {/* Toggle Sponsored */}
                            <form action={handleToggleSponsored}>
                              <input type="hidden" name="id" value={w.id} />
                              <input type="hidden" name="sponsored" value={w.sponsored ? "true" : "false"} />
                              <button
                                type="submit"
                                title={w.sponsored ? "Deactivate Sponsored Campaign" : "Activate Sponsored Campaign"}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  w.sponsored
                                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                    : "bg-warm-100 border-warm-200 text-charcoal-500 hover:bg-warm-200"
                                }`}
                              >
                                <Zap size={13} className={w.sponsored ? "fill-amber-500 text-amber-500" : ""} />
                              </button>
                            </form>

                            {/* Edit */}
                            <Link
                              href={`/dashboard/admin/weddings?action=edit&id=${w.id}`}
                              className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                              title="Edit Wedding Details & Sponsorship Dates"
                            >
                              <Edit2 size={13} />
                            </Link>

                            {/* Delete / Archive */}
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={w.id} />
                              <button
                                type="submit"
                                title={bookedCount > 0 ? "Archive Wedding (Preserving Bookings)" : "Delete Celebration"}
                                className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </form>
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
    </div>
  );
}

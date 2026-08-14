import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, WeddingStatus } from "@prisma/client";
import {
  adminCreateWeddingAction,
  adminUpdateWeddingAction,
  adminDeleteWeddingAction,
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
  Clock,
  User as UserIcon,
  Flame,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function AdminWeddingsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; filter?: string }>;
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

  let editWedding = null;
  if (action === "edit" && editId) {
    editWedding = weddings.find((w) => w.id === editId);
  }

  // Filter weddings
  const filteredWeddings = weddings.filter((w) => {
    if (activeFilter === "featured") return w.featured;
    if (activeFilter === "sponsored_active") return isSponsorshipActive(w);
    if (activeFilter === "sponsored_expired") return w.sponsored && !isSponsorshipActive(w);
    if (activeFilter === "draft") return w.status === WeddingStatus.DRAFT;
    return true;
  });

  // Counts for tabs
  const countAll = weddings.length;
  const countFeatured = weddings.filter((w) => w.featured).length;
  const countActiveSponsored = weddings.filter((w) => isSponsorshipActive(w)).length;
  const countExpiredSponsored = weddings.filter((w) => w.sponsored && !isSponsorshipActive(w)).length;
  const countDraft = weddings.filter((w) => w.status === WeddingStatus.DRAFT).length;

  // 3. Define Server Actions for Form Submissions in Server Component
  async function handleSubmit(formData: FormData) {
    "use server";
    const wId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const religion = (formData.get("religion") as string) || "Hindu";
    const date = formData.get("date") as string;
    const pricePerGuest = parseFloat(formData.get("pricePerGuest") as string);
    const capacity = parseInt(formData.get("capacity") as string);
    const mainImageUrl = formData.get("mainImageUrl") as string;
    const hostCoupleId = formData.get("hostCoupleId") as string;
    const status = formData.get("status") as WeddingStatus;
    const featured = formData.get("featured") === "true";
    const sponsored = formData.get("sponsored") === "true";
    const sponsorshipStart = formData.get("sponsorshipStart") as string;
    const sponsorshipEnd = formData.get("sponsorshipEnd") as string;

    const payload = {
      title,
      description,
      location,
      category,
      religion,
      date,
      pricePerGuest,
      capacity,
      mainImageUrl,
      hostCoupleId,
      status,
      featured,
      sponsored,
      sponsorshipStart: sponsorshipStart ? sponsorshipStart : null,
      sponsorshipEnd: sponsorshipEnd ? sponsorshipEnd : null,
    };

    if (wId) {
      await adminUpdateWeddingAction(wId, payload);
    } else {
      await adminCreateWeddingAction(payload);
    }
    redirect("/dashboard/admin/weddings");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteWeddingAction(id);
    redirect("/dashboard/admin/weddings");
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
            Manage marketplace inventory, Featured showcases, time-aware Sponsored campaigns, and bookings.
          </p>
        </div>
        {!action && (
          <Link
            href="/dashboard/admin/weddings?action=create"
            className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Create Celebration
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      {!action && (
        <div className="flex flex-wrap gap-2 border-b border-warm-200 pb-3">
          <Link
            href="/dashboard/admin/weddings"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === "all"
                ? "bg-maroon-800 text-white shadow-sm"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            All Listings ({countAll})
          </Link>
          <Link
            href="/dashboard/admin/weddings?filter=featured"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === "sponsored_active"
                ? "bg-yellow-500 text-charcoal-900 shadow-sm"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            <Zap size={12} className={activeFilter === "sponsored_active" ? "fill-charcoal-900" : "text-amber-500"} />
            Active Sponsored ({countActiveSponsored})
          </Link>
          <Link
            href="/dashboard/admin/weddings?filter=sponsored_expired"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === "sponsored_expired"
                ? "bg-charcoal-700 text-white shadow-sm"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            <Clock size={12} />
            Expired Sponsored ({countExpiredSponsored})
          </Link>
          <Link
            href="/dashboard/admin/weddings?filter=draft"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === "draft"
                ? "bg-warm-600 text-white shadow-sm"
                : "bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
            }`}
          >
            Drafts ({countDraft})
          </Link>
        </div>
      )}

      {/* Form (Create / Edit Mode) */}
      {action && (
        <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-warm-100 pb-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              {action === "edit" ? `Edit "${editWedding?.title}"` : "Create Wedding Experience"}
            </h3>
            <Link
              href="/dashboard/admin/weddings"
              className="text-xs font-bold text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {editWedding && <input type="hidden" name="id" value={editWedding.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editWedding?.title || ""}
                  placeholder="e.g. Grand Maharaja Heritage Royal Wedding"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Main Image URL</label>
                <input
                  type="text"
                  name="mainImageUrl"
                  required
                  defaultValue={editWedding?.mainImageUrl || ""}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editWedding?.location || ""}
                  placeholder="e.g. Udaipur, Rajasthan"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Category</label>
                <select
                  name="category"
                  defaultValue={editWedding?.category || "Royal"}
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="Royal">Royal</option>
                  <option value="Beach">Beach</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Traditional">Traditional</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Destination">Destination</option>
                  <option value="Nature">Nature</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Religion / Tradition</label>
                <input
                  type="text"
                  name="religion"
                  required
                  defaultValue={editWedding?.religion || "Hindu"}
                  placeholder="e.g. Hindu (Mewari Rajput)"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Wedding Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editWedding?.date ? new Date(editWedding.date).toISOString().split("T")[0] : ""}
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Host Couple</label>
                <select
                  name="hostCoupleId"
                  defaultValue={editWedding?.hostCoupleId || ""}
                  required
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="" disabled>Select Host Couple</option>
                  {couples.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.name || c.user.email} (Expected: {c.expectedGuests})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Price per Guest ($)</label>
                <input
                  type="number"
                  name="pricePerGuest"
                  required
                  min="1"
                  defaultValue={editWedding?.pricePerGuest || 1000}
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Max Guest Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  required
                  min="1"
                  defaultValue={editWedding?.capacity || 100}
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Status</label>
                <select
                  name="status"
                  defaultValue={editWedding?.status || "DRAFT"}
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            {/* Discovery & Sponsorship Controls */}
            <div className="p-5 bg-warm-50/70 border border-warm-200/80 rounded-2xl space-y-4">
              <h4 className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-2">
                <Flame size={16} className="text-amber-500" />
                <span>Discovery, Featured &amp; Sponsorship Controls</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Featured Status</label>
                  <select
                    name="featured"
                    defaultValue={editWedding?.featured ? "true" : "false"}
                    className="input-luxury w-full bg-white select-reset"
                  >
                    <option value="false">Standard Listing (Featured OFF)</option>
                    <option value="true">Featured Listing (Featured ON)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Sponsored Campaign</label>
                  <select
                    name="sponsored"
                    defaultValue={editWedding?.sponsored ? "true" : "false"}
                    className="input-luxury w-full bg-white select-reset"
                  >
                    <option value="false">Organic Discovery (Sponsored OFF)</option>
                    <option value="true">Sponsored Priority Boost (Sponsored ON)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Sponsorship Start</label>
                  <input
                    type="date"
                    name="sponsorshipStart"
                    defaultValue={
                      editWedding?.sponsorshipStart
                        ? new Date(editWedding.sponsorshipStart).toISOString().split("T")[0]
                        : ""
                    }
                    className="input-luxury w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Sponsorship End</label>
                  <input
                    type="date"
                    name="sponsorshipEnd"
                    defaultValue={
                      editWedding?.sponsorshipEnd
                        ? new Date(editWedding.sponsorshipEnd).toISOString().split("T")[0]
                        : ""
                    }
                    className="input-luxury w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Description &amp; Story</label>
              <textarea
                name="description"
                rows={5}
                required
                defaultValue={editWedding?.description || ""}
                placeholder="Describe the cultural richness, key traditions, and hospitality provided..."
                className="input-luxury w-full p-4 h-auto"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-warm-100">
              <Link
                href="/dashboard/admin/weddings"
                className="px-5 py-2.5 rounded-xl border border-warm-200 text-charcoal-600 text-xs font-bold hover:bg-warm-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                Save Celebration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Grid */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-warm-100 pb-3">
          <h3 className="font-display font-bold text-base text-charcoal-900">
            Marketplace Weddings ({filteredWeddings.length})
          </h3>
          <span className="text-xs font-bold text-charcoal-400">
            Showing: {activeFilter.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {filteredWeddings.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-400 font-semibold space-y-2">
            <p>No wedding experiences match the selected filter.</p>
            <Link href="/dashboard/admin/weddings" className="text-maroon-800 underline font-bold">
              View all listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((w) => {
              const spStatus = getSponsorshipStatusLabel(w);
              const isSpActive = isSponsorshipActive(w);
              const bookedCount = w._count?.bookings || 0;

              return (
                <div
                  key={w.id}
                  className="border border-warm-200/60 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow bg-warm-50/10"
                >
                  <div className="relative h-44 w-full bg-warm-200">
                    <Image src={w.mainImageUrl} alt={w.title} fill className="object-cover" />
                    
                    {/* Featured Badge */}
                    {w.featured && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Star size={10} className="fill-white" /> Featured
                      </span>
                    )}

                    {/* Sponsored Status Badge */}
                    {spStatus && (
                      <span
                        className={`absolute ${
                          w.featured ? "top-8" : "top-3"
                        } left-3 font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border shadow-sm ${
                          spStatus.badgeClass
                        }`}
                      >
                        <Zap size={10} className={isSpActive ? "fill-white" : ""} />
                        {spStatus.text}
                      </span>
                    )}

                    {/* Demo Listing Badge */}
                    {w.isDemo && (
                      <span className="absolute bottom-3 left-3 bg-sky-500 text-white font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <FlaskConical size={10} /> Demo
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded ${
                        w.status === "PUBLISHED"
                          ? "bg-emerald-500 text-white"
                          : w.status === "COMPLETED"
                          ? "bg-charcoal-500 text-white"
                          : "bg-warm-500 text-white"
                      }`}
                    >
                      {w.status}
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
                      <span className="font-display font-bold text-xs text-charcoal-900">
                        ${w.pricePerGuest.toLocaleString()}/guest
                      </span>

                      <div className="flex gap-1">
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

                        {/* Delete */}
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={w.id} />
                          <button
                            type="submit"
                            title="Delete Celebration"
                            className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </form>
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

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, WeddingStatus } from "@prisma/client";
import {
  adminCreateWeddingAction,
  adminUpdateWeddingAction,
  adminDeleteWeddingAction,
  adminToggleWeddingStatusAction,
  adminToggleWeddingFeaturedAction,
} from "@/lib/actions/admin";
import { Calendar as CalendarIcon, MapPin, Tag, Users, Shield, Plus, Edit2, Trash2, CheckCircle, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminWeddingsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>;
}) {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch Weddings and Couple options
  const weddings = await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      gallery: true,
      events: true,
      traditions: true,
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

  let editWedding = null;
  if (action === "edit" && editId) {
    editWedding = weddings.find((w) => w.id === editId);
  }

  // 3. Define Server Actions for Form Submissions in Server Component
  async function handleSubmit(formData: FormData) {
    "use server";
    const wId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const date = formData.get("date") as string;
    const pricePerGuest = parseFloat(formData.get("pricePerGuest") as string);
    const capacity = parseInt(formData.get("capacity") as string);
    const mainImageUrl = formData.get("mainImageUrl") as string;
    const hostCoupleId = formData.get("hostCoupleId") as string;
    const status = formData.get("status") as WeddingStatus;
    const featured = formData.get("featured") === "true";

    const payload = {
      title,
      description,
      location,
      category,
      date,
      pricePerGuest,
      capacity,
      mainImageUrl,
      hostCoupleId,
      status,
      featured,
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Wedding Directory Management
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Draft, publish, feature, or manage capacities of global listings.
          </p>
        </div>
        {!action && (
          <Link
            href="/dashboard/admin/weddings?action=create"
            className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Create Listing
          </Link>
        )}
      </div>

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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <option value="Beachside">Beachside</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Temple">Temple</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editWedding?.date ? new Date(editWedding.date).toISOString().split("T")[0] : ""}
                  className="input-luxury w-full"
                />
              </div>

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
                      {c.user.name || c.user.email} (Guests: {c.expectedGuests})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Featured</label>
                <select
                  name="featured"
                  defaultValue={editWedding?.featured ? "true" : "false"}
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="false">Standard Listing</option>
                  <option value="true">Featured Listing</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Description</label>
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
                Save Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Grid */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
          All Weddings ({weddings.length})
        </h3>
        {weddings.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            No wedding experiences are cataloged in the system.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((w) => (
              <div key={w.id} className="border border-warm-200/60 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow bg-warm-50/10">
                <div className="relative h-44 w-full bg-warm-200">
                  <Image src={w.mainImageUrl} alt={w.title} fill className="object-cover" />
                  {w.featured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[0.625rem] px-2 py-0.5 rounded uppercase tracking-wider">
                      ★ Featured
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded ${
                    w.status === "PUBLISHED" ? "bg-emerald-500 text-white" : w.status === "COMPLETED" ? "bg-charcoal-500 text-white" : "bg-warm-500 text-white"
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-sm text-charcoal-900 line-clamp-1">{w.title}</h4>
                    <p className="text-charcoal-500 text-xs line-clamp-2 leading-relaxed">{w.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[0.6875rem] text-charcoal-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-maroon-600" />
                      <span>{w.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} className="text-maroon-600" />
                      <span>{w.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={12} className="text-maroon-600" />
                      <span>{new Date(w.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-maroon-600" />
                      <span>Cap: {w.capacity}</span>
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
                            w.status === "PUBLISHED" ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" : "bg-warm-100 border-warm-200 text-charcoal-500 hover:bg-warm-200"
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
                          title="Toggle Featured"
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            w.featured ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" : "bg-warm-100 border-warm-200 text-charcoal-500 hover:bg-warm-200"
                          }`}
                        >
                          ★
                        </button>
                      </form>

                      {/* Edit */}
                      <Link
                        href={`/dashboard/admin/weddings?action=edit&id=${w.id}`}
                        className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                        title="Edit Wedding"
                      >
                        <Edit2 size={13} />
                      </Link>

                      {/* Delete */}
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={w.id} />
                        <button
                          type="submit"
                          title="Delete Listing"
                          className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

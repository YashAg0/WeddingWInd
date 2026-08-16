import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { createWedding, editWedding, deleteWedding, getMyWeddings, requestSponsorshipAction, cancelSponsorshipRequestAction } from "@/lib/actions";
import {
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Users,
  Plus,
  Edit2,
  Trash2,
  Palette,
  Globe2,
  Eye,
  Sparkles,
  Zap,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoupleListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>;
}) {
  // Only host couples may manage their own Our Indian Weddings.
  await requireRole([UserRole.COUPLE]);

  const weddings = await getMyWeddings();

  const params = await searchParams;
  const action = params.action;
  const editId = params.id;

  const editListing = action === "edit" && editId ? weddings.find((w) => w.id === editId) : null;

  async function handleSubmit(formData: FormData) {
    "use server";
    const wId = formData.get("id") as string;
    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      date: formData.get("date") as string,
      pricePerGuest: formData.get("pricePerGuest") as string,
      capacity: formData.get("capacity") as string,
      requiredGuests: formData.get("requiredGuests") as string,
      theme: formData.get("theme") as string,
      dressCode: formData.get("dressCode") as string,
      ethnicity: formData.get("ethnicity") as string,
      mainImageUrl: formData.get("mainImageUrl") as string,
      status: formData.get("status") as string,
    };

    if (wId) {
      await editWedding(wId, payload);
    } else {
      await createWedding(payload);
    }
    redirect("/dashboard/listings");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteWedding(id);
    redirect("/dashboard/listings");
  }

  async function handleRequestSponsorship(formData: FormData) {
    "use server";
    const weddingId = formData.get("weddingId") as string;
    const message = (formData.get("message") as string) || undefined;
    const budget = (formData.get("budget") as string) || undefined;
    await requestSponsorshipAction({ weddingId, message, budget });
    redirect("/dashboard/listings");
  }

  async function handleCancelSponsorshipRequest(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    await cancelSponsorshipRequestAction(requestId);
    redirect("/dashboard/listings");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            My Our Indian Weddings
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Create and publish your wedding experiences for travelers to discover and register.
          </p>
        </div>
        {!action && (
          <Link
            href="/dashboard/listings?action=create"
            className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            List a Wedding
          </Link>
        )}
      </div>

      {/* Form (Create / Edit Mode) */}
      {action && (
        <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-warm-100 pb-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              {editListing ? `Edit "${editListing.title}"` : "List a New Wedding"}
            </h3>
            <Link
              href="/dashboard/listings"
              className="text-xs font-bold text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {editListing && <input type="hidden" name="id" value={editListing.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Wedding Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  minLength={5}
                  defaultValue={editListing?.title || ""}
                  placeholder="e.g. Grand Rajasthani Royal Wedding"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Main Image URL</label>
                <input
                  type="url"
                  name="mainImageUrl"
                  required
                  defaultValue={editListing?.mainImageUrl || ""}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editListing?.location || ""}
                  placeholder="e.g. Udaipur, Rajasthan"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Category</label>
                <select
                  name="category"
                  defaultValue={editListing?.category || "Royal"}
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="Royal">Royal</option>
                  <option value="Beachside">Beachside</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Temple">Temple</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Destination">Destination</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Wedding Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editListing?.date ? new Date(editListing.date).toISOString().split("T")[0] : ""}
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Charges / Price per Guest ($)</label>
                <input
                  type="number"
                  name="pricePerGuest"
                  required
                  min="1"
                  step="0.01"
                  defaultValue={editListing?.pricePerGuest ?? 1000}
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
                  defaultValue={editListing?.capacity ?? 100}
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Required Guests</label>
                <input
                  type="number"
                  name="requiredGuests"
                  min="0"
                  defaultValue={editListing?.requiredGuests ?? 0}
                  placeholder="Minimum guests wanted"
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Theme</label>
                <input
                  type="text"
                  name="theme"
                  defaultValue={editListing?.theme || ""}
                  placeholder="e.g. Royal Heritage & Gold"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Dress Code</label>
                <input
                  type="text"
                  name="dressCode"
                  defaultValue={editListing?.dressCode || ""}
                  placeholder="e.g. Traditional Indian / Festive"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Ethnicity / Culture</label>
                <input
                  type="text"
                  name="ethnicity"
                  defaultValue={editListing?.ethnicity || ""}
                  placeholder="e.g. Rajput, Punjabi, Tamil"
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Visibility Status</label>
                <select
                  name="status"
                  defaultValue={editListing?.status || "PUBLISHED"}
                  className="input-luxury w-full bg-white select-reset"
                >
                  <option value="PUBLISHED">Published (visible to travelers)</option>
                  <option value="DRAFT">Draft (hidden)</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                rows={5}
                required
                minLength={20}
                defaultValue={editListing?.description || ""}
                placeholder="Describe your wedding, the cultural richness, key traditions, and hospitality provided..."
                className="input-luxury w-full p-4 h-auto"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-warm-100">
              <Link
                href="/dashboard/listings"
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

      {/* Celebrations Grid */}
      <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
          Your Weddings ({weddings.length})
        </h3>
        {weddings.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
            You haven&apos;t listed any weddings yet. Click &ldquo;List a Wedding&rdquo; to create your first experience.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((w) => (
              <div key={w.id} className="border border-warm-200/60 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow bg-warm-50/10">
                <div className="relative h-44 w-full bg-warm-200">
                  <Image src={w.mainImageUrl} alt={w.title} fill className="object-cover" />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {w.sponsored && (
                      <span className="text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 flex items-center gap-1">
                        <Sparkles size={9} />
                        Sponsored
                      </span>
                    )}
                    {w.featured && !w.sponsored && (
                      <span className="text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-brand-primary)] text-white">
                        Featured
                      </span>
                    )}
                    <span className={`text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded ${
                      w.status === "PUBLISHED" ? "bg-emerald-500 text-white" : w.status === "COMPLETED" ? "bg-charcoal-500 text-white" : "bg-warm-500 text-white"
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-sm text-charcoal-900 line-clamp-1">{w.title}</h4>
                    <p className="text-charcoal-500 text-xs line-clamp-2 leading-relaxed">{w.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.6875rem] text-charcoal-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-maroon-600" />
                      <span className="line-clamp-1">{w.location}</span>
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
                      <span>{w.confirmedGuests}/{w.capacity} guests</span>
                    </div>
                    {w.theme && (
                      <div className="flex items-center gap-1.5">
                        <Palette size={12} className="text-maroon-600" />
                        <span className="line-clamp-1">{w.theme}</span>
                      </div>
                    )}
                    {w.ethnicity && (
                      <div className="flex items-center gap-1.5">
                        <Globe2 size={12} className="text-maroon-600" />
                        <span className="line-clamp-1">{w.ethnicity}</span>
                      </div>
                    )}
                  </div>

                  {/* Sponsorship Status Row */}
                  {w.status === "PUBLISHED" && (
                    <div className="pt-2 border-t border-warm-100">
                      {w.sponsored ? (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
                          <Sparkles size={12} className="text-amber-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.625rem] font-bold text-amber-800 uppercase tracking-wide">Sponsored Listing Active</p>
                            {w.sponsorshipEnd && (
                              <p className="text-[0.5625rem] text-amber-700">
                                Expires {new Date(w.sponsorshipEnd).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : w.pendingSponsorshipRequest ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-200">
                            <Clock size={12} className="text-blue-600 flex-shrink-0" />
                            <p className="text-[0.625rem] font-bold text-blue-800">Sponsorship request pending review</p>
                          </div>
                          <form action={handleCancelSponsorshipRequest}>
                            <input type="hidden" name="requestId" value={w.pendingSponsorshipRequest.id} />
                            <button
                              type="submit"
                              className="text-[0.5625rem] font-semibold text-charcoal-500 hover:text-rose-600 underline underline-offset-2 transition-colors w-full text-left cursor-pointer"
                            >
                              Cancel request
                            </button>
                          </form>
                        </div>
                      ) : (
                        <details className="group">
                          <summary className="flex items-center gap-1.5 cursor-pointer text-[0.625rem] font-bold text-[var(--color-brand-secondary)] hover:text-amber-600 transition-colors list-none">
                            <Zap size={11} />
                            Request marketplace sponsorship
                          </summary>
                          <form action={handleRequestSponsorship} className="mt-2 space-y-2">
                            <input type="hidden" name="weddingId" value={w.id} />
                            <textarea
                              name="message"
                              rows={2}
                              placeholder="Why would sponsorship benefit your listing? (optional)"
                              className="w-full text-[0.6875rem] border border-warm-200 rounded-xl px-3 py-2 text-charcoal-700 bg-white resize-none focus:outline-none focus:border-maroon-300"
                            />
                            <input
                              type="text"
                              name="budget"
                              placeholder="Preferred sponsorship budget (optional)"
                              className="w-full text-[0.6875rem] border border-warm-200 rounded-xl px-3 py-2 text-charcoal-700 bg-white focus:outline-none focus:border-maroon-300"
                            />
                            <button
                              type="submit"
                              className="w-full text-[0.625rem] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              Submit Request
                            </button>
                          </form>
                        </details>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-warm-150 flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-charcoal-900">
                      ${w.pricePerGuest.toLocaleString()}/guest
                    </span>

                    <div className="flex gap-1">
                      {/* View public celebration */}
                      <Link
                        href={`/weddings/${w.slug}`}
                        className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                        title="View public celebration"
                      >
                        <Eye size={13} />
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/dashboard/listings?action=edit&id=${w.id}`}
                        className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                        title="Edit celebration"
                      >
                        <Edit2 size={13} />
                      </Link>

                      {/* Delete */}
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={w.id} />
                        <button
                          type="submit"
                          title="Delete celebration"
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

import { getDbUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  createWedding,
  editWedding,
  deleteWedding,
  getMyWeddings,
  requestSponsorshipAction,
  cancelSponsorshipRequestAction,
  submitHostPaymentProofAction,
  getSponsorshipPaymentConfigAction,
} from "@/lib/actions";
import {
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  Zap,
  Clock,
  QrCode,
  CreditCard,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoupleListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; checkout?: string }>;
}) {
  // Only host couples may manage their own listings
  const user = await getDbUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== UserRole.COUPLE) {
    redirect("/dashboard");
  }

  const [weddings, paymentConfig] = await Promise.all([
    getMyWeddings(),
    getSponsorshipPaymentConfigAction(),
  ]);

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
    const promotionType = (formData.get("promotionType") as "SPONSORED" | "FEATURED") || "SPONSORED";
    const message = (formData.get("message") as string) || undefined;
    const proposedAmountStr = (formData.get("proposedAmount") as string) || (formData.get("budget") as string) || undefined;
    const proposedAmount = proposedAmountStr ? parseFloat(proposedAmountStr) : undefined;
    const budget = proposedAmountStr;
    const requestedDurationDays = Number(formData.get("requestedDurationDays") || 7);
    await requestSponsorshipAction({
      weddingId,
      promotionType,
      message,
      budget,
      proposedAmount,
      requestedDurationDays,
    });
    redirect("/dashboard/listings");
  }

  async function handleCancelSponsorshipRequest(formData: FormData) {
    "use server";
    const requestId = formData.get("requestId") as string;
    await cancelSponsorshipRequestAction(requestId);
    redirect("/dashboard/listings");
  }

  async function handleHostSubmitProof(formData: FormData) {
    "use server";
    const sponsorshipId = formData.get("sponsorshipId") as string;
    const transactionReference = formData.get("transactionReference") as string;
    const paymentProofUrl = (formData.get("paymentProofUrl") as string) || undefined;
    const paymentNotes = (formData.get("paymentNotes") as string) || undefined;

    await submitHostPaymentProofAction({
      sponsorshipId,
      transactionReference,
      paymentProofUrl,
      paymentNotes,
    });
    redirect("/dashboard/listings");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            My Wedding Experiences
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
                  placeholder="e.g. Royal Heritage"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Dress Code</label>
                <input
                  type="text"
                  name="dressCode"
                  defaultValue={editListing?.dressCode || ""}
                  placeholder="e.g. Traditional Festive / Formal"
                  className="input-luxury w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Ethnicity / Tradition</label>
                <input
                  type="text"
                  name="ethnicity"
                  defaultValue={editListing?.ethnicity || ""}
                  placeholder="e.g. Marwari / North Indian"
                  className="input-luxury w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Full Story &amp; Description</label>
              <textarea
                name="description"
                rows={4}
                required
                defaultValue={editListing?.description || ""}
                placeholder="Share your wedding story, key ceremonies, and what guests can look forward to..."
                className="input-luxury w-full resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Listing Status</label>
              <select
                name="status"
                defaultValue={editListing?.status || "PUBLISHED"}
                className="input-luxury w-full bg-white select-reset"
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="PUBLISHED">Published (Discoverable on Marketplace)</option>
                <option value="COMPLETED">Completed / Past Event</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4 border-t border-warm-100">
              <button
                type="submit"
                className="bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                {editListing ? "Save Changes" : "Publish Wedding"}
              </button>
              <Link
                href="/dashboard/listings"
                className="px-6 py-3 rounded-xl text-xs font-bold text-charcoal-500 hover:text-charcoal-700 hover:bg-warm-100 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Listings Collection */}
      <div className="space-y-4">
        {weddings.length === 0 ? (
          <div className="bg-white border border-warm-200/50 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto text-charcoal-400">
              <CalendarIcon size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-charcoal-900">No wedding listings yet</h3>
              <p className="text-charcoal-500 text-xs max-w-sm mx-auto">
                Create your first wedding experience to welcome verified international travelers.
              </p>
            </div>
            <Link
              href="/dashboard/listings?action=create"
              className="inline-flex items-center gap-2 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              List Your Wedding
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((w) => {
              const req = w.latestSponsorshipRequest;
              const isINR = req?.currency === "INR";
              const symbol = isINR ? "₹" : "$";
              const upiId = paymentConfig.upiId;
              const upiPayLink = paymentConfig.upiPaymentLink || (upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(paymentConfig.upiName || "WeddingWithIndia")}&cu=INR` : null);
              const paypalLink = paymentConfig.paypalPaymentLink;

              return (
                <div key={w.id} className="border border-warm-200/60 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                  <div className="relative h-44 w-full bg-warm-200">
                    <Image src={w.mainImageUrl} alt={w.title} fill className="object-cover" />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {w.sponsored && (
                        <span className="text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 flex items-center gap-1 shadow-xs">
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
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm text-charcoal-900 line-clamp-1">{w.title}</h4>
                      <p className="text-charcoal-500 text-xs line-clamp-2 leading-relaxed">{w.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[0.6875rem] text-charcoal-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-maroon-600 flex-shrink-0" />
                        <span className="line-clamp-1">{w.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-maroon-600 flex-shrink-0" />
                        <span>{w.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} className="text-maroon-600 flex-shrink-0" />
                        <span>{new Date(w.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-maroon-600 flex-shrink-0" />
                        <span>{w.confirmedGuests}/{w.capacity} guests</span>
                      </div>
                    </div>

                    {/* Sponsorship & Promotion Section */}
                    {w.status === "PUBLISHED" && (
                      <div className="pt-3 border-t border-warm-100 space-y-2">
                        {w.sponsored ? (
                          /* ACTIVE SPONSORSHIP (#1) */
                          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-300 shadow-xs">
                            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700">
                              <Sparkles size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.6875rem] font-bold text-amber-950 uppercase tracking-wide">
                                ✦ Sponsored Placement Active (#1)
                              </p>
                              {w.sponsorshipEnd && (
                                <p className="text-[0.625rem] text-amber-800 font-medium mt-0.5">
                                  Top priority through {new Date(w.sponsorshipEnd).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : w.featured ? (
                          /* ACTIVE FEATURED (#2) */
                          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
                            <div className="p-1.5 rounded-xl bg-rose-100 text-[var(--color-brand-primary)]">
                              <Zap size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.6875rem] font-bold text-rose-950 uppercase tracking-wide">
                                ★ Featured Placement Active (#2)
                              </p>
                              <p className="text-[0.625rem] text-rose-700 font-medium mt-0.5">
                                Highlighted placement above standard listings
                              </p>
                            </div>
                          </div>
                        ) : req?.paymentStatus === "PAYMENT_SUBMITTED" ? (
                          /* PAYMENT SUBMITTED - PENDING ADMIN VERIFICATION */
                          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2 text-amber-900">
                              <Clock size={15} className="text-amber-600 animate-pulse flex-shrink-0" />
                              <span className="text-xs font-bold">{req.promotionType || "SPONSORED"} Payment Under Verification</span>
                            </div>
                            <p className="text-[0.6875rem] text-amber-800 leading-relaxed">
                              We received your transaction reference <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">{req.paymentReference}</code>. Our team will verify it shortly and activate your priority placement.
                            </p>
                          </div>
                        ) : req?.status === "PAYMENT_PENDING" ? (
                          /* PAYMENT PENDING - INSTRUCTIONS & SUBMISSION FORM */
                          <div className="p-4 bg-warm-50 border border-warm-200/80 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                  {req.promotionType || "Sponsorship"} Approved
                                </span>
                                <p className="text-xs font-bold text-charcoal-900 mt-1">
                                  {symbol}{req.amount?.toLocaleString()} for {req.durationDays} Days Priority
                                </p>
                              </div>
                            </div>

                            {req.adminNotes && (
                              <p className="text-[0.6875rem] text-charcoal-600 italic bg-white p-2 rounded-xl border border-warm-200/50">
                                &ldquo;{req.adminNotes}&rdquo;
                              </p>
                            )}

                            {/* Payment Method Instructions */}
                            {(req.paymentMethod === "UPI" || (!req.paymentMethod && isINR)) ? (
                              <div className="space-y-2 bg-white p-3 rounded-xl border border-warm-200/70 text-xs">
                                <div className="flex items-center justify-between font-bold text-charcoal-900 text-[0.6875rem] uppercase">
                                  <span className="flex items-center gap-1">
                                    <QrCode size={13} className="text-amber-600" /> Pay via UPI
                                  </span>
                                  <span className="text-emerald-700 font-extrabold">{symbol}{req.amount?.toLocaleString()}</span>
                                </div>

                                {upiId ? (
                                  <>
                                    {paymentConfig.upiQrImageUrl && (
                                      <div className="flex justify-center my-2">
                                        <Image
                                          src={paymentConfig.upiQrImageUrl}
                                          alt="UPI QR Code"
                                          width={140}
                                          height={140}
                                          className="rounded-xl border border-warm-200"
                                        />
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 border border-warm-200 text-[0.6875rem]">
                                      <span className="text-charcoal-600 font-medium">UPI ID:</span>
                                      <code className="font-mono font-bold text-charcoal-900 select-all">{upiId}</code>
                                    </div>

                                    {upiPayLink && (
                                      <a
                                        href={upiPayLink}
                                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                                      >
                                        <ExternalLink size={12} />
                                        Open UPI App to Pay
                                      </a>
                                    )}
                                  </>
                                ) : (
                                  <div className="p-2.5 rounded-lg bg-warm-50 border border-warm-200 text-[0.6875rem] text-charcoal-600 leading-relaxed">
                                    Official UPI transfer instructions will be provided by your concierge. Once completed, submit your 12-digit UTR below.
                                  </div>
                                )}

                                <p className="text-[0.625rem] text-charcoal-500 leading-tight">
                                  {paymentConfig.upiInstructions || "Scan QR or transfer to UPI ID, then enter your 12-digit UTR below."}
                                </p>
                              </div>
                            ) : req.paymentMethod === "PAYPAL" ? (
                              <div className="space-y-2 bg-white p-3 rounded-xl border border-warm-200/70 text-xs">
                                <div className="flex items-center justify-between font-bold text-charcoal-900 text-[0.6875rem] uppercase">
                                  <span className="flex items-center gap-1">
                                    <CreditCard size={13} className="text-blue-600" /> PayPal Payment
                                  </span>
                                  <span className="text-emerald-700 font-extrabold">{symbol}{req.amount?.toLocaleString()}</span>
                                </div>

                                {paypalLink ? (
                                  <a
                                    href={paypalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                  >
                                    <ExternalLink size={12} />
                                    Pay Securely via PayPal
                                  </a>
                                ) : (
                                  <div className="p-2.5 rounded-lg bg-warm-50 border border-warm-200 text-[0.6875rem] text-charcoal-600 leading-relaxed">
                                    PayPal transfer instructions will be provided by your concierge. Once paid, submit your transaction ID below.
                                  </div>
                                )}

                                <p className="text-[0.625rem] text-charcoal-500 leading-tight">
                                  {paymentConfig.paypalInstructions || "Complete transfer on PayPal and submit your transaction ID below."}
                                </p>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-white rounded-xl border border-warm-200 text-[0.6875rem] text-charcoal-700">
                                {paymentConfig.bankTransferInstructions || "Please complete bank transfer and submit transaction reference below."}
                              </div>
                            )}

                            {/* Payment Confirmation Submission Form */}
                            <form action={handleHostSubmitProof} className="space-y-2 pt-2 border-t border-warm-200/60">
                              <input type="hidden" name="sponsorshipId" value={req.id} />
                              <div>
                                <label className="text-[0.625rem] font-bold text-charcoal-700 uppercase block mb-1">
                                  Transaction Reference / UTR Number *
                                </label>
                                <input
                                  type="text"
                                  name="transactionReference"
                                  required
                                  placeholder="e.g. 423981293812 or TXN-9812"
                                  className="input-luxury w-full text-xs bg-white py-1.5"
                                />
                              </div>

                              <div>
                                <label className="text-[0.625rem] font-bold text-charcoal-700 uppercase block mb-1">
                                  Payment Screenshot / Proof Link (Optional)
                                </label>
                                <input
                                  type="text"
                                  name="paymentProofUrl"
                                  placeholder="https://... (optional receipt link)"
                                  className="input-luxury w-full text-xs bg-white py-1.5"
                                />
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  type="submit"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
                                >
                                  <CheckCircle size={12} />
                                  I&apos;ve Completed Payment
                                </button>
                              </div>
                            </form>

                            <form action={handleCancelSponsorshipRequest} className="text-right">
                              <input type="hidden" name="requestId" value={req.id} />
                              <button
                                type="submit"
                                className="text-[0.5625rem] font-semibold text-charcoal-400 hover:text-rose-600 underline cursor-pointer"
                              >
                                Cancel Request
                              </button>
                            </form>
                          </div>
                        ) : req?.status === "PENDING" ? (
                          /* PENDING ADMIN REVIEW */
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                              <Clock size={14} className="text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-blue-950 text-[0.6875rem]">{req.promotionType || "Sponsorship"} Review Pending</p>
                                <p className="text-[0.5625rem] text-blue-700 mt-0.5">Admins will review your celebration and send payment instructions.</p>
                              </div>
                            </div>
                            <form action={handleCancelSponsorshipRequest}>
                              <input type="hidden" name="requestId" value={req.id} />
                              <button
                                type="submit"
                                className="text-[0.5625rem] font-semibold text-charcoal-500 hover:text-rose-600 underline underline-offset-2 transition-colors w-full text-left cursor-pointer"
                              >
                                Cancel request
                              </button>
                            </form>
                          </div>
                        ) : (
                          /* REQUEST PROMOTION ACCORDION */
                          <details className="group">
                            <summary className="flex items-center gap-1.5 cursor-pointer text-[0.6875rem] font-bold text-[var(--color-brand-secondary)] hover:text-amber-600 transition-colors list-none">
                              <Zap size={12} />
                              Promote This Wedding Experience
                            </summary>
                            <form action={handleRequestSponsorship} className="mt-2.5 space-y-2.5 p-3.5 bg-warm-50/70 rounded-2xl border border-warm-200/60">
                              <input type="hidden" name="weddingId" value={w.id} />

                              <div className="space-y-1">
                                <label className="text-[0.5625rem] font-bold text-charcoal-600 uppercase tracking-wide">
                                  Promotion Type
                                </label>
                                <select
                                  name="promotionType"
                                  defaultValue="SPONSORED"
                                  className="w-full text-xs border border-warm-200 rounded-xl px-2.5 py-1.5 text-charcoal-700 bg-white font-semibold"
                                >
                                  <option value="SPONSORED">✦ Sponsored Placement (#1 Top Priority &amp; Gold Animated Frame)</option>
                                  <option value="FEATURED">★ Featured Placement (#2 Highlighted Ribbon Above Standard)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.5625rem] font-bold text-charcoal-600 uppercase tracking-wide">
                                  Placement Duration
                                </label>
                                <select
                                  name="requestedDurationDays"
                                  defaultValue="14"
                                  className="w-full text-xs border border-warm-200 rounded-xl px-2.5 py-1.5 text-charcoal-700 bg-white"
                                >
                                  <option value="7">7 Days Placement</option>
                                  <option value="14">14 Days Placement (Recommended)</option>
                                  <option value="30">30 Days Placement (Full Season)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.5625rem] font-bold text-charcoal-600 uppercase tracking-wide">
                                  Proposed Budget / Amount (Optional)
                                </label>
                                <input
                                  type="number"
                                  name="proposedAmount"
                                  placeholder="e.g. 5000 (INR) or 100 (USD)"
                                  className="w-full text-xs border border-warm-200 rounded-xl px-2.5 py-1.5 text-charcoal-700 bg-white"
                                />
                              </div>

                              <textarea
                                name="message"
                                rows={2}
                                placeholder="Why would promotion benefit your celebration? (optional)"
                                className="w-full text-xs border border-warm-200 rounded-xl px-2.5 py-1.5 text-charcoal-700 bg-white resize-none focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="submit"
                                className="w-full text-[0.625rem] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal-950 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                              >
                                Submit Promotion Request
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
                        <Link
                          href={`/weddings/${w.slug}`}
                          className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                          title="View public celebration"
                        >
                          <Eye size={13} />
                        </Link>

                        <Link
                          href={`/dashboard/listings?action=edit&id=${w.id}`}
                          className="p-1.5 rounded-lg border border-warm-200 bg-white text-charcoal-600 hover:bg-warm-50"
                          title="Edit celebration"
                        >
                          <Edit2 size={13} />
                        </Link>

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

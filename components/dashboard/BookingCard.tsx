"use client";


import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth, Booking } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { MapPin, Calendar, Users, XCircle, Printer, CreditCard, Receipt, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "@/lib/actions/reviews";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const { formatPrice } = useCurrency();
  const { checkoutBooking, user } = useAuth();
  const [showInvoice, setShowInvoice] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState({
    ratingFood: 5,
    ratingHospitality: 5,
    ratingExperience: 5,
    ratingCulture: 5,
    ratingSafety: 5,
    ratingAccommodation: 5
  });

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await submitReviewAction({
        bookingId: booking.id,
        rating,
        comment,
        ...categoryRatings
      });
      toast.success(`Review submitted successfully! Status: ${res.status}`);
      setShowReviewModal(false);
      setComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    const url = await checkoutBooking(booking.id);
    if (url) {
      window.location.href = url;
    } else {
      toast.error("Failed to initiate payment checkout. Please verify Stripe configuration.");
      setPaying(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case "cancelled":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">
            Cancelled
          </span>
        );
      case "rejected":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md border border-orange-100">
            Declined
          </span>
        );
      case "awaiting_payment":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md border border-amber-200 animate-pulse">
            Awaiting Payment
          </span>
        );
      case "approved":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 px-2.5 py-1 rounded-md border border-sky-100">
            Approved (Unpaid)
          </span>
        );
      case "refunded":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md border border-purple-100">
            Refunded
          </span>
        );
      case "pending":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md border border-amber-100">
            Pending Approval
          </span>
        );
      case "past":
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-charcoal-100 text-charcoal-600 px-2.5 py-1 rounded-md border border-charcoal-200">
            Completed
          </span>
        );
      default:
        return (
          <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-100">
            Confirmed Pass
          </span>
        );
    }
  };

  const hasPaidPayment = booking.payments && booking.payments.length > 0;
  const activePayment = booking.payments?.[0];

  return (
    <div className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm flex flex-col p-4 hover:shadow-md transition-shadow duration-200">
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Wedding Image frame */}
        <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-warm-100">
          <Image
            src={booking.imageUrl}
            alt={booking.weddingTitle}
            fill
            className="object-cover"
          />
        </div>

        {/* Details Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <h3 className="font-display font-bold text-base text-charcoal-900 truncate">
                {booking.weddingTitle}
              </h3>
              {getStatusBadge()}
            </div>
            
            <p className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
              <MapPin size={12} className="text-maroon-600 flex-shrink-0" />
              <span className="truncate">{booking.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-600 font-semibold border-t border-warm-100/60 pt-3">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-charcoal-400" />
              {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} className="text-charcoal-400" />
              {booking.guestsCount} {booking.guestsCount > 1 ? "guests" : "guest"}
            </span>
            <span className="text-[var(--color-brand-primary)]">
              Total: {formatPrice(booking.pricePerGuest * booking.guestsCount).primary}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-2 pt-2 border-t border-warm-100/50">
            {hasPaidPayment && (
              <button
                onClick={() => setShowInvoice(!showInvoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-200 text-charcoal-600 hover:bg-warm-50 text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer"
              >
                <Receipt size={12} />
                {showInvoice ? "Hide Invoice" : "Invoice"}
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-200 text-charcoal-600 hover:bg-warm-50 text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer"
            >
              <Printer size={12} />
              Ticket
            </button>
            
            {booking.status === "awaiting_payment" && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6b1026] text-white hover:bg-[#520c1d] text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 animate-pulse"
              >
                <CreditCard size={12} />
                {paying ? "Redirecting..." : "Pay Now"}
              </button>
            )}

            {booking.status === "upcoming" && onCancel && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to request cancellation for this wedding booking?")) {
                    onCancel(booking.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer"
              >
                <XCircle size={12} />
                Cancel
              </button>
            )}

            {booking.status === "past" && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon-50 text-[#6b1026] hover:bg-maroon-100 border border-maroon-200 text-[0.6875rem] font-bold uppercase tracking-wider cursor-pointer"
              >
                <Star size={12} className="fill-[#6b1026] text-[#6b1026]" />
                Leave a Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Collapse Section */}
      {showInvoice && activePayment && (
        <div className="mt-4 p-4 border border-warm-200 bg-warm-50/50 rounded-xl space-y-3 text-xs text-charcoal-600 animate-fade-in">
          <div className="flex justify-between font-bold border-b border-warm-100 pb-2 text-charcoal-800">
            <span>Payment Receipt / Invoice Summary</span>
            <span className="text-[#6b1026]">Invoice ID: {activePayment.id}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-charcoal-400 font-semibold block uppercase text-[0.625rem]">Charged To</span>
              <span className="font-bold text-charcoal-800">{user?.name} ({user?.email})</span>
            </div>
            <div>
              <span className="text-charcoal-400 font-semibold block uppercase text-[0.625rem]">Transaction Status</span>
              <span className="font-bold text-emerald-600 uppercase">{activePayment.status}</span>
            </div>
            <div>
              <span className="text-charcoal-400 font-semibold block uppercase text-[0.625rem]">Stripe Charge Reference</span>
              <span className="font-mono text-[0.6875rem] block truncate text-charcoal-600">{activePayment.stripeChargeId || "pi_mock_ref_code"}</span>
            </div>
            <div>
              <span className="text-charcoal-400 font-semibold block uppercase text-[0.625rem]">Paid At</span>
              <span>{new Date(activePayment.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-warm-200 pt-2 flex justify-between font-bold text-charcoal-800 text-sm">
            <span>Total Paid (USD)</span>
            <span>${activePayment.amount.toLocaleString()}.00</span>
          </div>
        </div>
      )}

      {/* Review Modal Dialogue */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-warm-200 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in text-left">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                Share Your Wedding Experience
              </h3>
              <p className="text-charcoal-400 text-xs font-semibold">
                Reviewing {booking.weddingTitle}
              </p>
            </div>

            {/* Overall Rating Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-widest block">
                Overall Experience Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={28}
                      className={
                        star <= rating
                          ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                          : "text-warm-200"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensional Ratings Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-widest block border-b border-warm-100 pb-1">
                Rate Specific Dimensions (1 to 5 Stars)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Culture & Rituals", key: "ratingCulture" },
                  { label: "Food & Feast", key: "ratingFood" },
                  { label: "Hospitality & Host", key: "ratingHospitality" },
                  { label: "Safety & Hygiene", key: "ratingSafety" },
                  { label: "Accommodation/Lodging", key: "ratingAccommodation" },
                  { label: "Overall Event Management", key: "ratingExperience" }
                ].map((dim) => (
                  <div key={dim.key} className="space-y-1">
                    <span className="text-xs font-semibold text-charcoal-600 block">{dim.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setCategoryRatings((prev) => ({
                              ...prev,
                              [dim.key]: s
                            }))
                          }
                          className="hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            size={14}
                            className={
                              s <= categoryRatings[dim.key as keyof typeof categoryRatings]
                                ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                                : "text-warm-200"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Comment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-widest block">
                Review Details
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was the best part? Share details about traditions, outfits, host family warmth, and recommendations for future travelers..."
                rows={4}
                required
                className="w-full border border-warm-200 rounded-xl text-xs font-medium text-charcoal-850 p-3 outline-none focus:ring-1 focus:ring-maroon-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-warm-200 text-charcoal-600 text-xs font-bold uppercase tracking-wider hover:bg-warm-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={submittingReview || !comment.trim()}
                onClick={handleSubmitReview}
                className="px-5 py-2 rounded-xl bg-[#6b1026] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#520c1d] disabled:opacity-50 cursor-pointer"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export { cn };

"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wedding } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { WEDDING_TIER_CONFIG, normalizeWeddingTier, normalizeDurationDays, getCustomerPriceUSD } from "@/lib/services/pricing-engine";

interface StickyBookingCardProps {
  wedding: Wedding;
}

export function StickyBookingCard({ wedding }: StickyBookingCardProps) {
  const { user, addBooking } = useAuth();
  const router = useRouter();

  const tier = normalizeWeddingTier(wedding.tier || (wedding.category === "Royal" ? "ROYAL" : "STANDARD"));
  const durationDays = normalizeDurationDays(wedding.durationDays || 3);
  const tierConfig = WEDDING_TIER_CONFIG[tier];
  const pricePerGuestUSD = getCustomerPriceUSD(tier, durationDays);

  const [isOpen, setIsOpen] = useState(false);
  const [guestsCount, setGuestsCount] = useState(1);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = Math.max(0, wedding.guestsAllowed - wedding.guestsBooked);
  const isShowcase = wedding.isDemo === true;
  const isSoldOut = isShowcase || wedding.availabilityStatus === "FULLY_BOOKED" || wedding.availabilityStatus === "UNAVAILABLE" || wedding.availabilityStatus === "COMPLETED" || wedding.guestsAllowed === 0 || availableSlots <= 0;
  const subtotalUSD = pricePerGuestUSD * guestsCount;

  return (
    <>
      {/* Bottom Floating Bar */}
      <section data-testid="booking-form" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-warm-200/60 p-4 shadow-[0_-10px_32px_-12px_rgba(0,0,0,0.1)] flex items-center justify-between md:hidden">
        <div>
          <span className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider block">
            {tierConfig.label} Experience
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-lg text-[var(--color-brand-primary)]">
              ${pricePerGuestUSD}
            </span>
            <span className="text-[0.625rem] text-charcoal-400 font-semibold">/guest</span>
          </div>
          <span className="text-[0.625rem] text-charcoal-500 font-medium block">
            {durationDays}-Day Pass
          </span>
        </div>

        {isShowcase ? (
          <button
            disabled
            className="btn btn-secondary btn-sm px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold cursor-not-allowed"
          >
            Fully Booked
          </button>
        ) : isSoldOut ? (
          <button
            disabled
            className="btn btn-secondary btn-sm px-4 py-2.5 bg-warm-200 text-charcoal-400 border border-warm-300 font-bold cursor-not-allowed"
          >
            Fully Booked
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="btn btn-primary btn-sm px-6 py-3 shadow-md font-bold"
          >
            Reserve Invitation
          </button>
        )}
      </section>

      {/* Modal Sheet for Mobile Booking */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-h-[90vh] bg-white rounded-t-3xl p-6 shadow-2xl overflow-y-auto flex flex-col gap-5 border-t border-warm-200 z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-warm-100">
                <div>
                  <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block">
                    {tierConfig.label} • {durationDays} Days
                  </span>
                  <span className="font-display font-bold text-lg text-charcoal-900">
                    Reserve Celebration Pass
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-warm-100 text-charcoal-600 hover:bg-warm-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Guest Count Selector */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mobile-guests" className="text-xs font-bold text-charcoal-700">
                  Number of International Guests
                </label>
                <select
                  id="mobile-guests"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="input-luxury bg-white font-semibold cursor-pointer"
                >
                  {Array.from({ length: Math.min(10, availableSlots) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? "Guest" : "Guests"} (${pricePerGuestUSD * (i + 1)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 bg-warm-50 border border-warm-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs text-charcoal-600">
                  <span>${pricePerGuestUSD} × {guestsCount}</span>
                  <span className="font-semibold text-charcoal-900">${subtotalUSD} USD</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-warm-200">
                  <span className="font-bold text-charcoal-900 text-sm">Total Amount</span>
                  <span className="font-display font-black text-xl text-[var(--color-brand-primary)]">
                    ${subtotalUSD} USD
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Action Button */}
              {isBooked ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
                  <Check size={18} /> Booking Request Submitted!
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (!user) {
                      sessionStorage.setItem(
                        `pending_booking_${wedding.id}`,
                        JSON.stringify({ guestsCount })
                      );
                      router.push(`/login?redirect_url=${encodeURIComponent(window.location.pathname)}`);
                      return;
                    }
                    try {
                      await addBooking({
                        weddingId: wedding.id,
                        weddingTitle: wedding.title,
                        location: wedding.location,
                        imageUrl: wedding.imageUrl,
                        date: wedding.date,
                        pricePerGuest: pricePerGuestUSD,
                        guestsCount,
                        status: "pending"
                      });
                      setIsBooked(true);
                      setTimeout(() => setIsOpen(false), 2000);
                    } catch (err: any) {
                      setErrorMessage(err.message || "Failed to submit reservation.");
                    }
                  }}
                  className="btn btn-primary w-full py-4 text-base font-bold shadow-lg justify-center"
                >
                  Submit Reservation — ${subtotalUSD}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

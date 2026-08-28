"use client";

import { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
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
  const maxGuests = Math.min(10, availableSlots || 10);
  const isShowcase = wedding.isDemo === true;
  const isSoldOut = isShowcase || wedding.availabilityStatus === "FULLY_BOOKED" || wedding.availabilityStatus === "UNAVAILABLE" || wedding.availabilityStatus === "COMPLETED" || wedding.guestsAllowed === 0 || availableSlots <= 0;
  const subtotalUSD = pricePerGuestUSD * guestsCount;

  return (
    <>
      {/* Bottom Floating Bar — with safe-area-inset-bottom */}
      <section
        data-testid="booking-form"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: "rgba(255, 255, 255, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(245, 235, 224, 0.8)",
          boxShadow: "0 -4px 24px 0 rgb(0 0 0 / 0.07)",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "0.75rem",
          paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider block">
              {tierConfig.label} Experience
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-xl text-[var(--color-brand-primary)]">
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
              className="btn btn-sm px-5 py-3 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold cursor-not-allowed rounded-2xl"
            >
              Fully Booked
            </button>
          ) : isSoldOut ? (
            <button
              disabled
              className="btn btn-sm px-5 py-3 bg-warm-200 text-charcoal-400 border border-warm-300 font-bold cursor-not-allowed rounded-2xl"
            >
              Fully Booked
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="btn btn-primary px-7 py-3.5 shadow-lg font-bold rounded-2xl text-sm"
            >
              Reserve Pass
            </button>
          )}
        </div>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-h-[90vh] bg-white rounded-t-3xl shadow-2xl overflow-y-auto flex flex-col z-10"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-warm-300" />
              </div>

              <div className="px-6 pb-2 flex flex-col gap-5">
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
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-warm-100 text-charcoal-600 hover:bg-warm-200 transition-colors"
                    aria-label="Close booking panel"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Guest Count Selector — stepper instead of select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-charcoal-700">
                    Number of International Guests
                  </label>
                  <div className="flex items-center justify-between bg-warm-50 border border-warm-200 rounded-2xl p-1.5">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      disabled={guestsCount <= 1}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-warm-200 text-charcoal-700 hover:bg-warm-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                      aria-label="Decrease guest count"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-display font-black text-2xl text-charcoal-900 leading-none">
                        {guestsCount}
                      </span>
                      <span className="text-xs text-charcoal-500 font-medium">
                        {guestsCount === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.min(maxGuests, guestsCount + 1))}
                      disabled={guestsCount >= maxGuests}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-warm-200 text-charcoal-700 hover:bg-warm-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                      aria-label="Increase guest count"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {availableSlots > 0 && availableSlots < 5 && (
                    <p className="text-xs text-amber-700 font-semibold">
                      Only {availableSlots} guest pass{availableSlots > 1 ? "es" : ""} remaining
                    </p>
                  )}
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
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold">
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
                    className="btn btn-primary w-full py-4 text-base font-bold shadow-lg justify-center rounded-2xl"
                  >
                    Submit Reservation — ${subtotalUSD}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

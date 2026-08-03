"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Calendar, X, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wedding } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  PRICING_TIERS,
  formatCurrencyINR,
  formatSecondaryCurrency,
  PricingTier
} from "@/lib/constants/financial-model";
import { useCurrency } from "@/context/CurrencyContext";

interface StickyBookingCardProps {
  wedding: Wedding;
}

export function StickyBookingCard({ wedding }: StickyBookingCardProps) {
  const { user, addBooking } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTierKey, setSelectedTierKey] = useState<string>("CELEBRATION_EXPERIENCE");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;
  const activeTier: PricingTier = PRICING_TIERS[selectedTierKey] || PRICING_TIERS.CULTURAL_GUEST;
  const subtotalINR = activeTier.priceINR * guestsCount;

  return (
    <>
      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-warm-200/60 p-4 shadow-[0_-10px_32px_-12px_rgba(0,0,0,0.1)] flex items-center justify-between md:hidden">
        <div>
          <span className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider block">From</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-lg text-[var(--color-brand-primary)]">
              {formatPrice(PRICING_TIERS.CULTURAL_GUEST.priceINR).primary}
            </span>
            <span className="text-[0.625rem] text-charcoal-400 font-semibold">/guest</span>
          </div>
          {formatPrice(PRICING_TIERS.CULTURAL_GUEST.priceINR).secondary && (
            <span className="text-[0.625rem] text-charcoal-500 font-medium block">
              {formatPrice(PRICING_TIERS.CULTURAL_GUEST.priceINR).secondary}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-sm px-6 py-3 shadow-md font-bold"
        >
          Book Spot
        </button>
      </div>

      {/* Mobile Booking Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal-950/40 backdrop-blur-sm md:hidden flex items-end"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-h-[90vh] overflow-y-auto bg-white rounded-t-[2rem] p-6 shadow-2xl z-10 flex flex-col gap-5 border-t border-warm-200/50"
            >
              {/* Drag Handle indicator */}
              <div className="w-12 h-1 bg-warm-200 rounded-full mx-auto" aria-hidden="true" />

              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-bold text-lg text-charcoal-900">
                    Select Experience Tier
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Choose your access level for this wedding
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-warm-100 hover:bg-warm-200 transition-colors text-charcoal-500"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Slots Info */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-500/10 p-3 rounded-2xl">
                <ShieldCheck size={14} className="flex-shrink-0" />
                <span>{availableSlots} spots left for this verified wedding.</span>
              </div>

              {/* Tiers List */}
              <div className="space-y-2">
                {Object.entries(PRICING_TIERS).map(([key, tier]) => {
                  const isSelected = selectedTierKey === key;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierKey(key)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all relative ${
                        isSelected
                          ? "border-[var(--color-brand-primary)] bg-maroon-50/20 ring-1 ring-[var(--color-brand-primary)]"
                          : "border-warm-200 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-baseline font-bold text-charcoal-900">
                        <span>{tier.name}</span>
                        <span className="text-[var(--color-brand-primary)] font-display text-sm">
                          {formatCurrencyINR(tier.priceINR)}
                        </span>
                      </div>
                      <div className="text-[0.625rem] text-charcoal-500 font-medium mt-0.5">
                        {formatSecondaryCurrency(tier.priceINR)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form fields */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                    Date
                  </span>
                  <div className="input-luxury bg-warm-50 text-charcoal-500 flex items-center gap-2 border-warm-200">
                    <Calendar size={14} />
                    <span className="text-sm font-semibold">
                      {new Date(wedding.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="mobile-booking-guests" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                    Number of Guests
                  </label>
                  <select
                    id="mobile-booking-guests"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="input-luxury bg-white font-semibold cursor-pointer text-sm"
                  >
                    {Array.from({ length: Math.min(10, availableSlots) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-between items-baseline pt-2 border-t border-warm-100">
                <span className="text-sm font-semibold text-charcoal-600">Total Price</span>
                <div className="text-right">
                  <span className="font-display font-black text-xl text-charcoal-900">
                    {formatCurrencyINR(subtotalINR)}
                  </span>
                  <span className="text-[0.625rem] text-charcoal-400 font-medium block">
                    {formatSecondaryCurrency(subtotalINR)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}
              <button
                onClick={async () => {
                  if (!user) {
                    const currentPath = window.location.pathname + window.location.search;
                    router.push(`/login?redirect_url=${encodeURIComponent(currentPath)}`);
                    return;
                  }
                  if (user.role !== "traveler") {
                    toast.error("Only traveler accounts can request booking spots for wedding experiences.");
                    return;
                  }
                  setErrorMessage(null);
                  try {
                    await addBooking({
                      weddingId: wedding.id,
                      weddingTitle: `${wedding.title} - ${activeTier.name}`,
                      location: wedding.location,
                      imageUrl: wedding.imageUrl,
                      date: wedding.date,
                      pricePerGuest: activeTier.priceINR,
                      guestsCount,
                      status: "pending"
                    });
                    setIsBooked(true);
                    setIsOpen(false);
                  } catch (err: any) {
                    setErrorMessage(err.message || "Failed to submit booking request. Please try again.");
                  }
                }}
                className="btn btn-primary w-full py-3.5 justify-center font-bold rounded-2xl"
              >
                Confirm Booking
              </button>

              {/* Trust signals — cancellation policy */}
              <div className="text-[0.625rem] text-charcoal-400 space-y-1 pt-1">
                <p className="font-semibold text-charcoal-600 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                  Cancellation Policy
                </p>
                <p>30+ days: <strong className="text-charcoal-600">Full refund</strong> · 14–29 days: 50% refund · Under 14: No refund</p>
                <p>
                  Questions?{" "}
                  <a href="mailto:support@weddingwithindia.com" className="text-[var(--color-brand-primary)] underline font-semibold">
                    support@weddingwithindia.com
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Booking Modal (shared) */}
      <AnimatePresence>
        {isBooked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white max-w-sm w-full p-6 rounded-3xl border border-warm-200 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check size={24} />
              </div>
              <h4 className="font-display font-bold text-lg text-charcoal-900">
                Reservation Requested!
              </h4>
              <p className="text-charcoal-600 text-sm">
                Your reservation request for {guestsCount} guest spot(s) has been sent to the wedding host family.
              </p>
              <div className="text-xs bg-warm-50 border border-warm-100 p-3 rounded-xl text-charcoal-600 font-medium">
                Total Payment: {formatCurrencyINR(subtotalINR)} ({formatSecondaryCurrency(subtotalINR)})
              </div>
              <button
                onClick={() => setIsBooked(false)}
                className="btn btn-primary w-full py-3 justify-center text-sm font-bold"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

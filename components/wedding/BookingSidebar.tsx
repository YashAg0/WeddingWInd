"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Heart, Share2, ShieldCheck, Check, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  PRICING_TIERS,
  formatCurrencyINR,
  formatSecondaryCurrency,
  PricingTier
} from "@/lib/constants/financial-model";
import { useCurrency } from "@/context/CurrencyContext";

interface BookingSidebarProps {
  wedding: Wedding;
}

export function BookingSidebar({ wedding }: BookingSidebarProps) {
  const { user, addBooking } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [selectedTierKey, setSelectedTierKey] = useState<string>("CELEBRATION_EXPERIENCE");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;
  const activeTier: PricingTier = PRICING_TIERS[selectedTierKey] || PRICING_TIERS.CULTURAL_GUEST;

  const subtotalINR = activeTier.priceINR * guestsCount;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleBook = async () => {
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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit booking request. Please try again.");
    }
  };

  return (
    <aside className="sticky top-28 bg-white border border-warm-200/60 rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(107,16,38,0.08)] flex flex-col gap-6" aria-label="Booking widget">
      {/* Header & Verification */}
      <div className="flex justify-between items-center pb-4 border-b border-warm-200">
        <div>
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">Experience Tier</span>
          <span className="font-display font-bold text-lg text-charcoal-900">{activeTier.name}</span>
        </div>
        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
          <ShieldCheck size={12} />
          Vetted Host
        </span>
      </div>

      {/* Slots Info */}
      <div className="flex items-center justify-between p-3.5 bg-warm-50 border border-warm-200/50 rounded-2xl">
        <div className="flex items-center gap-2 text-charcoal-700">
          <Users size={16} className="text-[var(--color-brand-primary)]" />
          <span className="text-xs font-semibold">Guest Slots Remaining</span>
        </div>
        <span className="text-xs font-bold text-charcoal-900 bg-white border border-warm-200 px-3 py-1 rounded-lg">
          {availableSlots} / {wedding.guestsAllowed} Left
        </span>
      </div>

      {/* Selectable Pricing Tiers */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest">
          Select Experience Tier
        </label>
        <div className="space-y-2">
          {Object.entries(PRICING_TIERS).map(([key, tier]) => {
            const isSelected = selectedTierKey === key;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTierKey(key)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl border transition-all relative flex flex-col gap-1",
                  isSelected
                    ? "border-[var(--color-brand-primary)] bg-maroon-50/20 ring-2 ring-[var(--color-brand-primary)]/20"
                    : "border-warm-200 hover:border-warm-300 bg-white"
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-2.5 right-3 bg-[var(--color-brand-secondary)] text-charcoal-950 text-[0.625rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <Sparkles size={10} /> Most Popular
                  </span>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="font-sans font-bold text-sm text-charcoal-900">{tier.name}</span>
                  <div className="text-right">
                    <span className="font-display font-bold text-base text-[var(--color-brand-primary)]">
                      {formatPrice(tier.priceINR).primary}
                    </span>
                    {formatPrice(tier.priceINR).secondary && (
                      <span className="text-[0.625rem] text-charcoal-400 font-medium block">
                        {formatPrice(tier.priceINR).secondary}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[0.75rem] text-charcoal-500 leading-snug line-clamp-1">{tier.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guests Count Select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-guests" className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest">
          Number of Guests
        </label>
        <select
          id="booking-guests"
          value={guestsCount}
          onChange={(e) => setGuestsCount(Number(e.target.value))}
          className="input-luxury bg-white font-semibold cursor-pointer"
        >
          {Array.from({ length: Math.min(10, availableSlots) }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Price Summary Calculation */}
      <div className="space-y-3 pt-3 border-t border-warm-200">
        <div className="flex justify-between text-sm text-charcoal-600">
          <span>{activeTier.name} ({formatPrice(activeTier.priceINR).primary} × {guestsCount})</span>
          <span className="font-semibold text-charcoal-900">{formatPrice(subtotalINR).primary}</span>
        </div>
        {formatPrice(subtotalINR).secondary && (
          <div className="flex justify-between text-xs text-charcoal-500">
            <span>Reference (INR)</span>
            <span className="font-medium">{formatPrice(subtotalINR).secondary}</span>
          </div>
        )}
        <hr className="border-warm-100" />
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-charcoal-800">Total Booking Price</span>
          <div className="text-right">
            <span className="font-display font-bold text-xl text-charcoal-950">{formatPrice(subtotalINR).primary}</span>
            <span className="text-[0.6875rem] text-charcoal-500 block font-medium">All taxes & fees included</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2.5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        )}
        <button
          onClick={handleBook}
          className="btn btn-primary w-full py-4 text-base shadow-lg justify-center font-bold"
        >
          Reserve Invitation — {formatPrice(subtotalINR).primary}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 border border-warm-200 rounded-2xl py-3 text-xs font-semibold text-charcoal-600 hover:bg-warm-50 active:scale-95 transition-all",
              isSaved && "border-maroon-200 text-[var(--color-brand-primary)] bg-maroon-50/30"
            )}
          >
            <Heart size={14} className={isSaved ? "fill-[var(--color-brand-primary)]" : ""} />
            {isSaved ? "Saved" : "Save"}
          </button>
          
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-1.5 border border-warm-200 rounded-2xl py-3 text-xs font-semibold text-charcoal-600 hover:bg-warm-50 active:scale-95 transition-all"
          >
            {isShared ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            {isShared ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      {/* Vetting Guarantee Text */}
      <div className="flex items-start gap-2 bg-warm-100/50 p-3 rounded-2xl border border-warm-200/30">
        <Info size={14} className="text-charcoal-400 mt-0.5 flex-shrink-0" />
        <p className="text-[0.6875rem] text-charcoal-500 leading-normal">
          Every host family is in-person verified by our team. Your reservation payment is held securely in trust until check-in.
        </p>
      </div>

      {/* Cancellation Policy */}
      <div className="text-[0.6875rem] text-charcoal-500 space-y-1.5 border-t border-warm-100 pt-4">
        <p className="font-bold text-charcoal-700 flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[var(--color-brand-primary)]" />
          Cancellation Policy
        </p>
        <ul className="space-y-1 pl-1">
          <li className="flex items-start gap-1.5">
            <Check size={11} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <span><strong className="text-charcoal-700">30+ days before event:</strong> Full refund of reservation fee.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={11} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <span><strong className="text-charcoal-700">14–29 days before event:</strong> 50% refund of reservation fee.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={11} className="text-rose-600 mt-0.5 flex-shrink-0" />
            <span><strong className="text-charcoal-700">Under 14 days:</strong> Non-refundable as host arrangements are finalized.</span>
          </li>
        </ul>
      </div>

      {/* Support Contact */}
      <div className="text-[0.6875rem] text-charcoal-500 border-t border-warm-100 pt-3">
        <p className="font-bold text-charcoal-700 mb-1">Questions before reserving?</p>
        <a
          href="mailto:support@weddingwithindia.com"
          className="text-[var(--color-brand-primary)] font-semibold hover:underline"
        >
          support@weddingwithindia.com
        </a>
        <span className="mx-1.5 text-charcoal-300">·</span>
        <span>Concierge responds within 24 hours.</span>
      </div>

      {/* Success Booking Modal */}
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
                Invitation Request Sent
              </h4>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Your invitation request for {guestsCount} guest(s) on the <strong>{activeTier.name}</strong> experience has been received. The host family will review your details with care.
              </p>
              <div className="text-xs bg-warm-50 border border-warm-100 p-3 rounded-xl text-charcoal-600 font-medium">
                Total Payment: {formatCurrencyINR(subtotalINR)} ({formatSecondaryCurrency(subtotalINR)})
              </div>
              <button
                onClick={() => setIsBooked(false)}
                className="btn btn-primary w-full py-3 justify-center text-sm font-bold"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

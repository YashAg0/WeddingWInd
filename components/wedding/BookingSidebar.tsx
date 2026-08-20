"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Heart, Share2, ShieldCheck, Check } from "lucide-react";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { WEDDING_TIER_CONFIG, normalizeWeddingTier, normalizeDurationDays, getCustomerPriceUSD } from "@/lib/services/pricing-engine";
import { WeddingSideSelector, type WeddingSideValue } from "@/components/wedding/WeddingSideSelector";

interface BookingSidebarProps {
  wedding: Wedding;
}

export function BookingSidebar({ wedding }: BookingSidebarProps) {
  const { user, addBooking } = useAuth();
  const router = useRouter();

  const tier = normalizeWeddingTier(wedding.tier || (wedding.category === "Royal" ? "ROYAL" : "STANDARD"));
  const durationDays = normalizeDurationDays(wedding.durationDays || 3);
  const tierConfig = WEDDING_TIER_CONFIG[tier];
  const pricePerGuestUSD = getCustomerPriceUSD(tier, durationDays);

  const [guestsCount, setGuestsCount] = useState(1);
  const [attendanceSide, setAttendanceSide] = useState<WeddingSideValue>("BRIDE_SIDE");
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = Math.max(0, wedding.guestsAllowed - wedding.guestsBooked);
  const isShowcase = wedding.isDemo === true;
  const isSoldOut = isShowcase || wedding.availabilityStatus === "FULLY_BOOKED" || wedding.availabilityStatus === "UNAVAILABLE" || wedding.availabilityStatus === "COMPLETED" || wedding.guestsAllowed === 0 || availableSlots <= 0;
  const subtotalUSD = pricePerGuestUSD * guestsCount;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sideParam = params.get("side")?.toUpperCase();
      if (sideParam === "BRIDE" || sideParam === "BRIDE_SIDE") {
        setAttendanceSide("BRIDE_SIDE");
      } else if (sideParam === "GROOM" || sideParam === "GROOM_SIDE") {
        setAttendanceSide("GROOM_SIDE");
      } else if (sideParam === "OPEN") {
        setAttendanceSide("OPEN");
      }

      try {
        const stored = sessionStorage.getItem(`pending_booking_${wedding.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.guestsCount) setGuestsCount(Number(parsed.guestsCount));
          if (parsed.attendanceSide) setAttendanceSide(parsed.attendanceSide);
          sessionStorage.removeItem(`pending_booking_${wedding.id}`);
        }
      } catch {}
    }
  }, [wedding.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleBook = async () => {
    if (isShowcase || isSoldOut) {
      toast.error("This experience is currently fully booked and not accepting new reservations.");
      return;
    }
    if (!user) {
      try {
        sessionStorage.setItem(
          `pending_booking_${wedding.id}`,
          JSON.stringify({
            guestsCount,
            attendanceSide,
          })
        );
      } catch {}
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
        weddingTitle: wedding.title,
        location: wedding.location,
        imageUrl: wedding.imageUrl,
        date: wedding.date,
        pricePerGuest: pricePerGuestUSD,
        guestsCount,
        attendanceSide,
        status: "pending"
      });
      setIsBooked(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit booking request. Please try again.");
    }
  };

  return (
    <aside data-testid="booking-form" className="sticky top-28 bg-white border border-warm-200/60 rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(107,16,38,0.08)] flex flex-col gap-6" aria-label="Booking widget">
      {/* Header & Verification */}
      <div className="flex justify-between items-center pb-4 border-b border-warm-200">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
              {tierConfig.label} Experience
            </span>
          </div>
          <span className="font-display font-bold text-lg text-charcoal-900">
            {durationDays}-Day Celebration
          </span>
        </div>
        {wedding.isVerified && !wedding.isDemo ? (
          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            <ShieldCheck size={12} />
            Verified Host
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-warm-100 border border-warm-200 text-charcoal-600 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            {tierConfig.label}
          </span>
        )}
      </div>

      {/* Pricing Header Card */}
      <div className="p-4 bg-warm-50/70 border border-warm-200/60 rounded-2xl">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Pass Price</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-2xl text-[var(--color-brand-primary)]">
              ${pricePerGuestUSD}
            </span>
            <span className="text-xs font-semibold text-charcoal-500">/guest</span>
          </div>
        </div>
        <p className="text-[0.75rem] text-charcoal-600 mt-2 leading-relaxed">
          {tierConfig.description}
        </p>
      </div>

      {/* Slots Info */}
      <div className="flex items-center justify-between p-3.5 bg-warm-50 border border-warm-200/50 rounded-2xl">
        <div className="flex items-center gap-2 text-charcoal-700">
          <Users size={16} className="text-[var(--color-brand-primary)]" />
          <span className="text-xs font-semibold">
            {isShowcase || isSoldOut ? "Availability Status" : "Guest Slots Remaining"}
          </span>
        </div>
        <span className={cn("text-xs font-bold px-3 py-1 rounded-lg border", (isShowcase || isSoldOut) ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-white text-charcoal-900 border-warm-200")}>
          {isShowcase || isSoldOut ? "Fully Booked" : `${availableSlots} / ${wedding.guestsAllowed} Left`}
        </span>
      </div>

      {/* Wedding Side Selector */}
      <WeddingSideSelector
        value={attendanceSide}
        onChange={setAttendanceSide}
        disabled={isSoldOut}
      />

      {/* Guests Count Select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-guests" className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest">
          Number of International Guests
        </label>
        <select
          id="booking-guests"
          value={isSoldOut ? 0 : guestsCount}
          disabled={isSoldOut}
          onChange={(e) => setGuestsCount(Number(e.target.value))}
          className="input-luxury bg-white font-semibold cursor-pointer disabled:bg-warm-100 disabled:text-charcoal-400 disabled:cursor-not-allowed"
        >
          {isShowcase || isSoldOut ? (
            <option value={0}>
              Fully Booked (0 Seats Available)
            </option>
          ) : (
            Array.from({ length: Math.min(10, availableSlots) }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "Guest" : "Guests"} (${pricePerGuestUSD * (i + 1)})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Price Summary Calculation */}
      <div className="space-y-3 pt-3 border-t border-warm-200">
        <div className="flex justify-between text-sm text-charcoal-600">
          <span>${pricePerGuestUSD} × {guestsCount} {guestsCount === 1 ? "Guest" : "Guests"}</span>
          <span className="font-semibold text-charcoal-900">${subtotalUSD} USD</span>
        </div>
        <hr className="border-warm-100" />
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-charcoal-800">Total Booking Price</span>
          <div className="text-right">
            <span className="font-display font-bold text-2xl text-charcoal-950">${subtotalUSD} USD</span>
            <span className="text-[0.6875rem] text-charcoal-500 block font-medium">All ceremonial access & feasts included</span>
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
        {isShowcase || isSoldOut ? (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-3.5 px-4 text-sm font-bold bg-amber-50/90 text-amber-900 border border-amber-300 rounded-2xl cursor-not-allowed text-center shadow-xs"
            >
              Fully Booked
            </button>
            <p className="text-[0.6875rem] text-charcoal-500 text-center leading-normal px-1">
              This experience is not currently accepting reservations.
            </p>
            <Link
              href="/contact"
              className="w-full py-2.5 px-4 text-xs font-bold text-center text-charcoal-700 bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl transition-all block mt-1"
            >
              Enquire About Custom Dates
            </Link>
          </div>
        ) : (
          <button
            onClick={handleBook}
            className="btn btn-primary w-full py-4 text-base shadow-lg justify-center font-bold"
          >
            Reserve Invitation — ${subtotalUSD}
          </button>
        )}

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
    </aside>
  );
}

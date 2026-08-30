"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  Heart,
  Share2,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  RotateCcw,
} from "lucide-react";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useRouter } from "next/navigation";
import {
  WEDDING_TIER_CONFIG,
  normalizeWeddingTier,
  normalizeDurationDays,
  getCustomerPriceUSD,
} from "@/lib/services/pricing-engine";
import { WeddingSideSelector, type WeddingSideValue } from "@/components/wedding/WeddingSideSelector";
import { DietaryAllergenSelector } from "@/components/dietary/DietaryAllergenSelector";
import { createBookingAction } from "@/lib/actions";

export interface GuestAttendeeInput {
  fullName: string;
  email?: string;
  age?: number | "";
  gender?: string;
  foodPreference: string;
  accessibilityNeed?: string;
}

interface BookingSidebarProps {
  wedding: Wedding;
}

export function BookingSidebar({ wedding }: BookingSidebarProps) {
  const { user } = useAuth();
  const { currency, formatPriceFromUSD } = useCurrency();
  const router = useRouter();

  const tier = normalizeWeddingTier(wedding.tier || (wedding.category === "Royal" ? "ROYAL" : "STANDARD"));
  const durationDays = normalizeDurationDays(wedding.durationDays || 3);
  const tierConfig = WEDDING_TIER_CONFIG[tier];
  const pricePerGuestUSD = getCustomerPriceUSD(tier, durationDays);

  const [guestsCount, setGuestsCount] = useState(1);
  const [attendanceSide, setAttendanceSide] = useState<WeddingSideValue>("BRIDE_SIDE");
  const [guestManifest, setGuestManifest] = useState<GuestAttendeeInput[]>([]);
  const [isCancellationDrawerOpen, setIsCancellationDrawerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = Math.max(0, wedding.guestsAllowed - wedding.guestsBooked);
  const isShowcase = wedding.isDemo === true;
  const isSoldOut =
    isShowcase ||
    wedding.availabilityStatus === "FULLY_BOOKED" ||
    wedding.availabilityStatus === "UNAVAILABLE" ||
    wedding.availabilityStatus === "COMPLETED" ||
    wedding.guestsAllowed === 0 ||
    availableSlots <= 0;

  const subtotalUSD = pricePerGuestUSD * guestsCount;
  const priceDisplay = formatPriceFromUSD(pricePerGuestUSD);
  const subtotalDisplay = formatPriceFromUSD(subtotalUSD);

  // Synchronize accompanying guest manifest when guest count changes
  useEffect(() => {
    const accompanyingCount = Math.max(0, guestsCount - 1);
    setGuestManifest((prev) => {
      if (prev.length === accompanyingCount) return prev;
      if (prev.length < accompanyingCount) {
        const added: GuestAttendeeInput[] = Array.from({
          length: accompanyingCount - prev.length,
        }).map(() => ({
          fullName: "",
          email: "",
          age: "",
          gender: "",
          foodPreference: "No Restrictions",
          accessibilityNeed: "None",
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, accompanyingCount);
    });
  }, [guestsCount]);

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
          if (Array.isArray(parsed.guestManifest)) setGuestManifest(parsed.guestManifest);
          sessionStorage.removeItem(`pending_booking_${wedding.id}`);
        }
      } catch {}
    }
  }, [wedding.id]);

  const updateGuestField = (index: number, field: keyof GuestAttendeeInput, value: any) => {
    setGuestManifest((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

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
            guestManifest,
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

    // Validate accompanying guests if guestsCount > 1
    if (guestsCount > 1) {
      const emptyNameIndex = guestManifest.findIndex((g) => !g.fullName || g.fullName.trim().length === 0);
      if (emptyNameIndex !== -1) {
        const msg = `Please provide the full name for Accompanying Guest #${emptyNameIndex + 2}.`;
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const dateStr = typeof wedding.date === "string" ? wedding.date : new Date(wedding.date).toISOString();
      const res = await createBookingAction({
        weddingId: wedding.id,
        date: dateStr,
        guestsCount,
        attendanceSide,
        guests: guestManifest.map((g) => ({
          fullName: g.fullName.trim(),
          email: g.email?.trim() || null,
          age: typeof g.age === "number" ? g.age : Number(g.age) || null,
          gender: g.gender?.trim() || null,
          foodPreference: g.foodPreference || "No Restrictions",
          accessibilityNeed: g.accessibilityNeed?.trim() || "None",
        })),
      });

      if (res.success) {
        toast.success("Booking reservation submitted successfully!");
        router.push("/dashboard/bookings");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      data-testid="booking-form"
      className="sticky top-28 bg-white border border-warm-200/60 rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(107,16,38,0.08)] flex flex-col gap-6"
      aria-label="Booking widget"
    >
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
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="font-display font-black text-2xl text-[var(--color-brand-primary)]">
                {priceDisplay.primary}
              </span>
              <span className="text-xs font-semibold text-charcoal-500">/guest</span>
            </div>
            {currency !== "USD" && (
              <span className="text-[0.6875rem] text-charcoal-400 block font-medium">
                (${pricePerGuestUSD} USD authoritative)
              </span>
            )}
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
        <span
          className={cn(
            "text-xs font-bold px-3 py-1 rounded-lg border",
            isShowcase || isSoldOut
              ? "bg-amber-100 text-amber-900 border-amber-300"
              : "bg-white text-charcoal-900 border-warm-200"
          )}
        >
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
        <label
          htmlFor="booking-guests"
          className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest"
        >
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
            <option value={0}>Fully Booked (0 Seats Available)</option>
          ) : (
            Array.from({ length: Math.min(10, availableSlots) }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "Guest" : "Guests"} (
                {formatPriceFromUSD(pricePerGuestUSD * (i + 1)).primary})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Multi-Guest Attendee Manifest (UX-02) */}
      {guestsCount > 1 && !isSoldOut && (
        <div className="space-y-4 pt-2 border-t border-warm-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-[var(--color-brand-primary)]" />
              Accompanying Guests ({guestsCount - 1})
            </span>
            <span className="text-[0.6875rem] text-charcoal-400 font-medium">
              Lead traveler: You
            </span>
          </div>

          <div className="space-y-3.5">
            {guestManifest.map((guest, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-warm-50/70 border border-warm-200/80 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-warm-200/60 pb-1.5">
                  <span className="font-bold text-charcoal-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-warm-200 text-charcoal-700 text-[10px] font-black flex items-center justify-center">
                      {idx + 2}
                    </span>
                    Guest #{idx + 2} Details
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-medium">
                    Seat {idx + 2}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label
                      htmlFor={`guest-${idx}-name`}
                      className="block text-[11px] font-bold text-charcoal-700 mb-0.5"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`guest-${idx}-name`}
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={guest.fullName}
                      onChange={(e) => updateGuestField(idx, "fullName", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-warm-200 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`guest-${idx}-email`}
                        className="block text-[10px] font-semibold text-charcoal-600 mb-0.5"
                      >
                        Email (Optional)
                      </label>
                      <input
                        id={`guest-${idx}-email`}
                        type="email"
                        placeholder="eleanor@example.com"
                        value={guest.email || ""}
                        onChange={(e) => updateGuestField(idx, "email", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-warm-200 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`guest-${idx}-age`}
                        className="block text-[10px] font-semibold text-charcoal-600 mb-0.5"
                      >
                        Age (Optional)
                      </label>
                      <input
                        id={`guest-${idx}-age`}
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={guest.age ?? ""}
                        onChange={(e) =>
                          updateGuestField(
                            idx,
                            "age",
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="w-full px-2.5 py-1 text-xs bg-white border border-warm-200 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <DietaryAllergenSelector
                      id={`guest-${idx}-dietary`}
                      value={guest.foodPreference}
                      onChange={(val) => updateGuestField(idx, "foodPreference", val)}
                      label={`Guest #${idx + 2} Dietary & Allergen Profile`}
                      description="Select applicable dietary choices and allergen alerts for banquet catering."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`guest-${idx}-access`}
                      className="block text-[10px] font-semibold text-charcoal-600 mb-0.5"
                    >
                      Accessibility (Optional)
                    </label>
                    <input
                      id={`guest-${idx}-access`}
                      type="text"
                      placeholder="e.g. Wheelchair assistance"
                      value={guest.accessibilityNeed || ""}
                      onChange={(e) => updateGuestField(idx, "accessibilityNeed", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-warm-200 rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Summary Calculation */}
      <div className="space-y-3 pt-3 border-t border-warm-200">
        <div className="flex justify-between text-sm text-charcoal-600">
          <span>
            {priceDisplay.primary} × {guestsCount} {guestsCount === 1 ? "Guest" : "Guests"}
          </span>
          <span className="font-semibold text-charcoal-900">{subtotalDisplay.primary}</span>
        </div>
        <hr className="border-warm-100" />
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-charcoal-800">Total Booking Price</span>
          <div className="text-right">
            <span className="font-display font-bold text-2xl text-charcoal-950">
              {subtotalDisplay.primary}
            </span>
            {currency !== "USD" && (
              <span className="text-[0.6875rem] text-charcoal-500 block font-medium">
                (${subtotalUSD} USD authoritative settlement)
              </span>
            )}
            <span className="text-[0.6875rem] text-charcoal-500 block font-medium">
              All ceremonial access & feasts included
            </span>
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
            disabled={isSubmitting}
            className="btn btn-primary w-full py-4 text-base shadow-lg justify-center font-bold disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : `Reserve Invitation — ${subtotalDisplay.primary}`}
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

        {/* Cancellation & Escrow Protection Drawer (UX-03) */}
        <div className="mt-2 border border-warm-200 rounded-2xl overflow-hidden bg-warm-50/40">
          <button
            type="button"
            data-testid="cancellation-escrow-drawer"
            aria-expanded={isCancellationDrawerOpen}
            onClick={() => setIsCancellationDrawerOpen(!isCancellationDrawerOpen)}
            className="w-full flex items-center justify-between px-3.5 py-3 text-left transition-colors hover:bg-warm-100/70"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-charcoal-900 block">
                  Cancellation & Escrow Protection
                </span>
                <span className="text-[10px] text-charcoal-500 block">
                  4-Tier Refund Policy & Escrow Guarantee
                </span>
              </div>
            </div>
            {isCancellationDrawerOpen ? (
              <ChevronUp size={16} className="text-charcoal-500" />
            ) : (
              <ChevronDown size={16} className="text-charcoal-500" />
            )}
          </button>

          {isCancellationDrawerOpen && (
            <div className="p-3.5 pt-1 space-y-3.5 text-xs border-t border-warm-200/70 bg-white">
              {/* 4-Tier Refund Policy */}
              <div>
                <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-2">
                  Tiered Traveler Refund Policy
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="font-semibold text-emerald-950 text-[11px]">
                      &gt; 30 Days Before Event
                    </span>
                    <span className="font-bold text-emerald-800 text-[11px]">
                      90% Refund
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/80">
                    <span className="font-semibold text-blue-950 text-[11px]">
                      15 – 30 Days Before Event
                    </span>
                    <span className="font-bold text-blue-800 text-[11px]">
                      70% Refund
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <span className="font-semibold text-amber-950 text-[11px]">
                      7 – 14 Days Before Event
                    </span>
                    <span className="font-bold text-amber-800 text-[11px]">
                      40% Refund
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-200/80">
                    <span className="font-semibold text-rose-950 text-[11px]">
                      &lt; 7 Days Before Event
                    </span>
                    <span className="font-bold text-rose-800 text-[11px]">
                      0% Non-Refundable
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees & Escrow terms */}
              <div className="space-y-2 pt-2 border-t border-warm-100 text-[11px] text-charcoal-700">
                <div className="flex items-start gap-2">
                  <Lock size={13} className="text-[var(--color-brand-primary)] flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Platform Escrow Hold:</strong> Traveler funds are held securely in platform escrow and disbursed to host couples only after verified check-in at the wedding celebration.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <RotateCcw size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>100% Host Cancellation Guarantee:</strong> If the host family cancels or the wedding is called off, you are entitled to a full 100% refund.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Shield size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Trust &amp; Safety Resolution:</strong> Unresolved safety incidents or unauthorized schedule changes investigated by Trust &amp; Safety are eligible for up to 100% resolution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

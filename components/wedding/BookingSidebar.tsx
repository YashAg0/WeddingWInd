"use client";

import { useState } from "react";
import { Users, Heart, Share2, ShieldCheck, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookingSidebarProps {
  wedding: Wedding;
}

export function BookingSidebar({ wedding }: BookingSidebarProps) {
  const { user, addBooking } = useAuth();
  const router = useRouter();

  const [guestsCount, setGuestsCount] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "traveler") {
      alert("Only traveler accounts can request booking spots for wedding experiences.");
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
        pricePerGuest: wedding.pricePerGuest,
        guestsCount,
        status: "pending"
      });
      setIsBooked(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit booking request. Please try again.");
    }
  };

  const totalPrice = wedding.pricePerGuest * guestsCount;

  return (
    <aside className="sticky top-28 bg-white border border-warm-200/60 rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(107,16,38,0.08)] flex flex-col gap-6" aria-label="Booking widget">
      {/* Price Header */}
      <div className="flex justify-between items-baseline pb-4 border-b border-warm-200">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-2xl text-charcoal-900">
              ${wedding.pricePerGuest.toLocaleString()}
            </span>
            <span className="text-xs text-charcoal-400 font-semibold uppercase tracking-wider">/guest</span>
          </div>
          <span className="text-[0.6875rem] text-charcoal-400 font-medium">All-Inclusive Experience</span>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            <ShieldCheck size={12} />
            Vetted Host
          </span>
        </div>
      </div>

      {/* Slots Info */}
      <div className="flex items-center justify-between p-3.5 bg-warm-50 border border-warm-200/50 rounded-2xl">
        <div className="flex items-center gap-2 text-charcoal-700">
          <Users size={16} className="text-[var(--color-brand-primary)]" />
          <span className="text-xs font-semibold">Guest Slots Available</span>
        </div>
        <span className="text-xs font-bold text-charcoal-900 bg-white border border-warm-200 px-3 py-1 rounded-lg">
          {availableSlots} / {wedding.guestsAllowed} Left
        </span>
      </div>

      {/* Booking Form Fields */}
      <div className="flex flex-col gap-3">
        {/* Date Select (Read-only since it's a specific wedding event) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="booking-date" className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest">
            Wedding Date
          </label>
          <input
            id="booking-date"
            type="text"
            value={new Date(wedding.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            disabled
            className="input-luxury bg-warm-50 text-charcoal-500 cursor-not-allowed font-semibold border-warm-200"
          />
        </div>

        {/* Guests Count select */}
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
      </div>

      {/* Price Summary Calculation */}
      {guestsCount > 0 && (
        <div className="space-y-3 pt-3 border-t border-warm-200">
          <div className="flex justify-between text-sm text-charcoal-600">
            <span>${wedding.pricePerGuest.toLocaleString()} × {guestsCount} guests</span>
            <span className="font-semibold text-charcoal-900">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal-600">
            <span>Platform Service Fee</span>
            <span className="font-semibold text-charcoal-900">$0</span>
          </div>
          <hr className="border-warm-100" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-charcoal-800">Total Price</span>
            <span className="font-display font-bold text-charcoal-950">${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

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
          Book Spot
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
          Every host family goes through a background check and in-person verification. Booking fees are held securely in trust until check-in.
        </p>
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
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-xl">
                ✓
              </div>
              <h4 className="font-display font-bold text-lg text-charcoal-900">
                Reservation Requested!
              </h4>
              <p className="text-charcoal-600 text-sm">
                Your reservation request for {guestsCount} guest spot(s) has been sent to {wedding.hostName}.
              </p>
              <div className="text-xs bg-warm-50 border border-warm-100 p-3 rounded-xl text-charcoal-500">
                Order Total: ${totalPrice.toLocaleString()} (Hold only)
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
    </aside>
  );
}

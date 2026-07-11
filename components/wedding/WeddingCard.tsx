"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Heart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";

interface WeddingCardProps {
  wedding: Wedding;
  className?: string;
}

export function WeddingCard({ wedding, className }: WeddingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;
  const occupancyPercent = Math.round(
    (wedding.guestsBooked / wedding.guestsAllowed) * 100
  );
  const isAlmostFull = availableSlots <= 30;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative bg-white rounded-3xl overflow-hidden border border-warm-200/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_-12px_rgba(107,16,38,0.12)] transition-all duration-500 flex flex-col h-full",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden z-0">
        <Image
          src={wedding.imageUrl}
          alt={wedding.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent" />

        {/* Style Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[var(--color-brand-primary)] text-[0.6875rem] font-bold uppercase tracking-wider px-3.5 py-2 rounded-full shadow-sm border border-warm-100">
            🪔 {wedding.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-charcoal-500 hover:text-[var(--color-brand-primary)] active:scale-95 transition-all shadow-sm border border-warm-100"
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              className={cn("transition-colors", isSaved && "fill-[var(--color-brand-primary)] text-[var(--color-brand-primary)]")}
            />
          </button>
        </div>

        {/* Couple & Location Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
              <Image
                src={wedding.coupleImage || wedding.hostAvatar}
                alt={wedding.coupleName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold drop-shadow-sm">
                {wedding.coupleName}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-[0.6875rem] drop-shadow-sm truncate">
                <MapPin size={10} className="flex-shrink-0" />
                {wedding.city}, {wedding.state}
              </div>
            </div>
          </div>

          {wedding.isVerified && (
            <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-md">
              <ShieldCheck size={11} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/weddings/${wedding.slug}`} className="flex-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
            <h3 className="font-display font-bold text-lg text-charcoal-900 leading-snug line-clamp-2">
              {wedding.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0 bg-warm-50 border border-warm-100 rounded-lg px-2 py-1">
            <Star size={13} className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]" />
            <span className="text-xs font-bold text-charcoal-900">{wedding.rating}</span>
            <span className="text-[0.625rem] text-charcoal-400">({wedding.reviewCount})</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5" aria-label="Highlights">
          {wedding.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[0.625rem] font-semibold text-charcoal-600 bg-warm-100/70 border border-warm-200/50 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Booking slots progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-charcoal-600 font-medium">
              <Users size={12} />
              <span>
                <strong className="text-charcoal-900">{availableSlots}</strong> slots left
              </span>
            </div>
            {isAlmostFull && (
              <span className="text-[0.625rem] font-bold text-[var(--color-brand-primary)] uppercase tracking-wider bg-maroon-50 border border-maroon-100 px-2 py-0.5 rounded-md animate-pulse">
                Selling Out
              </span>
            )}
          </div>
          <div
            className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden border border-warm-200/30"
            role="progressbar"
            aria-valuenow={occupancyPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isAlmostFull ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-brand-secondary)]"
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Footer / Price & Call-to-action */}
        <div className="flex items-center justify-between pt-3.5 border-t border-warm-100 mt-auto">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-black text-xl text-charcoal-900">
                ${wedding.pricePerGuest.toLocaleString()}
              </span>
              <span className="text-[0.6875rem] text-charcoal-400 font-semibold uppercase tracking-wider">/guest</span>
            </div>
            <span className="text-[0.625rem] text-charcoal-400 font-medium block">All Inclusive</span>
          </div>
          
          <Link
            href={`/weddings/${wedding.slug}`}
            className="btn btn-primary btn-sm px-5 py-2.5 shadow-md flex items-center gap-1"
          >
            Book Spot
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

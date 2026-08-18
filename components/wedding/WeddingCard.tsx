"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Heart, Calendar, Sparkles, ShieldCheck } from "lucide-react";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=85";

interface WeddingCardProps {
  wedding: Wedding;
  className?: string;
  hidePrice?: boolean;
}

export function WeddingCard({ wedding, className, hidePrice = false }: WeddingCardProps) {
  const { toggleWishlist, wishlist } = useAuth();
  const [imgSrc, setImgSrc] = useState(wedding.imageUrl || FALLBACK_IMAGE);

  const tags = wedding.tags ?? [];
  const rating = wedding.rating ?? 0;

  // Capacity & calculations
  const guestsAllowed = wedding.guestsAllowed || 20;
  const isUnlimitedCapacity = !wedding.guestsAllowed || wedding.guestsAllowed <= 0;
  const availableSlots = isUnlimitedCapacity
    ? 20
    : Math.max(0, guestsAllowed - (wedding.guestsBooked || 0));
  const isSoldOut = wedding.isDemo === true || wedding.availabilityStatus === "FULLY_BOOKED" || (!isUnlimitedCapacity && availableSlots <= 0);
  
  const displayPriceUSD = typeof wedding.pricePerGuest === "number" && wedding.pricePerGuest > 0
    ? wedding.pricePerGuest
    : 149;
  const durationDays = wedding.durationDays || 3;
  const ceremoniesCount = wedding.ceremoniesCount || (wedding.timeline?.length || 3);
  const isWishlisted = wishlist.includes(wedding.id);
  const isSponsored = Boolean(wedding.sponsored);

  return (
    <div
      className={cn(
        "relative group/sponsored h-full flex flex-col",
        isSponsored ? "p-[2.5px] rounded-2xl" : "",
        className
      )}
    >
      <style>{`
        @keyframes sponsoredSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sponsored-ring-anim {
          animation: sponsoredSpin 5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sponsored-ring-anim {
            animation: none !important;
          }
        }
      `}</style>

      {/* Rotating conic-gradient ring around sponsored card */}
      {isSponsored && (
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0"
          aria-hidden="true"
        >
          <div
            className="sponsored-ring-anim absolute inset-[-100%] opacity-85 transition-opacity duration-300 group-hover/sponsored:opacity-100"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-brand-secondary) 0%, var(--color-brand-primary) 30%, #fcd34d 50%, var(--color-brand-primary) 70%, var(--color-brand-secondary) 100%)",
            }}
          />
        </div>
      )}

      <article
        className={cn(
          "card-luxury group h-full flex flex-col bg-white transition-all duration-300 relative z-10 overflow-hidden",
          isSponsored
            ? "rounded-[14px] shadow-xl shadow-amber-500/10 hover:shadow-amber-500/25"
            : "rounded-2xl border border-warm-200/60 hover:shadow-lg hover:border-warm-300"
        )}
        aria-labelledby={`wedding-title-${wedding.id}`}
        data-testid="wedding-card"
      >
        {/* Top Banner for Sponsored Listings */}
        {isSponsored && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-[0.625rem] font-extrabold tracking-widest uppercase py-1.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-inner border-b border-amber-400/30">
            <Sparkles size={11} className="text-amber-200 animate-pulse" aria-hidden="true" />
            <span>Sponsored Experience</span>
            <Sparkles size={11} className="text-amber-200 animate-pulse" aria-hidden="true" />
          </div>
        )}

        {/* Image Frame */}
        <div className="relative overflow-hidden bg-warm-100 flex-shrink-0" style={{ aspectRatio: "4/3" }}>
          <Image
            src={imgSrc}
            alt={`${wedding.title} wedding in ${wedding.location}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            aria-hidden="true"
          />

          {/* Badges Top Left & Center */}
          <div className="absolute top-3 left-3 right-14 flex items-center gap-1.5 flex-wrap z-10">
            {/* Prominent Multi-Day Badge */}
            <span className="inline-flex items-center gap-1 bg-charcoal-900/90 backdrop-blur-md text-amber-300 text-[0.6875rem] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-amber-400/30">
              <Calendar size={11} className="text-amber-300" />
              {durationDays} {durationDays === 1 ? "DAY" : "DAYS"}
            </span>

            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[var(--color-brand-primary)] text-[0.6875rem] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {wedding.category}
            </span>

            {isSoldOut && (
              <span className="inline-flex items-center gap-1 bg-amber-950/85 backdrop-blur-sm text-amber-200 text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30">
                Fully Booked
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(wedding.id);
            }}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              className={cn("transition-colors", isWishlisted && "fill-red-500 text-red-500")}
            />
          </button>

          {/* Location & Religion on Image bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={13} className="text-amber-300 flex-shrink-0" />
              <span className="truncate font-semibold drop-shadow-sm">
                {wedding.city ? `${wedding.city}, ${wedding.state || wedding.region || "India"}` : wedding.location}
              </span>
            </div>

            {wedding.religion && (
              <span className="text-[0.6875rem] font-medium text-warm-200/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                {wedding.religion}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3
                id={`wedding-title-${wedding.id}`}
                className="font-display font-bold text-lg text-charcoal-900 line-clamp-1 group-hover:text-[var(--color-brand-primary)] transition-colors"
              >
                {wedding.title}
              </h3>
              {wedding.isVerified && !wedding.isDemo && (
                <span className="text-emerald-600 flex-shrink-0" title="Verified Host Celebration">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
              {wedding.story}
            </p>

            {/* Structured Multi-Day Details & Highlights */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-charcoal-700 bg-warm-50 px-2 py-1 rounded-md border border-warm-200/60">
                <Sparkles size={11} className="text-[var(--color-brand-primary)]" />
                {ceremoniesCount} {ceremoniesCount === 1 ? "Event & Ceremony" : "Events & Ceremonies"}
              </span>

              {guestsAllowed > 0 && (
                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-charcoal-700 bg-warm-50 px-2 py-1 rounded-md border border-warm-200/60">
                  <Users size={11} className="text-[var(--color-brand-primary)]" />
                  Up to {guestsAllowed} international guests
                </span>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-warm-100">
            {hidePrice ? (
              // Emotional / Visual Selling on Homepage (NO PRICE)
              <div>
                <span className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] uppercase tracking-wider block">
                  {durationDays}-Day Celebration
                </span>
                <span className="text-[0.6875rem] font-medium text-charcoal-500">
                  {wedding.community || wedding.region || "Authentic Tradition"}
                </span>
              </div>
            ) : (
              // Marketplace & Discovery Detail Price
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-charcoal-900">
                    ${displayPriceUSD}
                  </span>
                  <span className="text-xs font-medium text-charcoal-500">/guest</span>
                </div>
                <span className="text-[0.625rem] font-medium text-charcoal-400">All-Inclusive Pass</span>
              </div>
            )}

            <Link
              href={`/weddings/${wedding.slug}`}
              className="btn btn-primary btn-sm font-bold transition-all inline-flex items-center gap-1 shadow-xs"
              aria-label={`Explore experience details for ${wedding.title}`}
            >
              {hidePrice ? "Explore Wedding" : "View Experience"}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
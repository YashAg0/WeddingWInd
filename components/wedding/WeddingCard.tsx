"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Heart, Calendar, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { resolveWeddingVisualProfile } from "@/lib/wedding-images";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80";

interface WeddingCardProps {
  wedding: Wedding;
  className?: string;
  hidePrice?: boolean;
}

function formatTierLabel(tier?: string, category?: string): string {
  if (!tier && !category) return "Traditional";
  const str = (tier || category || "").toUpperCase().trim();
  if (str === "SIGNATURE_ROYAL" || str === "SIGNATURE ROYAL") return "Signature Royal";
  if (str === "ROYAL") return "Royal";
  if (str === "GRAND") return "Grand";
  if (str === "ENHANCED") return "Enhanced";
  if (str === "STANDARD") return "Standard";
  return category || "Traditional";
}

export function WeddingCard({ wedding, className, hidePrice = false }: WeddingCardProps) {
  const { toggleWishlist, wishlist } = useAuth();
  const visualProfile = resolveWeddingVisualProfile(wedding);
  const initialImg = wedding.imageUrl || visualProfile.imageUrl || FALLBACK_IMAGE;
  const [imgSrc, setImgSrc] = useState(initialImg);
  const objectPosition = wedding.objectPosition || visualProfile.objectPosition || "center 35%";

  // Capacity & calculations
  const guestsAllowed = wedding.guestsAllowed || 20;
  const isUnlimitedCapacity = !wedding.guestsAllowed || wedding.guestsAllowed <= 0;
  const availableSlots = isUnlimitedCapacity
    ? 20
    : Math.max(0, guestsAllowed - (wedding.guestsBooked || 0));
  const isSoldOut =
    wedding.isDemo === true ||
    wedding.availabilityStatus === "FULLY_BOOKED" ||
    (!isUnlimitedCapacity && availableSlots <= 0);

  const displayPriceUSD =
    typeof wedding.pricePerGuest === "number" && wedding.pricePerGuest > 0
      ? wedding.pricePerGuest
      : 149;
  const durationDays = wedding.durationDays || 1;
  const ceremoniesCount =
    wedding.ceremoniesCount || (wedding.timeline?.length || durationDays);
  const isWishlisted = wishlist.includes(wedding.id);
  const isSponsored = Boolean(wedding.sponsored);
  const isFeatured = !isSponsored && Boolean(wedding.featured);
  const tierDisplay = formatTierLabel(wedding.tier, wedding.category);

  // Location display: prefer city+state, fallback to location
  const locationDisplay = wedding.city
    ? `${wedding.city}, ${wedding.state || wedding.region || "India"}`
    : wedding.location || "India";

  // Community/tradition display for footer
  const traditionDisplay = wedding.community || wedding.region || "India";

  return (
    <div
      className={cn(
        "relative group/card h-full flex flex-col w-full transition-all duration-300",
        isSponsored
          ? "sponsored-luxury-frame p-[3.5px] rounded-2xl shadow-md hover:shadow-2xl hover:shadow-amber-500/28 transform hover:-translate-y-1.5"
          : isFeatured
          ? "featured-luxury-frame p-[1.5px] rounded-2xl shadow-sm hover:shadow-xl hover:shadow-amber-900/15 transform hover:-translate-y-1"
          : "hover:transform hover:-translate-y-1",
        className
      )}
      data-testid="wedding-card-container"
    >
      <style>{`
        @keyframes luxuryGoldSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .sponsored-luxury-frame {
          background: linear-gradient(
            135deg,
            #8f6b1f 0%,
            #d4af37 20%,
            #f4d77a 40%,
            #ffe9a6 50%,
            #d4af37 65%,
            #b8860b 80%,
            #8f6b1f 100%
          );
          background-size: 250% 250%;
          animation: luxuryGoldSweep 6s ease-in-out infinite;
          box-shadow: 0 8px 24px -2px rgba(212, 175, 55, 0.22), 0 2px 8px -1px rgba(0, 0, 0, 0.06);
        }
        .featured-luxury-frame {
          background: linear-gradient(
            135deg,
            #7a1c32 0%,
            #d4af37 50%,
            #581022 100%
          );
          box-shadow: 0 3px 16px -2px rgba(122, 28, 50, 0.12);
        }
        @media (prefers-reduced-motion: reduce) {
          .sponsored-luxury-frame, .featured-luxury-frame {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <article
        className={cn(
          "group h-full flex flex-col bg-white transition-all duration-300 relative z-10 overflow-hidden",
          isSponsored
            ? "rounded-[13px] border border-amber-200/50 shadow-[inset_0_0_8px_rgba(212,175,55,0.08)]"
            : isFeatured
            ? "rounded-[14.5px] border border-amber-300/40 hover:shadow-[0_8px_32px_0_rgba(107,16,38,0.14)]"
            : "rounded-2xl border border-warm-200/70 hover:shadow-[0_8px_32px_0_rgba(107,16,38,0.12)] hover:border-warm-300"
        )}
        aria-labelledby={`wedding-title-${wedding.id}`}
        data-testid="wedding-card"
      >
        {/* ── IMAGE FRAME ─────────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden bg-warm-100 flex-shrink-0" style={{ aspectRatio: "16/10" }}>
          <Image
            src={imgSrc}
            alt={visualProfile.altText || `Authentic ${wedding.title} wedding celebration in ${locationDisplay}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover/card:scale-105"
            style={{ objectPosition }}
            loading="lazy"
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
            }}
          />

          {/* Subtle overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
            aria-hidden="true"
          />

          {/* ── ROW 1 (TOP BAR): Left = Duration, Right = Wishlist ──────────── */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            {/* Top-Left: Duration Pill (Non-interactive informational badge) */}
            <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-md text-amber-300 text-[0.6875rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-400/30 shadow-xs pointer-events-none">
              <Calendar size={11} className="text-amber-300 flex-shrink-0" aria-hidden="true" />
              <span>{durationDays} {durationDays === 1 ? "Day" : "Days"}</span>
            </span>

            {/* Top-Right: Wishlist Heart (Independent Click Control on z-20) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(wedding.id);
              }}
              className="relative z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              aria-label={isWishlisted ? `Remove ${wedding.title} from wishlist` : `Add ${wedding.title} to wishlist`}
            >
              <Heart
                size={15}
                className={cn("transition-colors", isWishlisted && "fill-red-500 text-red-500")}
              />
            </button>
          </div>

          {/* ── ROW 2: Dedicated Promotion Ribbon (SPONSORED > FEATURED > NORMAL) ── */}
          {isSponsored ? (
            <div className="absolute top-11 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-[#130206]/95 backdrop-blur-md text-[#fef08a] text-[0.625rem] font-extrabold uppercase tracking-[0.16em] px-2.5 py-1 rounded-md border border-[#d4af37]/60 shadow-[0_2px_8px_rgba(212,175,55,0.25)] whitespace-nowrap flex-shrink-0">
                <Sparkles size={10} className="text-[#fde047] flex-shrink-0" aria-hidden="true" />
                <span>✦ SPONSORED</span>
              </span>
            </div>
          ) : isFeatured ? (
            <div className="absolute top-11 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-[#4a081a]/90 backdrop-blur-md text-amber-200 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] px-2.5 py-1 rounded-md border border-amber-400/40 shadow-xs whitespace-nowrap flex-shrink-0">
                <span>★ FEATURED</span>
              </span>
            </div>
          ) : (
            <div className="absolute top-11 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center bg-white/95 backdrop-blur-sm text-[var(--color-brand-primary)] text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md shadow-xs">
                {tierDisplay}
              </span>
            </div>
          )}

          {/* ── BOTTOM: Location + Availability ───────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 z-10 flex items-end justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="text-amber-300 flex-shrink-0 drop-shadow" aria-hidden="true" />
              <span className="text-white text-xs font-semibold truncate drop-shadow-md">
                {locationDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 pointer-events-none">
              {isSoldOut && (
                <span className="inline-flex items-center bg-black/75 backdrop-blur-md text-amber-200 text-[0.6125rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-400/30 whitespace-nowrap">
                  Fully Booked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── STRETCHED PRIMARY CARD LINK (Overlays card body and image) ─────── */}
        <Link
          href={`/weddings/${wedding.slug}`}
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2"
          aria-label={`View ${wedding.title} celebration in ${locationDisplay}`}
        />

        {/* ── CARD BODY ────────────────────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Title + Verified */}
          <div className="flex items-start justify-between gap-2">
            <h3
              id={`wedding-title-${wedding.id}`}
              className="font-display font-bold text-[0.9375rem] sm:text-base text-charcoal-900 line-clamp-2 group-hover/card:text-[var(--color-brand-primary)] transition-colors leading-snug flex-1 min-w-0"
              title={wedding.title}
            >
              {wedding.title}
            </h3>
            {wedding.isVerified && !wedding.isDemo && (
              <span
                className="text-emerald-600 flex-shrink-0 mt-0.5"
                title="Verified Host Celebration"
              >
                <ShieldCheck size={15} />
              </span>
            )}
          </div>

          {/* Description — fixed 2-line slot (hidden on mobile for compact density) */}
          <p className="hidden sm:block text-xs text-charcoal-500 line-clamp-2 leading-relaxed flex-1">
            {wedding.story || "An authentic Indian wedding celebration welcoming international guests."}
          </p>

          {/* Meta row — ceremonies + capacity + tier */}
          <div className="flex items-center gap-2 text-xs text-charcoal-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Sparkles size={10} className="text-[var(--color-brand-primary)]" aria-hidden="true" />
              {ceremoniesCount} {ceremoniesCount === 1 ? "event" : "events"}
            </span>
            <span className="text-warm-300" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Users size={10} className="text-[var(--color-brand-primary)]" aria-hidden="true" />
              Up to {guestsAllowed} guests
            </span>
            {isSponsored && (
              <>
                <span className="text-warm-300" aria-hidden="true">·</span>
                <span className="text-[0.625rem] font-bold text-amber-700 uppercase tracking-wide">
                  {tierDisplay}
                </span>
              </>
            )}
          </div>

          {/* ── FOOTER ────────────────────────────────────────────────────── */}
          <div className="border-t border-warm-100 pt-3 mt-auto">
            {hidePrice ? (
              // Homepage: duration + tradition label, then full-width CTA
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] uppercase tracking-wider leading-tight whitespace-nowrap">
                    {durationDays}-Day Celebration
                  </span>
                  <span className="text-[0.625rem] text-charcoal-400 truncate text-right">
                    {traditionDisplay}
                  </span>
                </div>
                <div
                  className="btn btn-primary w-full text-xs font-bold py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-xs group/btn pointer-events-none group-hover/card:bg-maroon-800"
                  aria-hidden="true"
                >
                  <span>Explore Celebration</span>
                  <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                </div>
              </div>
            ) : (
              // Marketplace: price + CTA side by side
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-lg text-charcoal-900">
                      ${displayPriceUSD.toLocaleString()}
                    </span>
                    <span className="text-xs text-charcoal-500">/guest</span>
                  </div>
                  <div className="text-[0.625rem] text-charcoal-400">Experience Pass</div>
                </div>
                <div
                  className="btn btn-primary text-xs font-bold py-2 px-4 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs group/btn flex-shrink-0 whitespace-nowrap pointer-events-none group-hover/card:bg-maroon-800"
                  aria-hidden="true"
                >
                  <span>View</span>
                  <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Heart, Calendar, Sparkles } from "lucide-react";
import type { Wedding } from "@/types";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { PRICING_TIERS } from "@/lib/constants/financial-model";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=85";

interface WeddingCardProps {
  wedding: Wedding;
  className?: string;
}

export function WeddingCard({ wedding, className }: WeddingCardProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, wishlist, user } = useAuth();
  const [imgSrc, setImgSrc] = useState(wedding.imageUrl || FALLBACK_IMAGE);
  const [avatarSrc, setAvatarSrc] = useState(wedding.hostAvatar || FALLBACK_AVATAR);

  const tags = wedding.tags ?? [];
  const rating = wedding.rating ?? 0;

  // Clamp so bad/overbooked data can never produce negative slots or false fully booked status
  const isUnlimitedCapacity = !wedding.guestsAllowed || wedding.guestsAllowed <= 0;
  const availableSlots = isUnlimitedCapacity
    ? 20
    : Math.max(0, wedding.guestsAllowed - wedding.guestsBooked);
  const occupancyPercent = isUnlimitedCapacity
    ? 20
    : Math.min(
        100,
        Math.max(0, Math.round((wedding.guestsBooked / wedding.guestsAllowed) * 100))
      );
  const isAlmostFull = !isUnlimitedCapacity && availableSlots > 0 && availableSlots <= 5;
  const isSoldOut = !isUnlimitedCapacity && availableSlots <= 0;
  const displayPriceINR = wedding.pricePerGuest || PRICING_TIERS.PREMIUM.priceINR;
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

      {/* Rotating conic-gradient ring around sponsored card — inspired directly by the Navbar logo animation */}
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
            : "rounded-2xl"
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

        {/* Image — consistent 4:3 ratio for perfect grid alignment */}
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

          {/* Rich gradient overlay — readable text at all times */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-maroon-950/85 via-maroon-950/20 to-transparent"
            aria-hidden="true"
          />

          {/* Category & Discovery badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[var(--color-brand-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {wedding.category}
            </span>
            {isSponsored && (
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-charcoal-950 text-[0.65rem] font-black tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md border border-amber-200/80">
                <Sparkles size={11} className="text-charcoal-950 fill-current" />
                Sponsored
              </span>
            )}
            {wedding.featured && (
              <span className="inline-flex items-center gap-1 bg-[var(--color-brand-primary)] text-white text-[0.625rem] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-full shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                router.push("/login");
                return;
              }
              toggleWishlist(wedding.id);
            }}
            className={cn(
              "absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-sm border",
              isWishlisted
                ? "bg-[var(--color-brand-primary)] text-white border-transparent"
                : "bg-white/90 text-charcoal-400 hover:text-[var(--color-brand-primary)] border-white/60 hover:scale-110"
            )}
            aria-label={
              isWishlisted
                ? `Remove ${wedding.title} from wishlist`
                : `Save ${wedding.title} to wishlist`
            }
          >
            <Heart size={16} className={isWishlisted ? "fill-current" : ""} aria-hidden="true" />
          </button>

          {/* Location overlay at bottom of image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 z-10">
            <MapPin size={14} className="text-gold-300 flex-shrink-0" aria-hidden="true" />
            <span className="text-white text-sm font-medium truncate drop-shadow-md">
              {wedding.location}
            </span>
          </div>
        </div>

        {/* Content — flex-1 fills remaining space so footer stays pinned */}
        <div className="p-5 flex flex-col gap-3.5 flex-1">
          {/* Title + Rating row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              id={`wedding-title-${wedding.id}`}
              className="font-display font-bold text-base text-charcoal-900 leading-snug line-clamp-2 flex-1"
            >
              {wedding.title}
            </h3>
            {wedding.reviewCount > 0 ? (
              <div className="flex items-center gap-1 flex-shrink-0 bg-warm-50 border border-warm-100 rounded-lg px-2 py-1">
                <Star
                  size={13}
                  className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                  aria-hidden="true"
                />
                <span className="text-xs font-bold text-charcoal-900">{rating.toFixed(1)}</span>
                <span className="text-[0.625rem] text-charcoal-400">({wedding.reviewCount})</span>
              </div>
            ) : (
              <span className="flex-shrink-0 text-[0.625rem] font-semibold text-[var(--color-brand-secondary)] bg-gold-50 border border-gold-100 rounded-lg px-2 py-1">
                New
              </span>
            )}
          </div>

          {/* Host row */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-brand-secondary)]/30 shadow-sm bg-warm-100">
              <Image
                src={avatarSrc}
                alt={wedding.hostName}
                fill
                sizes="28px"
                className="object-cover"
                onError={() => setAvatarSrc(FALLBACK_AVATAR)}
              />
            </div>
            <span className="text-sm text-charcoal-600 line-clamp-1">
              Hosted by <span className="font-semibold text-charcoal-900">{wedding.hostName}</span>
            </span>
          </div>

          {/* Date if available */}
          {wedding.date && (
            <div className="flex items-center gap-2 text-xs text-charcoal-500">
              <Calendar size={13} className="text-[var(--color-brand-secondary)]" aria-hidden="true" />
              <span>
                {new Date(wedding.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap" aria-label="Wedding highlights">
              {tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[0.7rem] font-semibold text-charcoal-700 bg-warm-100/80 px-2.5 py-1 rounded-lg border border-warm-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Availability badge & status */}
          <div className="mt-auto">
            {wedding.isDemo ? (
              <div className="flex items-center justify-between p-2.5 bg-warm-100/80 border border-warm-200/70 rounded-xl">
                <div className="flex items-center gap-1.5 text-charcoal-700 font-medium text-xs">
                  <Users size={13} className="text-charcoal-500" aria-hidden="true" />
                  <span>Availability</span>
                </div>
                <span className="font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md text-[0.6875rem]">
                  Fully Booked
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-charcoal-600">
                    <Users size={13} aria-hidden="true" />
                    <span className="text-xs">
                      {isSoldOut ? (
                        <span className="font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                          Fully Booked
                        </span>
                      ) : (
                        <>
                          <span className="font-bold text-charcoal-900">{availableSlots}</span> seats remaining
                        </>
                      )}
                    </span>
                  </div>
                  {!isSoldOut && isAlmostFull && (
                    <span className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] animate-pulse-gold px-2 py-0.5 rounded-full bg-maroon-50">
                      Almost full!
                    </span>
                  )}
                </div>
                <div
                  className="h-1.5 w-full rounded-full bg-warm-200 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={isSoldOut ? 100 : occupancyPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={isSoldOut ? "100% booked" : `${occupancyPercent}% booked`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isSoldOut
                        ? "bg-amber-600"
                        : isAlmostFull
                        ? "bg-[var(--color-brand-primary)]"
                        : "bg-[var(--color-brand-secondary)]"
                    )}
                    style={{ width: `${isSoldOut ? 100 : occupancyPercent}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Price + CTA — pinned to card bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-warm-100">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-xl text-charcoal-900">
                  {formatPrice(displayPriceINR).primary}
                </span>
                <span className="text-sm font-medium text-charcoal-500">/guest</span>
              </div>
              <span className="text-xs font-medium text-charcoal-400">Experience pass</span>
            </div>
            <Link
              href={`/weddings/${wedding.slug}`}
              className={cn(
                "btn btn-sm font-bold transition-all",
                wedding.isDemo || isSoldOut
                  ? "bg-warm-100 hover:bg-warm-200 text-charcoal-800 border border-warm-300 shadow-xs"
                  : "btn-primary"
              )}
              aria-label={`View experience details for ${wedding.title}`}
            >
              View Experience
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
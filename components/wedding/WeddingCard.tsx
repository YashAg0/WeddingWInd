"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Heart } from "lucide-react";
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

  // Clamp so bad/overbooked data can never produce negative slots or a >100% bar
  const availableSlots = Math.max(0, wedding.guestsAllowed - wedding.guestsBooked);
  const occupancyPercent = Math.min(
    100,
    Math.max(0, Math.round((wedding.guestsBooked / wedding.guestsAllowed) * 100))
  );
  const isAlmostFull = availableSlots <= 30;

  const displayPriceINR = wedding.pricePerGuest || PRICING_TIERS.CULTURAL_GUEST.priceINR;
  const isWishlisted = wishlist.includes(wedding.id);

  return (
    <article
      className={cn("card group h-full flex flex-col", className)}
      aria-labelledby={`wedding-title-${wedding.id}`}
    >
      {/* Image */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-warm-100 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={`${wedding.title} wedding in ${wedding.location}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-maroon-900/80 via-maroon-900/20 to-transparent"
          aria-hidden="true"
        />

        {/* Category & Curated badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[var(--color-brand-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {wedding.category}
          </span>
          {wedding.isCurated && (
            <span className="inline-flex items-center gap-1 bg-[var(--color-brand-primary)] text-white text-[0.625rem] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-full shadow-sm">
              {wedding.curatedBadge || "Verified Showcase"}
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
            "absolute top-3 right-3 z-10 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm",
            isWishlisted
              ? "bg-[var(--color-brand-primary)] text-white"
              : "bg-white/90 text-charcoal-400 hover:text-[var(--color-brand-primary)]"
          )}
          aria-label={
            isWishlisted
              ? `Remove ${wedding.title} from wishlist`
              : `Save ${wedding.title} to wishlist`
          }
        >
          <Heart size={15} className={isWishlisted ? "fill-current" : ""} aria-hidden="true" />
        </button>

        {/* Location overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 z-10">
          <MapPin size={14} className="text-white flex-shrink-0" aria-hidden="true" />
          <span className="text-white text-sm font-medium truncate drop-shadow-md">
            {wedding.location}
          </span>
        </div>
      </div>

      {/* Content — flex-1 makes this fill whatever space is left in the card,
          so the footer below can be pinned to the bottom */}
      <div className="p-4 flex flex-col gap-3 flex-1">
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
            <span className="flex-shrink-0 text-[0.625rem] font-semibold text-charcoal-400 bg-warm-50 border border-warm-100 rounded-lg px-2 py-1">
              New celebration
            </span>
          )}
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-warm-200 shadow-sm bg-warm-100">
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
            Hosted by <span className="font-bold text-charcoal-900">{wedding.hostName}</span>
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap" aria-label="Wedding highlights">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[0.75rem] font-semibold text-charcoal-700 bg-warm-100/80 px-2.5 py-1 rounded-md border border-warm-200 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Availability bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-charcoal-600">
              <Users size={14} aria-hidden="true" />
              <span className="text-sm">
                <span className="font-bold text-charcoal-900">{availableSlots}</span> slots left
              </span>
            </div>
            {isAlmostFull && (
              <span className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] animate-pulse-gold px-2 py-0.5 rounded-full bg-maroon-50">
                Almost full!
              </span>
            )}
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-warm-200 overflow-hidden"
            role="progressbar"
            aria-valuenow={occupancyPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${occupancyPercent}% booked`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isAlmostFull ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-brand-secondary)]"
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Price + CTA — mt-auto pins this to the bottom of the card no matter
            how much content (tags, title lines, badges) sits above it */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-warm-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-xl text-charcoal-900">
                {formatPrice(displayPriceINR).primary}
              </span>
              <span className="text-sm font-medium text-charcoal-500">/guest</span>
            </div>
            <span className="text-xs font-medium text-charcoal-500">All inclusive</span>
          </div>
          <Link
            href={`/weddings/${wedding.slug}`}
            className="btn btn-primary btn-sm"
            aria-label={`Reserve your seat at ${wedding.title}`}
          >
            Reserve Your Seat
          </Link>
        </div>
      </div>
    </article>
  );
}
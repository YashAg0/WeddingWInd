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

interface WeddingCardProps {
  wedding: Wedding;
  className?: string;
}

export function WeddingCard({ wedding, className }: WeddingCardProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, wishlist, user } = useAuth();
  const [imgSrc, setImgSrc] = useState(
    wedding.imageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85"
  );
  const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;
  const occupancyPercent = Math.round(
    (wedding.guestsBooked / wedding.guestsAllowed) * 100
  );
  const isAlmostFull = availableSlots <= 30;

  const displayPriceINR = wedding.pricePerGuest || PRICING_TIERS.CULTURAL_GUEST.priceINR;
  const isWishlisted = wishlist.includes(wedding.id);

  return (
    <article
      className={cn("card group cursor-pointer", className)}
      aria-label={`${wedding.title} in ${wedding.location}`}
      onClick={() => { router.push(`/weddings/${wedding.slug}`); }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/weddings/${wedding.slug}`); } }}
    >
      {/* Image */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-warm-100">
        <Image
          src={imgSrc}
          alt={`${wedding.title} wedding in ${wedding.location}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={() => {
            setImgSrc("https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85");
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[var(--color-brand-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {wedding.category}
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              router.push('/login');
              return;
            }
            toggleWishlist(wedding.id);
          }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm",
            isWishlisted
              ? "bg-[var(--color-brand-primary)] text-white"
              : "bg-white/90 text-charcoal-400 hover:text-[var(--color-brand-primary)]"
          )}
          aria-label={isWishlisted ? `Remove ${wedding.title} from wishlist` : `Save ${wedding.title} to wishlist`}
        >
          <Heart size={15} className={isWishlisted ? "fill-current" : ""} aria-hidden="true" />
        </button>

        {/* Country + Location overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
          <MapPin size={12} className="text-white/90 flex-shrink-0" aria-hidden="true" />
          <span className="text-white/90 text-xs font-medium truncate">
            {wedding.location}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + Rating row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-charcoal-900 leading-snug line-clamp-2 flex-1">
            {wedding.title}
          </h3>
          {wedding.reviewCount > 0 ? (
            <div className="flex items-center gap-1 flex-shrink-0 bg-warm-50 border border-warm-100 rounded-lg px-2 py-1">
              <Star
                size={13}
                className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-charcoal-900">
                {wedding.rating.toFixed(1)}
              </span>
              <span className="text-[0.625rem] text-charcoal-400">
                ({wedding.reviewCount})
              </span>
            </div>
          ) : (
            <span className="flex-shrink-0 text-[0.625rem] font-semibold text-charcoal-400 bg-warm-50 border border-warm-100 rounded-lg px-2 py-1">
              New listing
            </span>
          )}
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-warm-200">
            <Image
              src={wedding.hostAvatar}
              alt={wedding.hostName}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
          <span className="text-xs text-charcoal-500">
            Hosted by <span className="font-semibold text-charcoal-700">{wedding.hostName}</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap" aria-label="Wedding highlights">
          {wedding.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[0.6875rem] font-medium text-charcoal-500 bg-warm-100 px-2 py-0.5 rounded-full border border-warm-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Availability bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-charcoal-500">
              <Users size={12} aria-hidden="true" />
              <span className="text-xs">
                <span className="font-semibold text-charcoal-700">
                  {availableSlots}
                </span>{" "}
                slots left
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
                isAlmostFull
                  ? "bg-[var(--color-brand-primary)]"
                  : "bg-[var(--color-brand-secondary)]"
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-warm-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-lg text-charcoal-900">
                {formatPrice(displayPriceINR).primary}
              </span>
              <span className="text-xs text-charcoal-400">/guest</span>
            </div>
            <span className="text-[0.6875rem] text-charcoal-400">All inclusive</span>
          </div>
          <Link
            href={`/weddings/${wedding.slug}`}
            className="btn btn-primary btn-sm"
            aria-label={`Book your spot at ${wedding.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            Book Spot
          </Link>
        </div>
      </div>
    </article>
  );
}

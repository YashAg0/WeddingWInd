"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, MapPin, ArrowRight } from "lucide-react";

interface WishlistCardProps {
  wedding: {
    id: string;
    slug: string;
    title: string;
    location: string;
    pricePerGuest: number;
    imageUrl: string;
  };
  onRemove: (weddingId: string) => void;
}

export default function WishlistCard({ wedding, onRemove }: WishlistCardProps) {
  return (
    <div className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row gap-4 p-4 hover:shadow-md transition-shadow duration-200">
      
      {/* Photo frame */}
      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-warm-100">
        <Image
          src={wedding.imageUrl}
          alt={wedding.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Details area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <Link
              href={`/weddings/${wedding.slug}`}
              className="font-display font-bold text-base text-charcoal-900 hover:text-[var(--color-brand-primary)] transition-colors truncate block"
            >
              {wedding.title}
            </Link>
            
            <button
              onClick={() => onRemove(wedding.slug)}
              className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0 cursor-pointer"
              aria-label="Remove from wishlist"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
            <MapPin size={12} className="text-maroon-600 flex-shrink-0" />
            <span className="truncate">{wedding.location}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs border-t border-warm-100/60 pt-3">
          <span className="font-semibold text-charcoal-600">
            From <span className="text-[var(--color-brand-primary)] font-bold">${wedding.pricePerGuest.toLocaleString()}</span> / guest
          </span>
          
          <Link
            href={`/weddings/${wedding.slug}`}
            className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
          >
            <span>View details</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>

    </div>
  );
}

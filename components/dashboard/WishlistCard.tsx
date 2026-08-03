"use client";

import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
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
  const { formatPrice } = useCurrency();
  return (
    <div className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row gap-4 p-4 hover:shadow-md transition-shadow duration-200">

      {/* Photo frame */}
      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-warm-100">
        <Image
          src={wedding.imageUrl}
          alt={wedding.title}
          fill
          sizes="(max-width: 640px) 100vw, 144px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base text-charcoal-900 leading-snug line-clamp-1">
            {wedding.title}
          </h3>
          <div className="flex items-center gap-1 text-charcoal-500 text-xs mt-1">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{wedding.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-charcoal-900">
              {formatPrice(wedding.pricePerGuest || 0).primary}
            </span>
            <span className="text-xs text-charcoal-400 ml-1">/guest</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(wedding.id)}
              className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-charcoal-400 hover:text-red-500 hover:border-red-200 transition-colors"
              aria-label={`Remove ${wedding.title} from wishlist`}
            >
              <Trash2 size={14} />
            </button>
            <Link
              href={`/weddings/${wedding.slug}`}
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              View <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
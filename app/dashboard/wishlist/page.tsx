"use client";

import { useAuth } from "@/context/AuthContext";
import { getWeddings } from "@/lib/actions";
import WishlistCard from "@/components/dashboard/WishlistCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { useState, useEffect } from "react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useAuth();
  const [weddings, setWeddings] = useState<any[]>([]);

  useEffect(() => {
    getWeddings().then(setWeddings).catch(console.error);
  }, []);

  // Match active wishlist IDs or slugs with weddings
  const savedWeddings = weddings.filter((w) => wishlist.includes(w.id) || wishlist.includes(w.slug));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Saved Weddings
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Browse and organize your bookmarked cultural wedding celebrations.
        </p>
      </div>

      {savedWeddings.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save matching weddings from the marketplace to keep track of dates, locations, and pricing options."
          icon="❤️"
          actionText="Explore Weddings"
          actionHref="/weddings"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedWeddings.map((wedding) => (
            <WishlistCard
              key={wedding.id}
              wedding={wedding}
              onRemove={toggleWishlist}
            />
          ))}
        </div>
      )}

    </div>
  );
}

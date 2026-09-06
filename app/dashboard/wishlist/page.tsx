"use client";

import { useAuth } from "@/context/AuthContext";
import { getWeddings } from "@/lib/actions";
import WishlistCard from "@/components/dashboard/WishlistCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { DashboardLoadingState, DashboardErrorState } from "@/components/dashboard/DashboardDataState";
import { useState, useEffect } from "react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, loading, dataLoading, dataError, refreshData } = useAuth();
  const [weddings, setWeddings] = useState<any[]>([]);
  const [weddingsLoading, setWeddingsLoading] = useState(true);

  useEffect(() => {
    getWeddings()
      .then(setWeddings)
      .catch(console.error)
      .finally(() => setWeddingsLoading(false));
  }, []);

  const isBusyLoading = loading || dataLoading || weddingsLoading;

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

      {isBusyLoading && savedWeddings.length === 0 ? (
        <DashboardLoadingState
          message="Loading your saved celebrations..."
          subMessage="Retrieving your bookmarked weddings..."
        />
      ) : dataError && wishlist.length === 0 ? (
        <DashboardErrorState
          title="Unable to load wishlist"
          message={dataError}
          onRetry={refreshData}
        />
      ) : savedWeddings.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save matching weddings from our curated platform to keep track of dates, locations, and pricing options."
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

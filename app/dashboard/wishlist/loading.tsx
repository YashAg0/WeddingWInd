/**
 * app/dashboard/wishlist/loading.tsx
 *
 * Skeletons for Saved Celebrations / Wishlist.
 */
export default function WishlistLoading() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-pulse" aria-label="Loading saved celebrations...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-warm-300 rounded-xl" />
          <div className="h-4 w-72 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-4 w-28 bg-warm-200 rounded" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="h-52 bg-warm-100 w-full" />
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-36 bg-warm-300 rounded" />
                  <div className="h-4 w-16 bg-warm-100 rounded" />
                </div>
                <div className="h-4 w-28 bg-warm-100 rounded" />
              </div>
              <div className="pt-3 border-t border-warm-100 flex items-center justify-between">
                <div className="h-5 w-24 bg-warm-200 rounded" />
                <div className="h-8 w-24 bg-warm-300 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

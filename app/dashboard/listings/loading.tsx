/**
 * app/dashboard/listings/loading.tsx
 *
 * Listings sub-dashboard loading skeleton — shown during async data fetches
 * in the Host Couple / Listings section. Matches the luxury warm theme of WeddingWithIndia.
 */
export default function ListingsLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading Listings...">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-warm-300 rounded-xl" />
          <div className="h-4 w-96 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-warm-200 rounded-xl" />
      </div>

      {/* Listings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-48 bg-warm-200 w-full" />
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-40 bg-warm-300 rounded" />
                  <div className="h-5 w-20 bg-warm-200 rounded-full" />
                </div>
                <div className="h-4 w-32 bg-warm-100 rounded" />
              </div>

              <div className="space-y-2 pt-2 border-t border-warm-100">
                <div className="flex justify-between text-xs text-charcoal-400">
                  <div className="h-3 w-20 bg-warm-100 rounded" />
                  <div className="h-3 w-24 bg-warm-200 rounded" />
                </div>
                <div className="flex justify-between text-xs text-charcoal-400">
                  <div className="h-3 w-24 bg-warm-100 rounded" />
                  <div className="h-3 w-16 bg-warm-200 rounded" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <div className="h-9 flex-1 bg-warm-200 rounded-xl" />
                <div className="h-9 w-10 bg-warm-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

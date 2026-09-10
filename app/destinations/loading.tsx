/**
 * app/destinations/loading.tsx
 *
 * Skeletons for Destinations directory & regional subpages.
 * Prevents layout shift and provides luxury warm loading state.
 */
export default function DestinationsLoading() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20 animate-pulse" aria-label="Loading destinations...">
      <div className="container-luxury space-y-12">
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="h-4 w-36 bg-warm-200/80 rounded-full mx-auto" />
          <div className="h-10 sm:h-12 w-3/4 max-w-xl bg-warm-300 rounded-2xl mx-auto" />
          <div className="h-5 w-full max-w-2xl bg-warm-200/60 rounded-xl mx-auto" />
        </div>

        {/* Destination Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-warm-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Image Skeleton */}
              <div className="h-56 bg-warm-200/60 relative" />

              {/* Content Skeleton */}
              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-warm-300 rounded-lg" />
                    <div className="h-5 w-24 bg-warm-100 rounded-full" />
                  </div>
                  <div className="h-4 w-48 bg-warm-200/70 rounded" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 w-full bg-warm-100 rounded" />
                    <div className="h-3.5 w-5/6 bg-warm-100 rounded" />
                  </div>
                </div>

                <div className="pt-4 border-t border-warm-100 flex items-center justify-between">
                  <div className="h-4 w-28 bg-warm-200/60 rounded" />
                  <div className="h-8 w-24 bg-warm-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

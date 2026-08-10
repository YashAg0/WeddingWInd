/**
 * app/dashboard/events/loading.tsx
 *
 * Events sub-dashboard loading skeleton — shown during async data fetches
 * in the Traveler Event Pass Hub section. Matches the luxury warm theme of WeddingWithIndia.
 */
export default function EventsLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading Event Passes...">
      {/* Header Skeleton */}
      <div className="border-b border-warm-200 pb-6 space-y-2">
        <div className="h-8 w-64 bg-warm-300 rounded-xl" />
        <div className="h-4 w-96 bg-warm-100 rounded-lg" />
      </div>

      {/* Event Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-44 bg-warm-200 w-full" />
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-6 w-44 bg-warm-300 rounded" />
                <div className="h-4 w-32 bg-warm-100 rounded" />
              </div>

              <div className="space-y-2 pt-2 border-t border-warm-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warm-200 rounded-full" />
                  <div className="h-3 w-36 bg-warm-100 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warm-200 rounded-full" />
                  <div className="h-3 w-28 bg-warm-100 rounded" />
                </div>
              </div>

              <div className="pt-2">
                <div className="h-10 w-full bg-warm-300 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

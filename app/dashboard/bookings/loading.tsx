/**
 * app/dashboard/bookings/loading.tsx
 *
 * Bookings sub-dashboard loading skeleton — shown during async data fetches
 * in the Bookings section. Matches the luxury warm theme of WeddingWithIndia.
 */
export default function BookingsLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading Bookings...">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-warm-300 rounded-xl" />
          <div className="h-4 w-80 bg-warm-100 rounded-lg" />
        </div>
        {/* Filter Pills Skeleton */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-warm-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Booking Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-warm-300 rounded" />
                <div className="h-3 w-32 bg-warm-100 rounded" />
              </div>
              <div className="h-6 w-24 bg-warm-200 rounded-full" />
            </div>

            <div className="h-40 bg-warm-100 rounded-xl w-full" />

            <div className="flex justify-between items-center pt-2 border-t border-warm-100">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-warm-100 rounded" />
                <div className="h-5 w-28 bg-warm-300 rounded" />
              </div>
              <div className="h-10 w-32 bg-warm-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

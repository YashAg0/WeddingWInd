/**
 * app/dashboard/loading.tsx
 *
 * Dashboard loading skeleton — shown by Next.js Suspense during
 * dashboard data fetches. Prevents layout shift and blank-screen flashes.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard...">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-warm-200 rounded-xl" />
        <div className="h-4 w-80 bg-warm-100 rounded-lg" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-4 w-28 bg-warm-100 rounded-lg" />
              <div className="w-8 h-8 bg-warm-100 rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-warm-200 rounded-lg" />
            <div className="h-3 w-24 bg-warm-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-warm-200/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-5 w-40 bg-warm-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-warm-100">
                  <div className="h-40 bg-warm-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-36 bg-warm-200 rounded" />
                    <div className="h-3 w-24 bg-warm-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-warm-200/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-5 w-40 bg-warm-200 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start py-2 border-b border-warm-50 last:border-0">
                <div className="w-8 h-8 bg-warm-100 rounded-full flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-28 bg-warm-200 rounded" />
                  <div className="h-3 w-full bg-warm-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

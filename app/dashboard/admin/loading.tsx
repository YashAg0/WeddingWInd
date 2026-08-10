/**
 * app/dashboard/admin/loading.tsx
 *
 * Admin sub-dashboard loading skeleton — shown during async data fetches
 * in the Admin Control Hub. Matches the luxury warm theme of WeddingWithIndia.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse" aria-label="Loading Admin Control Hub...">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-5 w-56 bg-warm-200 rounded-full" />
          <div className="h-8 w-72 bg-warm-300 rounded-xl" />
          <div className="h-4 w-96 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-warm-200 rounded-xl" />
      </div>

      {/* Overview Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-warm-200 rounded" />
              <div className="w-8 h-8 bg-warm-100 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-warm-300 rounded-lg" />
            <div className="h-3 w-36 bg-warm-100 rounded" />
          </div>
        ))}
      </div>

      {/* Control Actions & Quick Links Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warm-200 rounded-xl" />
              <div className="space-y-1">
                <div className="h-5 w-32 bg-warm-300 rounded" />
                <div className="h-3 w-20 bg-warm-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-warm-100 rounded" />
            <div className="h-10 w-full bg-warm-200 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Audit Log / Submissions Table Skeleton */}
      <div className="bg-white border border-warm-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-warm-100">
          <div className="h-6 w-48 bg-warm-300 rounded" />
          <div className="h-4 w-28 bg-warm-200 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-warm-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-warm-100 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 w-36 bg-warm-200 rounded" />
                  <div className="h-3 w-24 bg-warm-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-warm-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

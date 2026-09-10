/**
 * app/dashboard/leads/loading.tsx
 *
 * Skeletons for Agent Leads management.
 */
export default function LeadsLoading() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-pulse" aria-label="Loading leads...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-warm-300 rounded-xl" />
          <div className="h-4 w-80 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-warm-200 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-2">
            <div className="h-4 w-24 bg-warm-100 rounded" />
            <div className="h-7 w-16 bg-warm-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Leads Table Skeleton */}
      <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="h-6 w-36 bg-warm-300 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full bg-warm-50 border border-warm-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * app/dashboard/operations/loading.tsx
 *
 * Skeletons for Coordinator Operations hub.
 */
export default function OperationsLoading() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-pulse" aria-label="Loading operations...">
      {/* Header */}
      <div className="space-y-2 border-b border-warm-200 pb-6">
        <div className="h-8 w-64 bg-warm-300 rounded-xl" />
        <div className="h-4 w-96 bg-warm-100 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-2">
            <div className="h-4 w-28 bg-warm-100 rounded" />
            <div className="h-8 w-20 bg-warm-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Operations Overview & Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-44 bg-warm-300 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-full bg-warm-50 border border-warm-100 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-36 bg-warm-300 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-warm-50 border border-warm-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * app/dashboard/safety/loading.tsx
 *
 * Skeletons for Safety & Incident Resolution dashboard.
 */
export default function SafetyLoading() {
  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto animate-pulse" aria-label="Loading safety center...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-warm-300 rounded-xl" />
          <div className="h-4 w-96 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-warm-200 rounded-xl" />
      </div>

      {/* Helplines Banner */}
      <div className="h-28 w-full bg-red-50 border border-red-100 rounded-2xl" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-44 bg-warm-300 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full bg-warm-50 border border-warm-100 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-40 bg-warm-300 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full bg-warm-50 border border-warm-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

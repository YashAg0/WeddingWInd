/**
 * app/dashboard/earnings/loading.tsx
 *
 * Skeletons for Agent Earnings & Commission Ledger.
 */
export default function EarningsLoading() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-pulse" aria-label="Loading earnings...">
      {/* Header */}
      <div className="space-y-2 border-b border-warm-200 pb-6">
        <div className="h-8 w-56 bg-warm-300 rounded-xl" />
        <div className="h-4 w-96 bg-warm-100 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-4 w-28 bg-warm-100 rounded" />
              <div className="w-8 h-8 bg-warm-100 rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-warm-300 rounded-lg" />
            <div className="h-3 w-20 bg-warm-100 rounded" />
          </div>
        ))}
      </div>

      {/* Payout & Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-36 bg-warm-300 rounded-lg" />
          <div className="h-10 w-full bg-warm-100 rounded-xl" />
          <div className="h-10 w-full bg-warm-100 rounded-xl" />
          <div className="h-10 w-full bg-warm-200 rounded-xl" />
        </div>

        <div className="lg:col-span-2 bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="h-6 w-44 bg-warm-300 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-warm-50 border border-warm-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

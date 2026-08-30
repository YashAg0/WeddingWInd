/**
 * app/dashboard/verification/loading.tsx
 *
 * Skeletons for Host KYC Verification dashboard.
 */
export default function VerificationLoading() {
  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto animate-pulse" aria-label="Loading verification...">
      {/* Header */}
      <div className="space-y-2 border-b border-warm-200 pb-6">
        <div className="h-8 w-64 bg-warm-300 rounded-xl" />
        <div className="h-4 w-96 bg-warm-100 rounded-lg" />
      </div>

      {/* Status Banner Skeleton */}
      <div className="h-20 w-full bg-warm-100 rounded-2xl" />

      {/* Steps Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warm-200 rounded-xl" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-warm-300 rounded" />
                <div className="h-3 w-20 bg-warm-100 rounded" />
              </div>
            </div>
            <div className="h-3.5 w-full bg-warm-100 rounded" />
            <div className="h-10 w-full bg-warm-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

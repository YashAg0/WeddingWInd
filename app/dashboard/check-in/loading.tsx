/**
 * app/dashboard/check-in/loading.tsx
 *
 * Skeletons for On-Site Coordinator QR Scanner & Check-in Desk.
 */
export default function CheckInLoading() {
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto animate-pulse" aria-label="Loading check-in desk...">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-warm-200 pb-6">
        <div className="h-8 w-64 bg-warm-300 rounded-xl mx-auto" />
        <div className="h-4 w-96 bg-warm-100 rounded-lg mx-auto" />
      </div>

      {/* Scanner Box Skeleton */}
      <div className="bg-white border border-warm-200 p-8 rounded-3xl shadow-sm flex flex-col items-center space-y-6">
        <div className="w-64 h-64 bg-warm-100 rounded-2xl border-2 border-dashed border-warm-300" />
        <div className="h-12 w-full max-w-md bg-warm-100 rounded-xl" />
        <div className="h-12 w-full max-w-md bg-warm-300 rounded-xl" />
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="h-5 w-40 bg-warm-300 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-warm-50 border border-warm-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

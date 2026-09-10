/**
 * app/dashboard/celebrations/loading.tsx
 *
 * Skeletons for Host Celebrations view.
 */
export default function CelebrationsLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading celebrations...">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-warm-300 rounded-xl" />
          <div className="h-4 w-80 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-warm-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-4"
          >
            <div className="h-44 bg-warm-100 rounded-xl w-full" />
            <div className="space-y-2">
              <div className="h-5 w-44 bg-warm-300 rounded" />
              <div className="h-3.5 w-32 bg-warm-100 rounded" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-warm-100">
              <div className="h-4 w-20 bg-warm-100 rounded" />
              <div className="h-8 w-24 bg-warm-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

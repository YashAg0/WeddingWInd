/**
 * app/dashboard/notifications/loading.tsx
 *
 * Skeletons for Notifications hub.
 */
export default function NotificationsLoading() {
  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto animate-pulse" aria-label="Loading notifications...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-warm-300 rounded-xl" />
          <div className="h-4 w-72 bg-warm-100 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-warm-200 rounded-xl" />
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-warm-200 p-4 sm:p-5 rounded-2xl shadow-sm flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-warm-100 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-warm-300 rounded" />
                <div className="h-3 w-16 bg-warm-100 rounded" />
              </div>
              <div className="h-3.5 w-full max-w-lg bg-warm-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

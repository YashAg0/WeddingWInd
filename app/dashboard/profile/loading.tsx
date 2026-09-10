/**
 * app/dashboard/profile/loading.tsx
 *
 * Skeletons for User Profile settings.
 */
export default function ProfileLoading() {
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto animate-pulse" aria-label="Loading profile...">
      {/* Header */}
      <div className="space-y-2 border-b border-warm-200 pb-6">
        <div className="h-8 w-48 bg-warm-300 rounded-xl" />
        <div className="h-4 w-72 bg-warm-100 rounded-lg" />
      </div>

      {/* Avatar & Profile Card */}
      <div className="bg-white border border-warm-200 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-warm-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-warm-300 rounded" />
            <div className="h-3.5 w-48 bg-warm-100 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-warm-100">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-warm-100 rounded" />
            <div className="h-10 w-full bg-warm-50 border border-warm-100 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-warm-100 rounded" />
            <div className="h-10 w-full bg-warm-50 border border-warm-100 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-4 w-20 bg-warm-100 rounded" />
          <div className="h-24 w-full bg-warm-50 border border-warm-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

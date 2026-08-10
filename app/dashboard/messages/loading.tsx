/**
 * app/dashboard/messages/loading.tsx
 *
 * Messages sub-dashboard loading skeleton — shown during async data fetches
 * in the Messaging Inbox section. Matches the luxury warm theme of WeddingWithIndia.
 */
export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-12rem)] min-h-[500px] bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-sm flex animate-pulse" aria-label="Loading Messages...">
      {/* Sidebar Inbox Skeleton */}
      <div className="w-full md:w-80 lg:w-96 border-r border-warm-200 p-4 space-y-4 flex flex-col shrink-0">
        <div className="flex justify-between items-center pb-2">
          <div className="h-7 w-32 bg-warm-300 rounded-lg" />
          <div className="h-8 w-8 bg-warm-200 rounded-xl" />
        </div>
        <div className="h-10 w-full bg-warm-100 rounded-xl" />

        <div className="space-y-3 flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-warm-50/50 border border-warm-100">
              <div className="w-10 h-10 bg-warm-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-warm-300 rounded" />
                  <div className="h-3 w-12 bg-warm-100 rounded" />
                </div>
                <div className="h-3 w-40 bg-warm-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Chat Viewport Skeleton */}
      <div className="hidden md:flex flex-1 flex-col justify-between bg-warm-50/30">
        {/* Chat Header Skeleton */}
        <div className="p-4 border-b border-warm-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warm-200 rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-36 bg-warm-300 rounded" />
              <div className="h-3 w-24 bg-warm-100 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-warm-100 rounded-lg" />
            <div className="h-8 w-8 bg-warm-100 rounded-lg" />
          </div>
        </div>

        {/* Chat Stream Skeleton */}
        <div className="p-6 space-y-4 flex-1 overflow-hidden">
          <div className="flex justify-start">
            <div className="max-w-xs bg-white border border-warm-200 p-4 rounded-2xl space-y-2">
              <div className="h-3 w-48 bg-warm-200 rounded" />
              <div className="h-3 w-32 bg-warm-100 rounded" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-xs bg-maroon-100/50 border border-maroon-200/40 p-4 rounded-2xl space-y-2">
              <div className="h-3 w-40 bg-maroon-200/60 rounded" />
              <div className="h-3 w-28 bg-maroon-200/40 rounded" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-xs bg-white border border-warm-200 p-4 rounded-2xl space-y-2">
              <div className="h-3 w-52 bg-warm-200 rounded" />
              <div className="h-3 w-20 bg-warm-100 rounded" />
            </div>
          </div>
        </div>

        {/* Chat Input Bar Skeleton */}
        <div className="p-4 border-t border-warm-200 bg-white flex gap-3 items-center">
          <div className="h-10 flex-1 bg-warm-100 rounded-xl" />
          <div className="h-10 w-24 bg-warm-300 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

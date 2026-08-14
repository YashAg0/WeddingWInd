export default function WeddingsLoading() {
  return (
    <div className="min-h-[85vh] flex flex-col bg-warm-50 pt-24 pb-16">
      <div className="container-luxury flex flex-col gap-8">
        
        {/* Search header container loader */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mt-4">
          <div className="h-9 w-full max-w-xs bg-warm-200/60 rounded mx-auto animate-pulse" />
          <div className="h-4 w-full max-w-sm bg-warm-100/60 rounded mx-auto animate-pulse" />
        </div>

        {/* Search bar loader */}
        <div className="h-16 w-full max-w-4xl mx-auto bg-warm-100/50 border border-warm-200/30 rounded-3xl animate-pulse" />

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4">
          
          {/* Sidebar loader */}
          <div className="hidden lg:block lg:col-span-1 h-96 bg-white border border-warm-200/50 rounded-3xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-5 w-20 bg-warm-200/60 rounded animate-pulse" />
              <hr className="border-warm-100" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="h-4 w-4 bg-warm-100 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-warm-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid loader */}
          <main className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            <div className="h-12 w-full bg-white border border-warm-200/40 rounded-2xl animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-warm-200/50 rounded-3xl overflow-hidden h-[460px] flex flex-col gap-4 p-5">
                  <div className="h-52 bg-warm-100/80 rounded-2xl animate-pulse w-full" />
                  <div className="h-5 w-3/4 bg-warm-100 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-warm-100 rounded animate-pulse" />
                  <div className="h-4 w-full bg-warm-100 rounded animate-pulse mt-4" />
                  <div className="h-10 w-full bg-warm-100 rounded-xl animate-pulse mt-auto" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

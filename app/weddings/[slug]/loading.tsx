export default function WeddingDetailLoading() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-24 pb-20">
      
      {/* Header Container Loader */}
      <header className="container-luxury mt-4 flex flex-col gap-4">
        {/* Breadcrumbs loader */}
        <div className="h-4 w-40 bg-warm-200/60 rounded animate-pulse" />

        {/* Title Block loader */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex gap-2">
              <div className="h-5 w-24 bg-warm-200/60 rounded-full animate-pulse" />
              <div className="h-5 w-24 bg-warm-200/60 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-3/4 bg-warm-200/80 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-warm-100/60 rounded animate-pulse" />
          </div>
          
          <div className="h-16 w-44 bg-white border border-warm-200/50 rounded-2xl animate-pulse" />
        </div>
      </header>

      {/* Image Gallery Loader */}
      <div className="container-luxury mt-6">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-3xl overflow-hidden bg-white p-3 border border-warm-200/50">
          <div className="col-span-2 row-span-2 bg-warm-100 animate-pulse rounded-2xl" />
          <div className="bg-warm-100 animate-pulse rounded-xl" />
          <div className="bg-warm-100 animate-pulse rounded-xl" />
          <div className="bg-warm-100 animate-pulse rounded-xl" />
          <div className="bg-warm-100 animate-pulse rounded-xl" />
        </div>
      </div>

      {/* Main Grid Content Loader */}
      <div className="container-luxury mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-40 bg-white border border-warm-200/50 rounded-3xl animate-pulse" />
            <div className="h-40 bg-white border border-warm-200/50 rounded-3xl animate-pulse" />
            <div className="h-80 bg-white border border-warm-200/50 rounded-3xl animate-pulse" />
          </div>
          <div className="hidden lg:block lg:col-span-1 h-[450px] bg-white border border-warm-200/50 rounded-3xl animate-pulse" />
        </div>
      </div>

    </div>
  );
}

export default function ProductsLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 bg-hover rounded" />
        <div className="h-4 w-4 bg-hover rounded" />
        <div className="h-4 w-32 bg-hover rounded" />
      </div>

      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-10 w-72 bg-hover rounded mb-2" />
        <div className="h-4 w-48 bg-hover rounded" />
      </div>

      {/* Tab skeleton */}
      <div className="flex gap-2 mb-8">
        <div className="h-8 w-16 bg-hover rounded-lg" />
        <div className="h-8 w-24 bg-hover rounded-lg" />
        <div className="h-8 w-20 bg-hover rounded-lg" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface card-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                <div className="h-5 w-16 bg-hover rounded" />
                <div className="h-5 w-16 bg-hover rounded" />
              </div>
              <div className="h-3 w-20 bg-hover rounded" />
            </div>
            <div className="h-6 w-3/4 bg-hover rounded mb-3" />
            <div className="h-4 w-full bg-hover rounded mb-2" />
            <div className="h-4 w-2/3 bg-hover rounded mb-4" />
            <div className="flex gap-1.5">
              <div className="h-5 w-12 bg-hover rounded" />
              <div className="h-5 w-14 bg-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightsLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 bg-hover rounded" />
        <div className="h-4 w-4 bg-hover rounded" />
        <div className="h-4 w-24 bg-hover rounded" />
      </div>

      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-hover rounded mb-3" />
        <div className="h-4 w-20 bg-hover rounded" />
      </div>

      {/* Post skeletons */}
      <div className="space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pl-8 py-4 border-l-2 border-hover">
            <div className="h-3 w-24 bg-hover rounded mb-3" />
            <div className="h-8 w-3/4 bg-hover rounded mb-4" />
            <div className="h-4 w-full bg-hover rounded mb-2" />
            <div className="h-4 w-2/3 bg-hover rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-hover rounded" />
              <div className="h-6 w-16 bg-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightDetailLoading() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto">
      <div className="bg-surface card-border rounded-lg p-8 md:p-12">
        {/* Back link */}
        <div className="h-4 w-16 bg-hover rounded mb-6" />

        {/* Title */}
        <div className="pb-8 mb-8 mt-4">
          <div className="h-10 w-3/4 bg-hover rounded mb-4" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 bg-hover rounded" />
            <div className="h-3 w-1 bg-hover rounded" />
            <div className="h-3 w-20 bg-hover rounded" />
            <div className="h-3 w-1 bg-hover rounded" />
            <div className="h-3 w-16 bg-hover rounded" />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-4 bg-hover rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
          <div className="h-8 w-1/2 bg-hover rounded mt-6 mb-3" />
          {[1, 2, 3, 4].map((i) => (
            <div key={`b${i}`} className="h-4 bg-hover rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

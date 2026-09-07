export default function RootLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="h-8 w-48 bg-hover rounded mb-4" />
        <div className="h-4 w-32 bg-hover rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface card-border rounded-lg p-6">
            <div className="h-5 w-3/4 bg-hover rounded mb-3" />
            <div className="h-4 w-full bg-hover rounded mb-2" />
            <div className="h-4 w-2/3 bg-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

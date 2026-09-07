export default function ConnectLoading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 bg-hover rounded" />
        <div className="h-4 w-4 bg-hover rounded" />
        <div className="h-4 w-20 bg-hover rounded" />
      </div>
      <div className="mb-8">
        <div className="h-10 w-48 bg-hover rounded mb-3" />
        <div className="h-4 w-64 bg-hover rounded" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface card-border rounded-lg p-6">
            <div className="h-5 w-1/2 bg-hover rounded mb-3" />
            <div className="h-4 w-full bg-hover rounded mb-2" />
            <div className="h-4 w-3/4 bg-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

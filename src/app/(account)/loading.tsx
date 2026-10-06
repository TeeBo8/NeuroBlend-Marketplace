export default function AccountLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="md:w-64 shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-px bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </aside>
        {/* Main content skeleton */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

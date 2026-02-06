export default function VendorLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="md:w-64 shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-purple-100 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </aside>
        {/* Main content skeleton */}
        <main className="flex-1 min-w-0 space-y-6">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />
        </main>
      </div>
    </div>
  );
}

import { ProductCardSkeleton } from "@/components/product/product-card";

export default function MarketplaceLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-gray-200 rounded animate-pulse" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, Coffee, PackageOpen } from 'lucide-react';
import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/components/product/product-card';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') as
    | 'HPI'
    | 'ADHD'
    | 'hypersensitive'
    | null;
  const search = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.product.list.useInfiniteQuery(
      {
        category: category || undefined,
        search: search || undefined,
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput || null);
  };

  const clearFilters = () => {
    router.replace(pathname);
    setSearchInput('');
  };

  const hasActiveFilters = !!(category || search);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Nos Produits</h1>
          <p className="text-lg text-purple-100 max-w-2xl">
            Des capsules de café artisanales, conçues pour accompagner chaque
            type d&apos;esprit neuroatypique.
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('q', null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button
            variant={!category ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateParam('category', null)}
            className={cn(!category && 'bg-purple-600 hover:bg-purple-700')}
          >
            Tous
          </Button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                updateParam(
                  'category',
                  category === cat.value ? null : cat.value
                )
              }
              className={cn(
                category === cat.value && 'bg-purple-600 hover:bg-purple-700'
              )}
            >
              {cat.label}
            </Button>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Active filter info */}
        {search && (
          <p className="text-sm text-gray-500 mb-6">
            Résultats pour &quot;{search}&quot;
            {products.length > 0 && ` (${products.length} produit${products.length > 1 ? 's' : ''})`}
          </p>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              {search ? (
                <Search className="w-10 h-10 text-purple-300" />
              ) : category ? (
                <Coffee className="w-10 h-10 text-purple-300" />
              ) : (
                <PackageOpen className="w-10 h-10 text-purple-300" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {search
                ? 'Aucun résultat'
                : category
                  ? 'Aucun produit dans cette catégorie'
                  : 'Aucun produit disponible'}
            </h2>
            <p className="text-gray-500 max-w-md mb-6">
              {search
                ? `Nous n'avons trouvé aucun produit correspondant à "${search}". Essayez d'autres mots-clés.`
                : 'Nos torréfacteurs préparent de nouvelles créations. Revenez bientôt !'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="min-w-[200px]"
                >
                  {isFetchingNextPage
                    ? 'Chargement...'
                    : 'Charger plus de produits'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

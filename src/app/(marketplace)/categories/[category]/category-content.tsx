'use client';

import Link from 'next/link';
import { Sparkles, Zap, Heart, Coffee, ArrowLeft } from 'lucide-react';
import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/components/product/product-card';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const CATEGORY_THEMES = {
  HPI: {
    gradient: 'from-purple-600 via-purple-700 to-indigo-800',
    lightBg: 'bg-purple-100',
    icon: Sparkles,
    iconColor: 'text-purple-300',
    accentColor: 'text-purple-100',
  },
  ADHD: {
    gradient: 'from-teal-600 via-teal-700 to-cyan-800',
    lightBg: 'bg-teal-100',
    icon: Zap,
    iconColor: 'text-teal-300',
    accentColor: 'text-teal-100',
  },
  hypersensitive: {
    gradient: 'from-orange-500 via-orange-600 to-amber-700',
    lightBg: 'bg-orange-100',
    icon: Heart,
    iconColor: 'text-orange-300',
    accentColor: 'text-orange-100',
  },
} as const;

export function CategoryContent({
  category,
}: {
  category: 'HPI' | 'ADHD' | 'hypersensitive';
}) {
  const categoryInfo = PRODUCT_CATEGORIES.find((c) => c.value === category);
  const theme = CATEGORY_THEMES[category];
  const Icon = theme.icon;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.product.list.useInfiniteQuery(
      {
        category,
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {/* Hero */}
      <section
        className={cn('bg-gradient-to-br text-white', theme.gradient)}
      >
        <div className="container mx-auto px-4 py-16">
          <Link
            href="/products"
            className={cn(
              'inline-flex items-center gap-2 text-sm mb-6 transition-colors',
              theme.accentColor,
              'hover:text-white'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Tous les produits
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                'bg-white/20'
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">
              {categoryInfo?.label}
            </h1>
          </div>
          <p className={cn('text-lg max-w-2xl', theme.accentColor)}>
            {categoryInfo?.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center mb-6',
                theme.lightBg
              )}
            >
              <Coffee className={cn('w-10 h-10', theme.iconColor)} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun produit disponible
            </h2>
            <p className="text-gray-500 max-w-md mb-6">
              Nos torréfacteurs préparent de nouvelles créations pour la
              catégorie {categoryInfo?.label}. Revenez bientôt !
            </p>
            <Button variant="outline" asChild>
              <Link href="/products">Voir tous les produits</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {products.length} produit{products.length > 1 ? 's' : ''} trouvé
              {products.length > 1 ? 's' : ''}
            </p>
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

      {/* Other Categories */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Autres catégories
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRODUCT_CATEGORIES.filter((c) => c.value !== category).map(
              (cat) => {
                const catTheme =
                  CATEGORY_THEMES[
                    cat.value as keyof typeof CATEGORY_THEMES
                  ];
                const CatIcon = catTheme.icon;

                return (
                  <Link
                    key={cat.value}
                    href={`/categories/${cat.value}`}
                    className="group"
                  >
                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-6 transition-all hover:border-purple-300 hover:shadow-md">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          catTheme.lightBg
                        )}
                      >
                        <CatIcon
                          className={cn('w-6 h-6', catTheme.iconColor)}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {cat.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>
    </>
  );
}

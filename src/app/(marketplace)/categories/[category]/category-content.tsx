'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, Heart, Coffee, ArrowLeft } from 'lucide-react';
import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/components/product/product-card';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const CATEGORY_SEO_CONTENT: Record<
  string,
  { heading: string; paragraphs: string[] }
> = {
  HPI: {
    heading: 'Le café pensé pour les Hauts Potentiels Intellectuels',
    paragraphs: [
      'Les personnes HPI (Haut Potentiel Intellectuel) ont un fonctionnement cognitif unique : pensée en arborescence, hyperactivité mentale et besoin constant de stimulation intellectuelle. Leur rapport à la caféine est tout aussi singulier — trop d\u2019intensité peut générer une sur-stimulation, tandis qu\u2019un café trop léger ne satisfait pas leur besoin de complexité sensorielle.',
      'Nos torréfacteurs artisanaux ont développé des blends spécifiques qui allient des profils aromatiques complexes à un dosage en caféine maîtrisé. Notes fruitées, chocolatées ou épicées : chaque capsule est conçue pour accompagner vos sessions de deep work, vos moments de création et vos rituels de réflexion.',
      'Découvrez une sélection de capsules compatibles qui respecte votre sensibilité tout en stimulant votre créativité. Torréfaction artisanale, grains de spécialité, profils gustatifs soigneusement calibrés.',
    ],
  },
  ADHD: {
    heading: 'Des capsules de café conçues pour le focus et la concentration',
    paragraphs: [
      'Le TDAH (Trouble du Déficit de l\u2019Attention avec ou sans Hyperactivité) concerne environ 5% de la population adulte en France. Les personnes ADHD ont souvent un rapport particulier à la caféine : elle peut aider à canaliser l\u2019énergie et favoriser le focus, à condition de choisir le bon dosage.',
      'Nos blends ADHD sont créés par des torréfacteurs qui comprennent ce besoin d\u2019équilibre. Des cafés ni trop forts ni trop légers, avec une libération progressive de la caféine pour un effet durable sans les pics d\u2019énergie suivis de crashes. L\u2019intensité est calibrée pour soutenir la concentration sur la durée.',
      'Chaque capsule est le fruit d\u2019un savoir-faire artisanal pensé pour les esprits dynamiques. Commandez vos capsules et découvrez comment le bon café peut transformer votre productivité au quotidien.',
    ],
  },
  hypersensitive: {
    heading: 'Le café qui respecte votre sensibilité sensorielle',
    paragraphs: [
      'L\u2019hypersensibilité sensorielle touche une part significative de la population neuroatypique. Pour ces personnes, un café trop amer, trop acide ou trop intense peut devenir une expérience désagréable. C\u2019est pourquoi nos torréfacteurs créent des blends spécialement pensés pour les palais sensibles.',
      'Des notes florales, des saveurs de miel, des arômes de fruits doux — nos capsules Hypersensible privilégient la rondeur et l\u2019équilibre. La torréfaction est douce et contrôlée pour éliminer l\u2019amertume excessive tout en préservant la richesse aromatique du grain.',
      'Offrez-vous un moment de douceur avec des capsules artisanales qui comprennent votre sensibilité. Chaque gorgée est un voyage gustatif pensé pour respecter vos sens et vous apporter du réconfort.',
    ],
  },
};

const CATEGORY_THEMES = {
  HPI: {
    gradient: 'from-primary via-primary/90 to-indigo-800',
    lightBg: 'bg-primary/10',
    icon: Sparkles,
    iconColor: 'text-primary/50',
    accentColor: 'text-purple-100',
    heroImage: '/images/categories/hpi-hero.jpg',
  },
  ADHD: {
    gradient: 'from-teal-600 via-teal-700 to-cyan-800',
    lightBg: 'bg-chart-2/20',
    icon: Zap,
    iconColor: 'text-teal-300',
    accentColor: 'text-teal-100',
    heroImage: '/images/categories/adhd-hero.jpg',
  },
  hypersensitive: {
    gradient: 'from-orange-500 via-orange-600 to-amber-700',
    lightBg: 'bg-orange-100',
    icon: Heart,
    iconColor: 'text-orange-300',
    accentColor: 'text-orange-100',
    heroImage: '/images/categories/hypersensible-hero.jpg',
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
        className={cn('relative text-white overflow-hidden')}
      >
        <Image
          src={theme.heroImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-85', theme.gradient)} />
        <div className="relative container mx-auto px-4 py-16">
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
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucun produit disponible
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Nos torréfacteurs préparent de nouvelles créations pour la
              catégorie {categoryInfo?.label}. Revenez bientôt !
            </p>
            <Button variant="outline" asChild>
              <Link href="/products">Voir tous les produits</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
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

      {/* SEO Content */}
      {CATEGORY_SEO_CONTENT[category] && (
        <section className="bg-background border-t">
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {CATEGORY_SEO_CONTENT[category].heading}
            </h2>
            <div className="space-y-4">
              {CATEGORY_SEO_CONTENT[category].paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Categories */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
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
                    <div className="flex items-center gap-4 rounded-xl border p-6 transition-all hover:border-primary/30 hover:shadow-md">
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
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {cat.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
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

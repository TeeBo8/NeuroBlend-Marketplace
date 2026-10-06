import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { CategoryContent } from './category-content';
import { ProductCardSkeleton } from '@/components/product/product-card';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbSchema, collectionPageSchema } from '@/lib/schemas';

type Props = {
  params: Promise<{ category: string }>;
};

const VALID_CATEGORIES = PRODUCT_CATEGORIES.map((c) => c.value);

const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  HPI: {
    title: 'Capsules HPI (Haut Potentiel) — Café pour esprits analytiques',
    description:
      'Découvrez nos capsules de café artisanales conçues pour les profils HPI (Haut Potentiel Intellectuel). Des blends aux arômes complexes, sélectionnés par des torréfacteurs spécialisés.',
    keywords: [
      'café HPI',
      'haut potentiel intellectuel',
      'capsules café créativité',
      'café concentration',
      'neurodiversité',
      'café artisanal',
    ],
  },
  ADHD: {
    title: 'Capsules ADHD — Café franc et régulier',
    description:
      'Nos capsules de café ADHD : des torréfactions artisanales équilibrées, à faible acidité, pour les esprits dynamiques.',
    keywords: [
      'café ADHD',
      'café concentration',
      'café focus',
      'café équilibré',
      'neurodiversité',
      'café énergie',
    ],
  },
  hypersensitive: {
    title: 'Capsules Hypersensible — Café doux et équilibré',
    description:
      'Des capsules de café aux saveurs douces et équilibrées, pensées pour les personnes hypersensibles. Profils aromatiques subtils et torréfaction respectueuse de votre sensibilité sensorielle.',
    keywords: [
      'café hypersensible',
      'café doux',
      'capsules saveurs douces',
      'café sensibilité',
      'neurodiversité',
      'café apaisant',
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const seo = CATEGORY_SEO[category];

  if (!seo) {
    return { title: 'Catégorie introuvable' };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
    alternates: {
      canonical: `/categories/${category}`,
    },
  };
}

function CategoryLoading() {
  return (
    <>
      <div className="h-48 bg-muted animate-pulse" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    notFound();
  }

  const categoryInfo = PRODUCT_CATEGORIES.find((c) => c.value === category);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Produits', url: '/products' },
          { name: categoryInfo?.label ?? category, url: `/categories/${category}` },
        ])}
      />
      <JsonLd
        data={collectionPageSchema({
          name: CATEGORY_SEO[category]?.title ?? category,
          description: CATEGORY_SEO[category]?.description ?? '',
          url: `/categories/${category}`,
        })}
      />
      <Suspense fallback={<CategoryLoading />}>
        <CategoryContent category={category as 'HPI' | 'ADHD' | 'hypersensitive'} />
      </Suspense>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { CategoryContent } from './category-content';
import { ProductCardSkeleton } from '@/components/product/product-card';

type Props = {
  params: Promise<{ category: string }>;
};

const VALID_CATEGORIES = PRODUCT_CATEGORIES.map((c) => c.value);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = PRODUCT_CATEGORIES.find((c) => c.value === category);

  if (!categoryInfo) {
    return { title: 'Catégorie introuvable' };
  }

  return {
    title: `${categoryInfo.label} - Capsules de café`,
    description: categoryInfo.description,
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

  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryContent category={category as 'HPI' | 'ADHD' | 'hypersensitive'} />
    </Suspense>
  );
}

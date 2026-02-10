import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsContent } from './products-content';
import { ProductCardSkeleton } from '@/components/product/product-card';

export const metadata: Metadata = {
  title: 'Capsules de café artisanales pour esprits neuroatypiques',
  description:
    'Découvrez notre sélection de capsules de café artisanales adaptées aux profils neuroatypiques : HPI, ADHD et hypersensibles. Torréfaction artisanale, livraison offerte dès 25€.',
  keywords: [
    'capsules café',
    'café neuroatypique',
    'café HPI',
    'café ADHD',
    'café hypersensible',
    'capsules artisanales',
  ],
  openGraph: {
    title: 'Nos Produits | NeuroBlend',
    description:
      'Capsules de café artisanales conçues pour les profils HPI, ADHD et Hypersensibles.',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: '/products',
  },
};

function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>
      {/* Filters skeleton */}
      <div className="flex gap-3 mb-8">
        <div className="h-10 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 w-20 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-20 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-20 bg-muted rounded-full animate-pulse" />
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

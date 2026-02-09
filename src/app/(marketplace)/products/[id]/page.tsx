import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductDetail } from './product-detail';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const ctx = await createTRPCContext();
    const caller = createCaller(ctx);
    const product = await caller.product.byId({ id });
    return {
      title: product.name,
      description:
        product.shortDescription || product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description:
          product.shortDescription || product.description?.slice(0, 160),
        images: product.imageUrl ? [product.imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Produit introuvable' };
  }
}

function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-5 w-40 bg-muted rounded animate-pulse mb-8" />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // Validate the id exists (basic check)
  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductDetailLoading />}>
      <ProductDetail id={id} />
    </Suspense>
  );
}

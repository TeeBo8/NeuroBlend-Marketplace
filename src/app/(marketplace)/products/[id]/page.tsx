import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductDetail } from './product-detail';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { JsonLd } from '@/components/seo/json-ld';
import { productSchema, breadcrumbSchema } from '@/lib/schemas';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const ctx = await createTRPCContext();
    const caller = createCaller(ctx);
    const product = await caller.product.byId({ id });
    const categoryInfo = PRODUCT_CATEGORIES.find(
      (c) => c.value === product.category
    );
    const desc =
      product.shortDescription || product.description?.slice(0, 160);

    return {
      title: product.name,
      description: desc,
      openGraph: {
        title: `${product.name} | NeuroBlend`,
        description: desc,
        images: product.imageUrl ? [product.imageUrl] : [],
        type: 'website',
        locale: 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: desc,
        images: product.imageUrl ? [product.imageUrl] : [],
      },
      alternates: {
        canonical: `/products/${id}`,
      },
      keywords: [
        product.name,
        'capsule café',
        categoryInfo?.label ?? '',
        'neuroatypique',
        product.origin ?? '',
        ...(product.flavorNotes ?? []),
      ].filter(Boolean),
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

  if (!id) {
    notFound();
  }

  // Fetch product data for JSON-LD (server side)
  let jsonLdData: Record<string, unknown> | null = null;
  let breadcrumbData: Record<string, unknown> | null = null;

  try {
    const ctx = await createTRPCContext();
    const caller = createCaller(ctx);
    const product = await caller.product.byId({ id });
    const categoryInfo = PRODUCT_CATEGORIES.find(
      (c) => c.value === product.category
    );

    jsonLdData = productSchema(product) as Record<string, unknown>;
    breadcrumbData = breadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Produits', url: '/products' },
      ...(categoryInfo
        ? [
            {
              name: categoryInfo.label,
              url: `/categories/${categoryInfo.value}`,
            },
          ]
        : []),
      { name: product.name, url: `/products/${id}` },
    ]) as Record<string, unknown>;
  } catch {
    // Product not found — schemas will not be rendered
  }

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      {breadcrumbData && <JsonLd data={breadcrumbData} />}
      <Suspense fallback={<ProductDetailLoading />}>
        <ProductDetail id={id} />
      </Suspense>
    </>
  );
}

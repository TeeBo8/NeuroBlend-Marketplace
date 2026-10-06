'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Coffee,
  Star,
  MapPin,
  Flame,
  Package,
  Store,
  ShoppingCart,
} from 'lucide-react';
import { api } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { PRODUCT_CATEGORIES, ROAST_LEVELS } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { trackAddToCart } from '@/lib/analytics';
import { ReviewForm } from '@/components/product/review-form';
import { ProductRecommendations } from '@/components/ai/product-recommendations';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();

  const { data: product, isLoading, error } = api.product.byId.useQuery({ id });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Coffee className="w-10 h-10 text-primary/50" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Produit introuvable
          </h1>
          <p className="text-muted-foreground mb-6">
            Ce produit n&apos;existe pas ou a été retiré du catalogue.
          </p>
          <Button asChild>
            <Link href="/products">Voir tous les produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = PRODUCT_CATEGORIES.find(
    (c) => c.value === product.category
  );
  const roastInfo = ROAST_LEVELS.find((r) => r.value === product.roastLevel);
  const hasDiscount =
    product.compareAtPrice &&
    parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        (1 -
          parseFloat(product.price) / parseFloat(product.compareAtPrice!)) *
          100
      )
    : null;
  const { count: reviewCount, average: averageRating } = product.reviewStats;

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      {/* Product Main */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Coffee className="w-24 h-24 text-primary/50" />
              </div>
            )}
            {discountPercent && (
              <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-500 text-white text-sm px-3 py-1">
                -{discountPercent}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-primary hover:bg-primary text-primary-foreground text-sm px-3 py-1">
                Vedette
              </Badge>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {categoryInfo && (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {categoryInfo.label}
                </Badge>
              )}
              {roastInfo && (
                <Badge variant="outline">{roastInfo.label}</Badge>
              )}
              {product.stock !== null && product.stock > 0 && (
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700"
                >
                  En stock
                </Badge>
              )}
              {product.stock !== null && product.stock === 0 && (
                <Badge
                  variant="outline"
                  className="border-red-200 text-red-700"
                >
                  Rupture de stock
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {product.name}
            </h1>

            {/* Vendor */}
            {product.vendor && (
              <p className="text-muted-foreground mb-4">
                par{' '}
                <span className="font-medium text-foreground">
                  {product.vendor.businessName}
                </span>
              </p>
            )}

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} avis)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-muted-foreground mb-6">{product.shortDescription}</p>
            )}

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.capsuleCount && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{product.capsuleCount} capsules</span>
                </div>
              )}
              {product.origin && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{product.origin}</span>
                </div>
              )}
              {roastInfo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 text-primary" />
                  <span>Torréfaction {roastInfo.label.toLowerCase()}</span>
                </div>
              )}
              {product.intensityLevel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-semibold text-xs w-4 text-center">
                    {product.intensityLevel}
                  </span>
                  <span>/ 10 intensité</span>
                </div>
              )}
            </div>

            {/* Intensity Meter */}
            {product.intensityLevel && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  Intensité
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-3 flex-1 rounded-full',
                        i < product.intensityLevel!
                          ? 'bg-primary'
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Notes */}
            {product.flavorNotes && product.flavorNotes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  Notes de dégustation
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.flavorNotes.map((note) => (
                    <Badge
                      key={note}
                      variant="secondary"
                      className="bg-primary/5 text-primary hover:bg-primary/10"
                    >
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            <div className="mb-6">
              <ProductRecommendations productId={product.id} />
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
              disabled={product.stock === 0}
              onClick={() => {
                useCartStore.getState().addItem({
                  productId: product.id,
                  name: product.name,
                  price: parseFloat(product.price),
                  imageUrl: product.imageUrl ?? undefined,
                  vendorId: product.vendorId,
                  vendorName: product.vendor?.businessName ?? 'Vendeur',
                });
                trackAddToCart({
                  id: product.id,
                  name: product.name,
                  price: parseFloat(product.price),
                  category: product.category ?? undefined,
                });
                toast.success('Produit ajouté au panier', {
                  description: product.name,
                  action: {
                    label: 'Voir le panier',
                    onClick: () => window.location.href = '/cart',
                  },
                });
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0
                ? 'Indisponible'
                : 'Ajouter au panier'}
            </Button>
          </div>
        </div>
      </section>

      {/* Description */}
      {product.description && (
        <section className="bg-muted/50">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Description
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Vendor Info */}
      {product.vendor && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            À propos du torréfacteur
          </h2>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {product.vendor.logo ? (
                  <Image
                    src={product.vendor.logo}
                    alt={product.vendor.businessName}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Store className="w-7 h-7 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {product.vendor.businessName}
                </h3>
                {product.vendor.description && (
                  <p className="text-muted-foreground mt-1">
                    {product.vendor.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Avis clients{reviewCount > 0 ? ` (${reviewCount})` : ''}
            </h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm font-medium text-foreground">
                  {averageRating.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="mb-6">
            <ReviewForm productId={product.id} />
          </div>

          {/* Existing Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {review.user?.name || 'Anonyme'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.title && (
                      <p className="font-medium text-foreground mt-2">
                        {review.title}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-muted-foreground mt-1">{review.comment}</p>
                    )}
                    {review.verified && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs border-green-200 text-green-700"
                      >
                        Achat vérifié
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator />
    </>
  );
}

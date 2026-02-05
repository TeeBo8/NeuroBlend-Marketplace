'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES, ROAST_LEVELS } from '@/lib/constants';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    shortDescription?: string | null;
    price: string;
    compareAtPrice?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    roastLevel?: string | null;
    capsuleCount?: number | null;
    intensityLevel?: number | null;
    featured?: boolean | null;
    vendor?: {
      id: string;
      businessName: string;
      logo?: string | null;
    } | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const categoryLabel = PRODUCT_CATEGORIES.find(
    (c) => c.value === product.category
  )?.label;
  const roastLabel = ROAST_LEVELS.find(
    (r) => r.value === product.roastLevel
  )?.label;
  const hasDiscount =
    product.compareAtPrice &&
    parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        (1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) *
          100
      )
    : null;

  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
              <Coffee className="w-12 h-12 text-purple-300" />
            </div>
          )}
          {discountPercent && (
            <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-purple-600 hover:bg-purple-600 text-white">
              Vedette
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            {categoryLabel && (
              <Badge
                variant="outline"
                className="text-xs border-purple-200 text-purple-700"
              >
                {categoryLabel}
              </Badge>
            )}
            {roastLabel && (
              <Badge variant="outline" className="text-xs">
                {roastLabel}
              </Badge>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Vendor */}
          {product.vendor && (
            <p className="text-sm text-gray-500 mt-0.5">
              par {product.vendor.businessName}
            </p>
          )}

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
            {product.capsuleCount && (
              <span className="text-xs text-gray-500">
                {product.capsuleCount} capsules
              </span>
            )}
          </div>

          {/* Intensity */}
          {product.intensityLevel && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Intensité</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-3 rounded-full',
                      i < product.intensityLevel!
                        ? 'bg-purple-600'
                        : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

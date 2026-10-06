'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Star,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';

export function AdminProductsContent() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const queryInput = {
    limit: 50 as const,
    ...(categoryFilter !== 'all' && { category: categoryFilter as 'HPI' | 'ADHD' | 'hypersensitive' }),
    ...(activeFilter !== 'all' && { active: activeFilter === 'active' }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
  };

  const { data, isLoading, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.product.adminList.useInfiniteQuery(queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const toggleFeatured = api.admin.toggleProductFeatured.useMutation({
    onSuccess: (product) => {
      toast.success(product.featured ? 'Produit mis en avant' : 'Produit retiré de la mise en avant');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur');
    },
  });

  const toggleActive = api.product.adminToggleActive.useMutation({
    onSuccess: (product) => {
      toast.success(product.active ? 'Produit activé' : 'Produit désactivé');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur');
    },
  });

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tous les produits</h1>
        <p className="text-muted-foreground mt-1">
          {products.length}{hasNextPage ? '+' : ''} produit{products.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucun produit trouvé.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        {product.featured && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.vendor?.businessName || 'Vendeur inconnu'} &middot;{' '}
                        {formatPrice(Number(product.price))} &middot;{' '}
                        Stock : {product.stock ?? 0}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.category && (
                          <Badge variant="secondary" className="text-xs">
                            {PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label || product.category}
                          </Badge>
                        )}
                        {!product.active && (
                          <Badge variant="secondary" className="bg-red-500/15 text-red-700 dark:text-red-300 text-xs">
                            Inactif
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className={product.featured ? 'text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10' : ''}
                      onClick={() => toggleFeatured.mutate({ productId: product.id })}
                      disabled={toggleFeatured.isPending}
                      title={product.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                    >
                      <Star className={`h-4 w-4 ${product.featured ? 'fill-amber-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={!product.active ? 'text-destructive border-destructive/20 hover:bg-destructive/10' : ''}
                      onClick={() => toggleActive.mutate({ productId: product.id })}
                      disabled={toggleActive.isPending}
                      title={product.active ? 'Désactiver' : 'Activer'}
                    >
                      {product.active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-5 w-40 bg-muted/50 rounded mt-2" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-48 bg-muted rounded" />
        <div className="h-10 w-48 bg-muted rounded" />
        <div className="h-10 w-40 bg-muted rounded" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  Coffee,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/trpc/client';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';

export function ProductsContent() {
  const utils = api.useUtils();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data, isLoading } = api.product.myProducts.useQuery({ limit: 50 });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      toast.success('Produit supprimé');
      utils.product.myProducts.invalidate();
      setDeleteProductId(null);
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression', {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  const products = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes produits</h1>
          <p className="text-gray-500 mt-1">
            {products.length} produit{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">Aucun produit pour le moment.</p>
              <p className="text-sm text-gray-400 mb-6">
                Créez votre premier produit pour commencer à vendre.
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/vendor/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon premier produit
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const categoryInfo = PRODUCT_CATEGORIES.find(
              (c) => c.value === product.category
            );

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Coffee className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {!product.active && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {categoryInfo && (
                          <Badge variant="outline" className="text-xs">
                            {categoryInfo.label}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          Stock : {product.stock}
                        </span>
                        {product.intensityLevel && (
                          <span className="text-sm text-gray-500">
                            Intensité : {product.intensityLevel}/10
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(Number(product.price))}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(Number(product.compareAtPrice))}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/vendor/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce produit ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé de votre boutique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={() => {
                if (deleteProductId) {
                  deleteProduct.mutate({ id: deleteProductId });
                }
              }}
            >
              {deleteProduct.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded mt-2" />
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

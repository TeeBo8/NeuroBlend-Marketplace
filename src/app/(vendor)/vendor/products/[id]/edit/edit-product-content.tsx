'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm, type ProductFormData } from '@/components/vendor/product-form';
import { api } from '@/trpc/client';
import { toast } from 'sonner';
import { useState } from 'react';

export function EditProductContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const utils = api.useUtils();
  const [showDelete, setShowDelete] = useState(false);

  const { data: product, isLoading, error } = api.product.byId.useQuery({ id });

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      toast.success('Produit mis à jour !');
      utils.product.myProducts.invalidate();
      utils.product.byId.invalidate({ id });
      router.push('/vendor/products');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error.message,
      });
    },
  });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      toast.success('Produit supprimé');
      utils.product.myProducts.invalidate();
      router.push('/vendor/products');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    updateProduct.mutate({
      id,
      data,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive/60" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Produit introuvable
        </h1>
        <p className="text-muted-foreground mb-8">
          Ce produit n&apos;existe pas ou vous n&apos;avez pas les droits pour le modifier.
        </p>
        <Button asChild variant="outline">
          <Link href="/vendor/products">Retour aux produits</Link>
        </Button>
      </div>
    );
  }

  const initialData: ProductFormData = {
    name: product.name,
    description: product.description || undefined,
    shortDescription: product.shortDescription || undefined,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    capsuleCount: product.capsuleCount || 10,
    category: product.category as ProductFormData['category'],
    imageUrl: product.imageUrl || undefined,
    stock: product.stock || 0,
    intensityLevel: product.intensityLevel || undefined,
    roastLevel: product.roastLevel as ProductFormData['roastLevel'],
    flavorNotes: product.flavorNotes || undefined,
    origin: product.origin || undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <Dialog open={showDelete} onOpenChange={setShowDelete}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer ce produit ?</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Le produit &quot;{product.name}&quot; sera définitivement supprimé.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDelete(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                disabled={deleteProduct.isPending}
                onClick={() => deleteProduct.mutate({ id })}
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

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Modifier : {product.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Modifiez les informations de votre produit.
        </p>
      </div>

      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isPending={updateProduct.isPending}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}

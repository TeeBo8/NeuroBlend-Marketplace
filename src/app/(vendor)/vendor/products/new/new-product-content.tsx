'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm, type ProductFormData } from '@/components/vendor/product-form';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

export function NewProductContent() {
  const router = useRouter();
  const utils = api.useUtils();

  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      toast.success('Produit créé avec succès !');
      utils.product.myProducts.invalidate();
      router.push('/vendor/products');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    createProduct.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouveau produit</h1>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle fiche produit pour votre boutique.
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isPending={createProduct.isPending}
        submitLabel="Créer le produit"
      />
    </div>
  );
}

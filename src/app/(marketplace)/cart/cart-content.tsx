'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartHydrated, useCartStore, type CartItem } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Coffee className="h-8 w-8 text-primary/50" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.productId}`}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">
            par {item.vendorName}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price + Remove */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                removeItem(item.productId);
                toast.success('Produit retiré du panier');
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartContent() {
  const { items, getSubtotal, getItemCount, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const cartHydrated = useCartHydrated();

  if (!cartHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-primary/50" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Découvrez nos capsules de café conçues pour les esprits neuroatypiques.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/products">
              Découvrir nos produits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Mon panier ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Articles</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  clearCart();
                  toast.success('Panier vidé');
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Vider le panier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((item) => (
                  <CartItemRow key={item.productId} item={item} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">
                  Continuer mes achats
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Sous-total ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium text-green-600">Gratuite</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
              >
                <Link href="/checkout">
                  Passer la commande
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

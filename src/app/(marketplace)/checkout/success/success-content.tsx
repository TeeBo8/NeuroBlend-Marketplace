'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/client';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

export function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const hasVerified = useRef(false);

  const verifyCheckout = api.payment.verifyCheckout.useMutation();

  useEffect(() => {
    if (sessionId && !hasVerified.current) {
      hasVerified.current = true;
      verifyCheckout.mutate(
        { sessionId },
        {
          onSuccess: () => {
            useCartStore.getState().clearCart();
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // No session_id in URL
  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session invalide
          </h1>
          <p className="text-gray-500 mb-8">
            Aucune session de paiement trouvée.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/products">Retour aux produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verifying payment
  if (verifyCheckout.isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification du paiement...
          </h1>
          <p className="text-gray-500">
            Veuillez patienter pendant que nous confirmons votre commande.
          </p>
        </div>
      </div>
    );
  }

  // Verification error
  if (verifyCheckout.isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de vérification
          </h1>
          <p className="text-gray-500 mb-8">
            {verifyCheckout.error.message}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/cart">Retour au panier</Link>
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/products">Voir les produits</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success!
  const order = verifyCheckout.data;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-500">
            Merci pour votre achat. Votre commande a été enregistrée avec succès.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Détails de la commande
                </h2>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Numéro de commande</span>
                  <p className="font-mono font-semibold text-gray-900 mt-1">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Statut</span>
                  <p className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Payée
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Livraison</span>
                  <p className="text-gray-900 mt-1">
                    {order.shippingCity}, {order.shippingCountry}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-sm text-gray-500">Adresse de livraison</span>
                <p className="text-sm text-gray-900 mt-1">
                  {order.shippingName}<br />
                  {order.shippingAddress}<br />
                  {order.shippingPostalCode} {order.shippingCity}<br />
                  {order.shippingCountry}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button variant="outline" asChild>
            <Link href="/products">
              Continuer mes achats
            </Link>
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/products">
              Découvrir plus de produits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

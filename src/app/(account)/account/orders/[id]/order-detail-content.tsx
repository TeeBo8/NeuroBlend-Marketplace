'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Coffee,
  MapPin,
  Truck,
  CheckCircle2,
  CreditCard,
  XCircle,
  Store,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/client';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_STEPS = [
  { key: 'paid', label: 'Payée', icon: CreditCard },
  { key: 'processing', label: 'En préparation', icon: Package },
  { key: 'shipped', label: 'Expédiée', icon: Truck },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle2 },
] as const;

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: -1,
    paid: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -2,
  };
  return map[status] ?? -1;
}

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error } = api.order.byId.useQuery({ id: orderId });

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-destructive/50" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Commande introuvable
              </h2>
              <p className="text-muted-foreground mb-6">
                Cette commande n&apos;existe pas ou vous n&apos;y avez pas accès.
              </p>
              <Button asChild variant="outline">
                <Link href="/account/orders">Voir mes commandes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = order.status as keyof typeof ORDER_STATUSES;
  const statusInfo = ORDER_STATUSES[status];
  const currentStep = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux commandes
      </Link>

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <Badge
              variant="secondary"
              className={cn('text-sm', statusColorMap[status])}
            >
              {statusInfo?.label || status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Passée le {formatDate(order.createdAt)} &middot;{' '}
            {order.vendor?.businessName || 'Vendeur'}
          </p>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formatPrice(Number(order.total))}
        </p>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStep;
                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border bg-card text-muted-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          'text-xs mt-2 font-medium text-center',
                          isCompleted ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 mx-2 mt-[-1.25rem]',
                          index < currentStep ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled notice */}
      {isCancelled && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <p className="font-medium text-red-800">Commande annulée</p>
                {order.notes && (
                  <p className="text-sm text-red-600 mt-0.5">{order.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items - takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Articles ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Coffee className="h-6 w-6 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {item.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(Number(item.unitPrice))} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground shrink-0">
                      {formatPrice(Number(item.totalPrice))}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.shippingName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">{order.shippingName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>
                    {order.shippingPostalCode} {order.shippingCity}
                  </p>
                  <p>{order.shippingCountry}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  Suivi de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md text-foreground">
                  {order.trackingNumber}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vendor */}
          {order.vendor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Vendeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {order.vendor.businessName}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-40 bg-muted rounded" />
      <div className="flex justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-5 w-64 bg-muted rounded mt-2" />
        </div>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-3 w-16 bg-muted rounded mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

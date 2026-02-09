'use client';

import Link from 'next/link';
import {
  Package,
  ArrowRight,
  Coffee,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import { useState } from 'react';

type OrderStatus = keyof typeof ORDER_STATUSES;

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

export function OrdersContent() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.order.myOrders.useInfiniteQuery(
    {
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const orders = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
        <p className="text-muted-foreground mt-1">
          Suivez et gérez toutes vos commandes.
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {statusFilter === 'all'
                  ? 'Aucune commande'
                  : `Aucune commande "${ORDER_STATUSES[statusFilter as OrderStatus]?.label}"`}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {statusFilter === 'all'
                  ? "Vous n'avez pas encore passé de commande. Explorez nos produits pour commencer !"
                  : 'Aucune commande ne correspond à ce filtre.'}
              </p>
              {statusFilter === 'all' ? (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/products">Découvrir nos produits</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setStatusFilter('all')}
                >
                  Voir toutes les commandes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            const statusInfo = ORDER_STATUSES[status];
            const itemCount = order.items.length;
            const firstItems = order.items.slice(0, 3);

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="p-4 sm:p-5">
                  {/* Top row: order number, date, status, total */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {order.orderNumber}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', statusColorMap[status])}
                        >
                          {statusInfo?.label || status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatDate(order.createdAt)} &middot;{' '}
                        {order.vendor?.businessName || 'Vendeur'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(Number(order.total))}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {firstItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden"
                        >
                          <Coffee className="h-4 w-4 text-primary/50" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {itemCount} {itemCount > 1 ? 'articles' : 'article'}
                    </span>
                    {order.trackingNumber && (
                      <Badge variant="outline" className="text-xs ml-auto">
                        Suivi: {order.trackingNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  'Charger plus de commandes'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border p-5">
          <div className="flex justify-between mb-3">
            <div>
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded mt-2" />
            </div>
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="h-4 w-16 bg-muted rounded self-center ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

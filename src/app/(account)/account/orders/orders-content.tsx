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
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
        <p className="text-gray-500 mt-1">
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
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === 'all'
                  ? 'Aucune commande'
                  : `Aucune commande "${ORDER_STATUSES[statusFilter as OrderStatus]?.label}"`}
              </h2>
              <p className="text-gray-500 mb-6 max-w-sm">
                {statusFilter === 'all'
                  ? "Vous n'avez pas encore passé de commande. Explorez nos produits pour commencer !"
                  : 'Aucune commande ne correspond à ce filtre.'}
              </p>
              {statusFilter === 'all' ? (
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
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
                className="block rounded-lg border hover:border-purple-200 hover:shadow-sm transition-all group"
              >
                <div className="p-4 sm:p-5">
                  {/* Top row: order number, date, status, total */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', statusColorMap[status])}
                        >
                          {statusInfo?.label || status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(order.createdAt)} &middot;{' '}
                        {order.vendor?.businessName || 'Vendeur'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(Number(order.total))}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {firstItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center overflow-hidden"
                        >
                          <Coffee className="h-4 w-4 text-purple-300" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
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
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded mt-2" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="h-4 w-16 bg-gray-100 rounded self-center ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

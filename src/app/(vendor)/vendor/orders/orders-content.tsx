'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Loader2,
  User,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ORDER_STATUS_BADGE } from '@/lib/order-status-badge';

const STATUS_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'paid', label: 'Payées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
] as const;

export function VendorOrdersContent() {
  const utils = api.useUtils();
  const [filter, setFilter] = useState<string>('all');
  const [updateOrderId, setUpdateOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.order.vendorOrders.useInfiniteQuery(
      {
        limit: 10,
        status: filter === 'all' ? undefined : (filter as 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'),
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Statut mis à jour !');
      utils.order.vendorOrders.invalidate();
      setUpdateOrderId(null);
      setNewStatus('');
      setTrackingNumber('');
    },
    onError: (error) => {
      toast.error('Erreur', { description: error.message });
    },
  });

  const orders = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commandes reçues</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les commandes de vos clients.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === status.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {filter === 'all'
                  ? 'Aucune commande pour le moment.'
                  : 'Aucune commande avec ce statut.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status as keyof typeof ORDER_STATUSES;
            const statusInfo = ORDER_STATUSES[status];

            return (
              <Card key={order.id} className="gap-0 py-0">
                <CardContent className="p-5 [&>*:last-child]:mb-0">
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          {order.orderNumber}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={ORDER_STATUS_BADGE[status] || ''}
                        >
                          {statusInfo?.label || status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground text-lg">
                        {formatPrice(Number(order.total))}
                      </p>
                      {order.commission && (
                        <p className="text-xs text-muted-foreground">
                          Commission : {formatPrice(Number(order.commission))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">
                        {order.user?.name || 'Client'}
                      </span>
                      {order.user?.email && (
                        <span className="text-muted-foreground ml-2">{order.user.email}</span>
                      )}
                    </div>
                    {order.shippingCity && (
                      <>
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
                        <span className="text-sm text-muted-foreground">
                          {order.shippingCity}, {order.shippingPostalCode}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.productName}{' '}
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="text-muted-foreground">
                          {formatPrice(Number(item.totalPrice))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking */}
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm p-2 rounded bg-primary/5 mb-4">
                      <Truck className="h-4 w-4 text-primary/70" />
                      <span className="text-primary">
                        Suivi : {order.trackingNumber}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {status !== 'cancelled' && status !== 'delivered' && (
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      {status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUpdateOrderId(order.id);
                            setNewStatus('processing');
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          En préparation
                        </Button>
                      )}
                      {(status === 'paid' || status === 'processing') && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => {
                            setUpdateOrderId(order.id);
                            setNewStatus('shipped');
                          }}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Marquer expédiée
                        </Button>
                      )}
                      {status === 'shipped' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setUpdateOrderId(order.id);
                            setNewStatus('delivered');
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marquer livrée
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Load more */}
      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />

      {/* Update Status Dialog */}
      <Dialog open={!!updateOrderId} onOpenChange={() => {
        setUpdateOrderId(null);
        setNewStatus('');
        setTrackingNumber('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
            <DialogDescription>
              {newStatus === 'processing' && 'Marquer cette commande comme en cours de préparation.'}
              {newStatus === 'shipped' && 'Marquer cette commande comme expédiée. Vous pouvez ajouter un numéro de suivi.'}
              {newStatus === 'delivered' && 'Marquer cette commande comme livrée.'}
            </DialogDescription>
          </DialogHeader>

          {newStatus === 'shipped' && (
            <div className="space-y-2">
              <Label htmlFor="tracking">Numéro de suivi (optionnel)</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ex: COLISSIMO-123456789"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOrderId(null)}>
              Annuler
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={updateStatus.isPending}
              onClick={() => {
                if (updateOrderId && newStatus) {
                  updateStatus.mutate({
                    orderId: updateOrderId,
                    status: newStatus as 'processing' | 'shipped' | 'delivered',
                    trackingNumber: trackingNumber || undefined,
                  });
                }
              }}
            >
              {updateStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-56 bg-muted rounded" />
        <div className="h-5 w-72 bg-muted/50 rounded mt-2" />
      </div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

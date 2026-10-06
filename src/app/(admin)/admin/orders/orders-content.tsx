'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';
import { ORDER_STATUS_BADGE } from '@/lib/order-status-badge';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export function AdminOrdersContent() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    reason: string;
  }>({ open: false, orderId: '', orderNumber: '', reason: '' });

  const queryInput = statusFilter === 'all'
    ? { limit: 50 as const }
    : { limit: 50 as const, status: statusFilter as OrderStatus };

  const { data, isLoading, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.order.adminList.useInfiniteQuery(queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const cancelOrder = api.order.adminCancel.useMutation({
    onSuccess: () => {
      toast.success('Commande annulée et remboursée');
      setCancelDialog((prev) => ({ ...prev, open: false }));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'annulation');
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
        <h1 className="text-2xl font-bold text-foreground">Toutes les commandes</h1>
        <p className="text-muted-foreground mt-1">
          {orders.length}{hasNextPage ? '+' : ''} commande{orders.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(ORDER_STATUSES).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucune commande trouvée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = order.status as keyof typeof ORDER_STATUSES;
                const statusInfo = ORDER_STATUSES[status];
                // Paiement en attente : il expire tout seul. Livrée : trop tard.
                const canCancel =
                  status === 'paid' || status === 'processing' || status === 'shipped';
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                          <ShoppingCart className="h-5 w-5 text-primary/60" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className={ORDER_STATUS_BADGE[status] || ''}>
                          {statusInfo?.label || status}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pl-0 sm:pl-14">
                      <span>
                        Client : {order.user?.name || order.user?.email || 'Inconnu'}
                      </span>
                      <span>
                        Vendeur : {order.vendor?.businessName || 'Inconnu'}
                      </span>
                      <span>
                        Commission : {formatPrice(Number(order.commission))}
                      </span>
                      {order.items && (
                        <span>
                          {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {canCancel && (
                      <div className="pl-0 sm:pl-14">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() =>
                            setCancelDialog({
                              open: true,
                              orderId: order.id,
                              orderNumber: order.orderNumber,
                              reason: '',
                            })
                          }
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment annuler la commande <strong>{cancelDialog.orderNumber}</strong> ?
              Le client sera remboursé intégralement. Les articles reviennent en stock
              si la commande n&apos;est pas encore expédiée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground block mb-2">
              Raison (optionnel)
            </label>
            <Input
              placeholder="Raison de l'annulation..."
              value={cancelDialog.reason}
              onChange={(e) =>
                setCancelDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog((prev) => ({ ...prev, open: false }))}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cancelOrder.mutate({
                  orderId: cancelDialog.orderId,
                  reason: cancelDialog.reason || undefined,
                })
              }
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
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
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-5 w-40 bg-muted/50 rounded mt-2" />
      </div>
      <div className="h-10 w-48 bg-muted rounded" />
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

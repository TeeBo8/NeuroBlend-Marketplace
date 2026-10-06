'use client';

import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Calendar,
  ArrowRight,
  Coffee,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { useSession } from '@/lib/auth-client';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import { ORDER_STATUS_BADGE } from '@/lib/order-status-badge';

export function DashboardContent() {
  const { data: session } = useSession();
  const { data: user, isLoading: userLoading } = api.user.me.useQuery();
  const { data: ordersData, isLoading: ordersLoading } =
    api.order.myOrders.useQuery({ limit: 5 });
  const { data: stats, isLoading: statsLoading } =
    api.order.myStats.useQuery();

  const isLoading = userLoading || ordersLoading || statsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const orders = ordersData?.items || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {user?.name || session?.user?.name || 'Utilisateur'} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace client NeuroBlend.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.orders ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(stats?.totalSpent ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15">
                <Calendar className="h-6 w-6 text-orange-700 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="text-2xl font-bold text-foreground">
                  {user?.createdAt
                    ? formatDate(user.createdAt, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Commandes récentes</CardTitle>
          {orders.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/account/orders"
                className="text-primary hover:text-primary"
              >
                Tout voir
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Coffee className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore de commandes.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/products">Découvrir nos produits</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = order.status as keyof typeof ORDER_STATUSES;
                const statusInfo = ORDER_STATUSES[status];
                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                        <Package className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)} &middot;{' '}
                          {order.items.length}{' '}
                          {order.items.length > 1 ? 'articles' : 'article'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className={ORDER_STATUS_BADGE[status] || ''}
                      >
                        {statusInfo?.label || status}
                      </Badge>
                      <span className="font-semibold text-foreground">
                        {formatPrice(Number(order.total))}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/products"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Coffee className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Parcourir les produits</p>
            <p className="text-sm text-muted-foreground">
              Découvrez nos capsules neuro-optimisées
            </p>
          </div>
        </Link>
        <Link
          href="/account/settings"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Paramètres du compte</p>
            <p className="text-sm text-muted-foreground">
              Modifiez vos informations personnelles
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-5 w-80 bg-muted rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div>
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-7 w-16 bg-muted rounded mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

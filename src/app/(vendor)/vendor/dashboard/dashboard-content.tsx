'use client';

import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  CreditCard,
  Clock,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { useSession } from '@/lib/auth-client';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function VendorDashboardContent() {
  const { data: session } = useSession();
  const { data: vendor, isLoading: vendorLoading } = api.vendor.me.useQuery();
  const { data: ordersData, isLoading: ordersLoading } = api.order.vendorOrders.useQuery(
    { limit: 5 },
    { enabled: !!vendor }
  );
  const { data: stats, isLoading: statsLoading } = api.vendor.myStats.useQuery(
    undefined,
    { enabled: !!vendor }
  );
  const { data: stripeStatus } = api.payment.getConnectStatus.useQuery(
    undefined,
    { enabled: !!vendor }
  );

  const isLoading = vendorLoading || ordersLoading || statsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-primary/60" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Profil vendeur introuvable
        </h1>
        <p className="text-muted-foreground mb-8">
          Vous n&apos;avez pas encore de profil vendeur.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/vendor/register">Créer mon profil vendeur</Link>
        </Button>
      </div>
    );
  }

  const orders = ordersData?.items || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {session?.user?.name || 'Vendeur'} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace vendeur &mdash; {vendor.businessName}
        </p>
      </div>

      {/* Approval Warning */}
      {!vendor.approved && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Validation en cours</p>
            <p className="text-sm text-yellow-700 mt-1">
              Votre boutique est en attente de validation par notre équipe. Vous pourrez ajouter des produits une fois approuvé.
            </p>
          </div>
        </div>
      )}

      {/* Stripe Warning */}
      {vendor.approved && !stripeStatus?.onboardingComplete && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-800">Configuration des paiements requise</p>
            <p className="text-sm text-orange-700 mt-1">
              Configurez Stripe Connect pour recevoir les paiements de vos ventes.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100">
            <Link href="/vendor/payouts">Configurer</Link>
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold text-foreground">{stats?.products ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/20">
                <ShoppingCart className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold text-foreground">{stats?.orders ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(stats?.revenue ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À traiter</p>
                <p className="text-2xl font-bold text-foreground">{stats?.toProcess ?? 0}</p>
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
              <Link href="/vendor/orders" className="text-primary hover:text-primary">
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
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">Aucune commande pour le moment.</p>
              <p className="text-sm text-muted-foreground">
                Les commandes apparaîtront ici une fois que vos produits seront en vente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = order.status as keyof typeof ORDER_STATUSES;
                const statusInfo = ORDER_STATUSES[status];
                return (
                  <Link
                    key={order.id}
                    href={`/vendor/orders?highlight=${order.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                        <ShoppingCart className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)} &middot;{' '}
                          {order.user?.name || order.user?.email || 'Client'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className={statusColorMap[status] || ''}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendor.approved && (
          <Link
            href="/vendor/products/new"
            className="flex items-center gap-4 p-5 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Ajouter un produit</p>
              <p className="text-sm text-muted-foreground">Créez une nouvelle fiche produit</p>
            </div>
          </Link>
        )}
        <Link
          href="/vendor/products"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20 group-hover:bg-chart-2/30 transition-colors">
            <Coffee className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="font-medium text-foreground">Gérer mes produits</p>
            <p className="text-sm text-muted-foreground">Voir et modifier vos produits</p>
          </div>
        </Link>
        <Link
          href="/vendor/payouts"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">Paiements</p>
            <p className="text-sm text-muted-foreground">
              {stripeStatus?.onboardingComplete ? 'Gérer Stripe Connect' : 'Configurer les paiements'}
            </p>
          </div>
        </Link>
      </div>

      {/* Approval status */}
      {vendor.approved && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm text-green-800">
              <span className="font-medium">Boutique approuvée</span> &mdash; Commission : {vendor.commissionRate || '15'}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-5 w-80 bg-muted/50 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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

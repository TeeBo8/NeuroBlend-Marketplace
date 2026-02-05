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

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function DashboardContent() {
  const { data: session } = useSession();
  const { data: user, isLoading: userLoading } = api.user.me.useQuery();
  const { data: ordersData, isLoading: ordersLoading } =
    api.order.myOrders.useQuery({ limit: 5 });

  const isLoading = userLoading || ordersLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const orders = ordersData?.items || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name || session?.user?.name || 'Utilisateur'} !
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenue dans votre espace client NeuroBlend.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <ShoppingBag className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total dépensé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="text-2xl font-bold text-gray-900">
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
                className="text-purple-600 hover:text-purple-700"
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
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Coffee className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">
                Vous n&apos;avez pas encore de commandes.
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
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
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                        <Package className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)} &middot;{' '}
                          {order.items.length}{' '}
                          {order.items.length > 1 ? 'articles' : 'article'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className={statusColorMap[status] || ''}
                      >
                        {statusInfo?.label || status}
                      </Badge>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(Number(order.total))}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
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
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
            <Coffee className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Parcourir les produits</p>
            <p className="text-sm text-gray-500">
              Découvrez nos capsules neuro-optimisées
            </p>
          </div>
        </Link>
        <Link
          href="/account/settings"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
            <Settings className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Paramètres du compte</p>
            <p className="text-sm text-gray-500">
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
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-5 w-80 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-7 w-16 bg-gray-200 rounded mt-1" />
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
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

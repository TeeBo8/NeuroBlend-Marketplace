'use client';

import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
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

export function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading } = api.admin.getStats.useQuery();
  const { data: recentOrders, isLoading: ordersLoading } = api.admin.getRecentOrders.useQuery({ limit: 5 });
  const { data: topVendors, isLoading: vendorsLoading } = api.admin.getTopVendors.useQuery({ limit: 5 });

  const isLoading = statsLoading || ordersLoading || vendorsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Panneau d&apos;administration
        </h1>
        <p className="text-gray-500 mt-1">
          Vue d&apos;ensemble de la plateforme NeuroBlend
        </p>
      </div>

      {/* Pending vendors alert */}
      {stats && stats.pendingVendors > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">
              {stats.pendingVendors} demande{stats.pendingVendors > 1 ? 's' : ''} vendeur en attente
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Des vendeurs attendent votre validation pour commencer à vendre.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            <Link href="/admin/vendors">Voir</Link>
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendeurs actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.vendors ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Package className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.products ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.orders ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">GMV (Volume total)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats?.gmv ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commissions gagnées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats?.commissionEarned ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by status */}
      {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.ordersByStatus.map((item) => {
                const status = item.status ?? 'pending';
                const statusInfo = ORDER_STATUSES[status as keyof typeof ORDER_STATUSES];
                return (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-lg border px-4 py-3"
                  >
                    <Badge variant="secondary" className={statusColorMap[status] || ''}>
                      {statusInfo?.label || status}
                    </Badge>
                    <span className="text-lg font-bold text-gray-900">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Commandes récentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders" className="text-purple-600 hover:text-purple-700">
              Tout voir
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500">Aucune commande pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const status = order.status as keyof typeof ORDER_STATUSES;
                const statusInfo = ORDER_STATUSES[status];
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                        <ShoppingCart className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)} &middot;{' '}
                          {order.user?.name || order.user?.email || 'Client'} &middot;{' '}
                          {order.vendor?.businessName || 'Vendeur'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className={statusColorMap[status] || ''}>
                        {statusInfo?.label || status}
                      </Badge>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Vendors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Top vendeurs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/vendors" className="text-purple-600 hover:text-purple-700">
              Tout voir
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!topVendors || topVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500">Aucun vendeur avec des ventes pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topVendors.map((item, idx) => (
                <div
                  key={item.vendor?.id || idx}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.vendor?.businessName || 'Vendeur inconnu'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.orderCount} commande{item.orderCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatPrice(item.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Utilisateurs</p>
            <p className="text-sm text-gray-500">Gérer les comptes</p>
          </div>
        </Link>
        <Link
          href="/admin/vendors"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
            <Store className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Vendeurs</p>
            <p className="text-sm text-gray-500">Approuver & gérer</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
            <ShoppingCart className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Commandes</p>
            <p className="text-sm text-gray-500">Suivre les commandes</p>
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="flex items-center gap-4 p-5 rounded-lg border hover:border-purple-200 hover:bg-purple-50/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
            <Package className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Produits</p>
            <p className="text-sm text-gray-500">Gérer le catalogue</p>
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
        <div className="h-8 w-72 bg-gray-200 rounded" />
        <div className="h-5 w-96 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-7 w-24 bg-gray-200 rounded mt-1" />
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

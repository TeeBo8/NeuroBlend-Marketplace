'use client';

import { useState } from 'react';
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function AdminVendorsContent() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    vendorId: string;
    businessName: string;
  }>({ open: false, vendorId: '', businessName: '' });
  const [commissionDialog, setCommissionDialog] = useState<{
    open: boolean;
    vendorId: string;
    businessName: string;
    currentRate: string;
    newRate: string;
  }>({ open: false, vendorId: '', businessName: '', currentRate: '', newRate: '' });

  const queryInput = statusFilter === 'all'
    ? { limit: 50 as const }
    : { limit: 50 as const, approved: statusFilter === 'approved' };

  const { data, isLoading, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.vendor.adminList.useInfiniteQuery(queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const approveVendor = api.vendor.approve.useMutation({
    onSuccess: () => {
      toast.success('Vendeur approuvé avec succès');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'approbation');
    },
  });

  const rejectVendor = api.vendor.reject.useMutation({
    onSuccess: () => {
      toast.success('Vendeur rejeté');
      setRejectDialog((prev) => ({ ...prev, open: false }));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors du rejet');
    },
  });

  const updateCommission = api.vendor.updateCommission.useMutation({
    onSuccess: () => {
      toast.success('Commission mise à jour');
      setCommissionDialog((prev) => ({ ...prev, open: false }));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const vendors = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <VendorsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des vendeurs</h1>
        <p className="text-muted-foreground mt-1">
          {vendors.length}{hasNextPage ? '+' : ''} vendeur{vendors.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendeurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucun vendeur trouvé.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="rounded-lg border p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {vendor.businessName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.user?.name || 'Sans nom'} &middot; {vendor.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Inscrit le {formatDate(vendor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {vendor.approved ? (
                        <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Approuvé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-300">
                          <Clock className="mr-1 h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {vendor.description && (
                      <p className="text-muted-foreground line-clamp-2">{vendor.description}</p>
                    )}
                    {vendor.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {vendor.website}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      Commission : {vendor.commissionRate || '15.00'}%
                    </span>
                    {vendor.stripeOnboardingComplete && (
                      <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs">
                        Stripe OK
                      </Badge>
                    )}
                    {vendor.isPremium && (
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!vendor.approved && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveVendor.mutate({ vendorId: vendor.id })}
                          disabled={approveVendor.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => setRejectDialog({ open: true, vendorId: vendor.id, businessName: vendor.businessName })}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCommissionDialog({
                          open: true,
                          vendorId: vendor.id,
                          businessName: vendor.businessName,
                          currentRate: vendor.commissionRate || '15.00',
                          newRate: vendor.commissionRate || '15.00',
                        })
                      }
                    >
                      <Percent className="mr-1 h-4 w-4" />
                      Commission
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le vendeur</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment rejeter <strong>{rejectDialog.businessName}</strong> ?
              Le profil vendeur sera supprimé et le rôle de l&apos;utilisateur sera remis à client.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog((prev) => ({ ...prev, open: false }))}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectVendor.mutate({ vendorId: rejectDialog.vendorId })}
              disabled={rejectVendor.isPending}
            >
              {rejectVendor.isPending ? 'Rejet...' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog
        open={commissionDialog.open}
        onOpenChange={(open) => setCommissionDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la commission</DialogTitle>
            <DialogDescription>
              Modifier le taux de commission pour <strong>{commissionDialog.businessName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground block mb-2">
              Taux de commission (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commissionDialog.newRate}
              onChange={(e) =>
                setCommissionDialog((prev) => ({ ...prev, newRate: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommissionDialog((prev) => ({ ...prev, open: false }))}
            >
              Annuler
            </Button>
            <Button
              onClick={() =>
                updateCommission.mutate({
                  vendorId: commissionDialog.vendorId,
                  commissionRate: parseFloat(commissionDialog.newRate),
                })
              }
              disabled={updateCommission.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateCommission.isPending ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorsSkeleton() {
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

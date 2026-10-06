'use client';

import { useState } from 'react';
import {
  Users,
  Shield,
  Store,
  User,
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
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import { formatDate } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

const roleIconMap: Record<string, React.ElementType> = {
  customer: User,
  vendor: Store,
  admin: Shield,
};

const roleBadgeMap: Record<string, string> = {
  customer: 'bg-muted text-foreground',
  vendor: 'bg-primary/10 text-primary',
  admin: 'bg-destructive/10 text-destructive',
};

export function AdminUsersContent() {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentRole: string;
    newRole: string;
  }>({ open: false, userId: '', userName: '', currentRole: '', newRole: '' });

  const queryInput = roleFilter === 'all'
    ? { limit: 50 as const }
    : { limit: 50 as const, role: roleFilter as 'customer' | 'vendor' | 'admin' };

  const { data, isLoading, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.user.adminList.useInfiniteQuery(queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  const updateRole = api.user.adminUpdateRole.useMutation({
    onSuccess: () => {
      toast.success('Rôle mis à jour avec succès');
      setRoleDialog((prev) => ({ ...prev, open: false }));
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    },
  });

  const users = data?.pages.flatMap((page) => page.items) ?? [];

  const handleRoleChange = (userId: string, userName: string, currentRole: string, newRole: string) => {
    setRoleDialog({ open: true, userId, userName, currentRole, newRole });
  };

  const confirmRoleChange = () => {
    updateRole.mutate({
      userId: roleDialog.userId,
      role: roleDialog.newRole as 'customer' | 'vendor' | 'admin',
    });
  };

  if (isLoading) {
    return <UsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground mt-1">
          {users.length}{hasNextPage ? '+' : ''} utilisateur{users.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="customer">Clients</SelectItem>
            <SelectItem value="vendor">Vendeurs</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const role = user.role || 'customer';
                const RoleIcon = roleIconMap[role] || User;
                const roleInfo = USER_ROLES[role as keyof typeof USER_ROLES];
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <RoleIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {user.name || 'Sans nom'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email} &middot; Inscrit le {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary" className={roleBadgeMap[role] || ''}>
                        {roleInfo?.label || role}
                      </Badge>
                      <Select
                        value={role}
                        onValueChange={(newRole) => {
                          if (newRole !== role) {
                            handleRoleChange(user.id, user.name || user.email, role, newRole);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Client</SelectItem>
                          <SelectItem value="vendor">Vendeur</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

      {/* Confirm Role Change Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) => setRoleDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment changer le rôle de <strong>{roleDialog.userName}</strong> de{' '}
              <strong>{USER_ROLES[roleDialog.currentRole as keyof typeof USER_ROLES]?.label || roleDialog.currentRole}</strong> à{' '}
              <strong>{USER_ROLES[roleDialog.newRole as keyof typeof USER_ROLES]?.label || roleDialog.newRole}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialog((prev) => ({ ...prev, open: false }))}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={updateRole.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateRole.isPending ? 'Modification...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersSkeleton() {
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
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

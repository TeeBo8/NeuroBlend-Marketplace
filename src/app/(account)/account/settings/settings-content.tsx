'use client';

import { useState } from 'react';
import { User, Mail, Shield, Calendar, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/client';
import { formatDate } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

export function SettingsContent() {
  const { data: user, isLoading } = api.user.me.useQuery();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">
          Gérez vos informations personnelles et préférences.
        </p>
      </div>

      <SettingsForm user={user} />

      {/* Account Info (read-only) */}
      <AccountInfo user={user} />
    </div>
  );
}

type UserData = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
};

function SettingsForm({ user }: { user: UserData }) {
  const utils = api.useUtils();
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');

  const updateProfile = api.user.update.useMutation({
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès');
      utils.user.me.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error.message,
      });
    },
  });

  const hasChanges =
    name !== (user.name || '') || image !== (user.image || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: { name?: string; image?: string } = {};

    if (name && name !== user.name) {
      updates.name = name;
    }
    if (image && image !== user.image) {
      updates.image = image;
    }

    if (Object.keys(updates).length === 0) {
      toast.info('Aucune modification détectée');
      return;
    }

    updateProfile.mutate(updates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-gray-400" />
          Informations personnelles
        </CardTitle>
        <CardDescription>
          Mettez à jour votre nom et votre photo de profil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL de la photo de profil</Label>
            <Input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://exemple.com/photo.jpg"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={updateProfile.isPending || !hasChanges}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountInfo({ user }: { user: UserData }) {
  const roleInfo = USER_ROLES[user.role as keyof typeof USER_ROLES];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-400" />
          Informations du compte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 py-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Rôle</p>
              <p className="font-medium text-gray-900">
                {roleInfo?.label || user.role}
              </p>
            </div>
          </div>
          <Badge variant="outline">{user.role}</Badge>
        </div>

        <Separator />

        <div className="flex items-center gap-3 py-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Membre depuis</p>
            <p className="font-medium text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-72 bg-gray-100 rounded mt-2" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-48 bg-gray-100 rounded mt-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

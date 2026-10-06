'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Coffee,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/client';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { DEFAULT_COMMISSION_RATE } from '@/lib/constants';

const BENEFITS = [
  {
    icon: Coffee,
    title: 'Vendez vos capsules',
    description: 'Proposez vos créations à une communauté de passionnés neuroatypiques.',
  },
  {
    icon: TrendingUp,
    title: 'Développez votre activité',
    description: 'Accédez à un marché en pleine croissance avec des outils de gestion intégrés.',
  },
  {
    icon: Users,
    title: 'Communauté engagée',
    description: 'Rejoignez des torréfacteurs passionnés et bénéficiez de la visibilité NeuroBlend.',
  },
] as const;

export function RegisterContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  const { data: existingVendor, isLoading: vendorLoading } = api.vendor.me.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  const registerVendor = api.vendor.register.useMutation({
    onSuccess: () => {
      toast.success('Inscription vendeur réussie !', {
        description: 'Votre demande est en cours de validation. Vous pouvez déjà accéder à votre espace.',
      });
      router.push('/vendor/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'inscription", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error('Le nom de votre entreprise est requis');
      return;
    }
    registerVendor.mutate({
      businessName: businessName.trim(),
      description: description.trim() || undefined,
      website: website.trim() || undefined,
    });
  };

  // Already a vendor - redirect to dashboard
  if (existingVendor) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-700 dark:text-green-300" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Vous êtes déjà vendeur !
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Votre boutique &quot;{existingVendor.businessName}&quot; est{' '}
          {existingVendor.approved ? 'active' : 'en attente de validation'}.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/vendor/dashboard">
            Accéder à mon espace vendeur
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Devenir vendeur NeuroBlend
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Rejoignez notre marketplace et vendez vos capsules de café artisanales à une communauté de passionnés.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card key={benefit.title} className="text-center">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de votre boutique</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour créer votre espace vendeur.
            Commission plateforme : {DEFAULT_COMMISSION_RATE}% par vente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">
                Nom de votre boutique <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Torréfaction du Vieux Port"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre activité, vos valeurs, vos spécialités..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.votre-site.com"
              />
            </div>

            <div className="rounded-lg bg-primary/5 p-4 text-sm text-primary">
              <p className="font-medium mb-1">Comment ça marche ?</p>
              <ol className="list-decimal list-inside space-y-1 text-primary">
                <li>Créez votre profil vendeur</li>
                <li>Votre compte est validé par notre équipe</li>
                <li>Configurez vos paiements via Stripe</li>
                <li>Ajoutez vos produits et commencez à vendre !</li>
              </ol>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={registerVendor.isPending || !businessName.trim()}
            >
              {registerVendor.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Créer mon espace vendeur
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

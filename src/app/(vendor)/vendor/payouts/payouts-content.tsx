'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Shield,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

export function PayoutsContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const refresh = searchParams.get('refresh');

  const { data: vendor, isLoading: vendorLoading } = api.vendor.me.useQuery();
  const { data: stripeStatus, isLoading: stripeLoading, refetch: refetchStripe } =
    api.payment.getConnectStatus.useQuery(undefined, {
      enabled: !!vendor,
    });

  const createAccount = api.payment.createConnectAccount.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error('Erreur Stripe', { description: error.message });
    },
  });

  const { data: dashboardLink } = api.payment.getDashboardLink.useQuery(
    undefined,
    {
      enabled: !!stripeStatus?.onboardingComplete,
    }
  );

  // Handle return from Stripe onboarding
  useEffect(() => {
    if (success === 'true') {
      toast.success('Configuration Stripe terminée !', {
        description: 'Votre compte est prêt à recevoir des paiements.',
      });
      refetchStripe();
    }
    if (refresh === 'true') {
      toast.info('Session expirée', {
        description: 'Relancez la configuration si nécessaire.',
      });
    }
  }, [success, refresh, refetchStripe]);

  const isLoading = vendorLoading || stripeLoading;

  if (isLoading) {
    return <PayoutsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-500 mt-1">
          Gérez votre compte Stripe Connect pour recevoir vos paiements.
        </p>
      </div>

      {/* Stripe Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Stripe Connect</CardTitle>
                <CardDescription>Statut de votre compte de paiement</CardDescription>
              </div>
            </div>
            <StripeStatusBadge status={stripeStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status checklist */}
            <div className="space-y-3">
              <StatusItem
                label="Compte Stripe créé"
                completed={!!stripeStatus?.connected}
              />
              <StatusItem
                label="Informations complétées"
                completed={!!stripeStatus?.onboardingComplete}
              />
              <StatusItem
                label="Paiements activés"
                completed={!!stripeStatus?.payoutsEnabled}
              />
            </div>

            <Separator />

            {/* Actions */}
            {!stripeStatus?.connected ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connectez votre compte Stripe pour recevoir les paiements de vos ventes. La configuration prend quelques minutes.
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => createAccount.mutate()}
                  disabled={createAccount.isPending}
                >
                  {createAccount.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Configurer Stripe Connect
                    </>
                  )}
                </Button>
              </div>
            ) : !stripeStatus?.onboardingComplete ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Votre configuration Stripe n&apos;est pas encore terminée.
                      Complétez-la pour pouvoir recevoir des paiements.
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => createAccount.mutate()}
                  disabled={createAccount.isPending}
                >
                  {createAccount.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Reprendre la configuration
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">
                      Votre compte Stripe est entièrement configuré. Vous pouvez recevoir des paiements.
                    </p>
                  </div>
                </div>
                {dashboardLink?.url && (
                  <Button variant="outline" asChild>
                    <a href={dashboardLink.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ouvrir le tableau de bord Stripe
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 shrink-0">
                <Banknote className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Commission</h3>
                <p className="text-sm text-gray-500">
                  La commission NeuroBlend est de{' '}
                  <span className="font-semibold text-gray-700">
                    {vendor?.commissionRate || '15'}%
                  </span>{' '}
                  par vente. Le reste est viré directement sur votre compte Stripe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shrink-0">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sécurité</h3>
                <p className="text-sm text-gray-500">
                  Tous les paiements sont sécurisés par Stripe. Vos informations bancaires ne passent jamais par NeuroBlend.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
      )}
      <span
        className={
          completed ? 'text-gray-900 font-medium' : 'text-gray-500'
        }
      >
        {label}
      </span>
    </div>
  );
}

function StripeStatusBadge({
  status,
}: {
  status:
    | { connected: boolean; onboardingComplete: boolean; payoutsEnabled: boolean }
    | undefined;
}) {
  if (!status?.connected) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Non configuré
      </Badge>
    );
  }
  if (!status.onboardingComplete) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Configuration incomplète
      </Badge>
    );
  }
  if (status.payoutsEnabled) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Actif
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      En cours de vérification
    </Badge>
  );
}

function PayoutsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-72 bg-gray-100 rounded mt-2" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-100 rounded mt-1" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-gray-200" />
                  <div className="h-5 w-40 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

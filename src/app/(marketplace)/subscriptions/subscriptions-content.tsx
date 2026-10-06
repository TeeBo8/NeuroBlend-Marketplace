'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Loader2,
  Coffee,
  Sparkles,
  Crown,
  Repeat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { api } from '@/trpc/client';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import Link from 'next/link';

const PLAN_ICONS = {
  decouverte: Coffee,
  essentiel: Sparkles,
  premium: Crown,
} as const;

export function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: mySubscription } = api.subscription.mySubscription.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  const createCheckout = api.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingPlan(null);
    },
  });

  const manageSubscription = api.subscription.manage.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  const handleSubscribe = (planId: string) => {
    if (!session?.user) {
      toast.error('Connectez-vous pour vous abonner');
      return;
    }
    setLoadingPlan(planId);
    createCheckout.mutate({
      planId: planId as 'decouverte' | 'essentiel' | 'premium',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success / Cancelled messages */}
      {success && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Abonnement activé avec succès ! Bienvenue dans le club NeuroBlend.
          </p>
        </div>
      )}
      {cancelled && (
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
          <p className="text-yellow-700 dark:text-yellow-300 font-medium">
            Abonnement annulé. Vous pouvez réessayer quand vous le souhaitez.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Repeat className="w-4 h-4" />
          Abonnements mensuels
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Votre café, chaque mois
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Recevez une sélection de capsules adaptées à votre profil neuroatypique.
          Sans engagement, annulable à tout moment.
        </p>
      </div>

      {/* Current subscription */}
      {mySubscription && mySubscription.status === 'active' && (
        <div className="max-w-md mx-auto mb-12">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Badge className="bg-primary text-primary-foreground mb-3">
                Abonnement actif
              </Badge>
              <p className="text-foreground mb-4">
                Vous êtes abonné(e). Gérez votre abonnement ou changez de formule
                depuis le portail Stripe.
              </p>
              <Button
                onClick={() => manageSubscription.mutate()}
                disabled={manageSubscription.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {manageSubscription.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Gérer mon abonnement
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS];
          const isLoading = loadingPlan === plan.id;
          const isActive =
            mySubscription?.status === 'active';

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden transition-shadow hover:shadow-lg',
                plan.highlight &&
                  'border-2 border-primary shadow-md'
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5">
                  Le plus populaire
                </div>
              )}
              <CardHeader
                className={cn('text-center pb-2', plan.highlight && 'pt-10')}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3',
                    plan.highlight
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-7 h-7',
                      plan.highlight
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price.toFixed(2).replace('.', ',')}€
                  </span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!session?.user ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                ) : isActive ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Déjà abonné(e)
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      'w-full',
                      plan.highlight
                        ? 'bg-primary hover:bg-primary/90'
                        : ''
                    )}
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      "S'abonner"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Puis-je annuler à tout moment ?',
              a: 'Oui, sans engagement. Vous pouvez annuler depuis votre espace abonnement à tout moment.',
            },
            {
              q: 'Quand vais-je recevoir mes capsules ?',
              a: 'Votre première livraison part sous 7 jours. Ensuite, chaque mois à la même date.',
            },
            {
              q: 'Puis-je changer de formule ?',
              a: 'Absolument. Vous pouvez upgrader ou downgrader depuis le portail de gestion.',
            },
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubscriptionsContent } from './subscriptions-content';

export const metadata: Metadata = {
  title: 'Abonnements capsules café — Dès 9,90€/mois sans engagement',
  description:
    'Recevez chaque mois une sélection de capsules de café artisanales adaptées à votre profil neuroatypique. 3 formules dès 9,90€/mois, livraison offerte, sans engagement.',
  keywords: [
    'abonnement café',
    'capsules par abonnement',
    'box café mensuelle',
    'sans engagement',
    'café neuroatypique',
  ],
  openGraph: {
    title: 'Abonnements | NeuroBlend',
    description:
      'Capsules artisanales livrées chaque mois, adaptées à votre profil. Dès 9,90€/mois.',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: '/subscriptions',
  },
};

function SubscriptionsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4 text-center">
        <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-5 w-full max-w-96 bg-muted rounded animate-pulse mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsLoading />}>
      <SubscriptionsContent />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubscriptionsContent } from './subscriptions-content';

export const metadata: Metadata = {
  title: 'Abonnements - NeuroBlend',
  description:
    'Recevez chaque mois une sélection de capsules de café adaptées à votre profil neuroatypique.',
};

function SubscriptionsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4 text-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
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

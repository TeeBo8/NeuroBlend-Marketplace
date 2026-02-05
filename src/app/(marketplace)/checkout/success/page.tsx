import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SuccessContent } from './success-content';

export const metadata: Metadata = {
  title: 'Commande confirmée | NeuroBlend',
  description: 'Votre commande a été confirmée avec succès',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VendorsContent } from './vendors-content';

export const metadata: Metadata = {
  title: 'Nos torréfacteurs',
  description:
    'Découvrez les torréfacteurs artisanaux partenaires de NeuroBlend. Des artisans passionnés qui créent des capsules d\u2019exception.',
};

function VendorsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4 text-center">
        <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-5 w-full max-w-96 bg-muted rounded animate-pulse mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<VendorsLoading />}>
      <VendorsContent />
    </Suspense>
  );
}

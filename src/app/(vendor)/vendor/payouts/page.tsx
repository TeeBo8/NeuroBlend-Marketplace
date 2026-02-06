import type { Metadata } from 'next';
import { PayoutsContent } from './payouts-content';

export const metadata: Metadata = {
  title: 'Paiements',
  description: 'Gérez vos paiements et Stripe Connect sur NeuroBlend',
};

export default function VendorPayoutsPage() {
  return <PayoutsContent />;
}

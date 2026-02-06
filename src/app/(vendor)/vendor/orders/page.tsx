import type { Metadata } from 'next';
import { VendorOrdersContent } from './orders-content';

export const metadata: Metadata = {
  title: 'Commandes vendeur',
  description: 'Gérez les commandes reçues sur NeuroBlend',
};

export default function VendorOrdersPage() {
  return <VendorOrdersContent />;
}

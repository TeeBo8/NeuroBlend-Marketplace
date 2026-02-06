import type { Metadata } from 'next';
import { VendorDashboardContent } from './dashboard-content';

export const metadata: Metadata = {
  title: 'Espace vendeur',
  description: 'Gérez votre boutique NeuroBlend',
};

export default function VendorDashboardPage() {
  return <VendorDashboardContent />;
}

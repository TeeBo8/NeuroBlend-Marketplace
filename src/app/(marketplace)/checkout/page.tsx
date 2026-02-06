import type { Metadata } from 'next';
import { CheckoutContent } from './checkout-content';

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande NeuroBlend en toute sécurité.',
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}

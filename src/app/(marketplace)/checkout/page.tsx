import type { Metadata } from 'next';
import { CheckoutContent } from './checkout-content';

export const metadata: Metadata = {
  title: 'Checkout | NeuroBlend',
  description: 'Finalisez votre commande NeuroBlend',
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}

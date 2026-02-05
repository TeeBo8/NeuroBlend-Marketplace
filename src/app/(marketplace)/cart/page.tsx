import type { Metadata } from 'next';
import { CartContent } from './cart-content';

export const metadata: Metadata = {
  title: 'Panier | NeuroBlend',
  description: 'Votre panier NeuroBlend',
};

export default function CartPage() {
  return <CartContent />;
}

import type { Metadata } from 'next';
import { CartContent } from './cart-content';

export const metadata: Metadata = {
  title: 'Panier',
  description: 'Votre panier NeuroBlend - consultez et modifiez vos articles.',
};

export default function CartPage() {
  return <CartContent />;
}

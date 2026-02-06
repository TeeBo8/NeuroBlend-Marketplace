import type { Metadata } from 'next';
import { NewProductContent } from './new-product-content';

export const metadata: Metadata = {
  title: 'Nouveau produit',
  description: 'Créez un nouveau produit sur NeuroBlend',
};

export default function NewProductPage() {
  return <NewProductContent />;
}

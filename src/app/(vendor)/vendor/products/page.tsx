import type { Metadata } from 'next';
import { ProductsContent } from './products-content';

export const metadata: Metadata = {
  title: 'Mes produits',
  description: 'Gérez vos produits sur NeuroBlend',
};

export default function VendorProductsPage() {
  return <ProductsContent />;
}

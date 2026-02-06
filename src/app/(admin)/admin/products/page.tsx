import type { Metadata } from 'next';
import { AdminProductsContent } from './products-content';

export const metadata: Metadata = {
  title: 'Tous les produits - Administration',
  description: 'Gérez tous les produits de la plateforme',
};

export default function AdminProductsPage() {
  return <AdminProductsContent />;
}

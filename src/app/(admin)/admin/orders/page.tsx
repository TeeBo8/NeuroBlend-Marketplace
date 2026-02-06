import type { Metadata } from 'next';
import { AdminOrdersContent } from './orders-content';

export const metadata: Metadata = {
  title: 'Toutes les commandes - Administration',
  description: 'Gérez toutes les commandes de la plateforme',
};

export default function AdminOrdersPage() {
  return <AdminOrdersContent />;
}

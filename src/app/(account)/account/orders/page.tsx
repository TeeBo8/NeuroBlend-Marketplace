import type { Metadata } from 'next';
import { OrdersContent } from './orders-content';

export const metadata: Metadata = {
  title: 'Mes commandes',
  description: 'Consultez l\'historique de vos commandes NeuroBlend',
};

export default function OrdersPage() {
  return <OrdersContent />;
}

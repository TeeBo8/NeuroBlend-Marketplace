import type { Metadata } from 'next';
import { OrderDetailContent } from './order-detail-content';

export const metadata: Metadata = {
  title: 'Détail de commande',
  description: 'Détail de votre commande NeuroBlend',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}

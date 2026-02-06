import type { Metadata } from 'next';
import { AdminVendorsContent } from './vendors-content';

export const metadata: Metadata = {
  title: 'Gestion vendeurs - Administration',
  description: 'Gérez les vendeurs de la plateforme',
};

export default function AdminVendorsPage() {
  return <AdminVendorsContent />;
}

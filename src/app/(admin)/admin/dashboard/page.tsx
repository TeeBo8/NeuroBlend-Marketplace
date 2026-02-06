import type { Metadata } from 'next';
import { AdminDashboardContent } from './dashboard-content';

export const metadata: Metadata = {
  title: 'Administration - NeuroBlend',
  description: 'Panneau d\'administration NeuroBlend',
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}

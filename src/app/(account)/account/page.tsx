import type { Metadata } from 'next';
import { DashboardContent } from './dashboard-content';

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Gérez votre compte NeuroBlend',
};

export default function AccountPage() {
  return <DashboardContent />;
}

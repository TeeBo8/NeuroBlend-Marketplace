import type { Metadata } from 'next';
import { AdminUsersContent } from './users-content';

export const metadata: Metadata = {
  title: 'Gestion utilisateurs - Administration',
  description: 'Gérez les utilisateurs de la plateforme',
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}

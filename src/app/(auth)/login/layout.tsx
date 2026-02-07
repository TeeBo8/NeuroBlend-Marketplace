import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte NeuroBlend pour accéder à vos commandes, abonnements et produits favoris.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

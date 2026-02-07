import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe NeuroBlend. Entrez votre email pour recevoir un lien de réinitialisation.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

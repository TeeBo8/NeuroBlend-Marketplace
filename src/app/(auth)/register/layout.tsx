import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Rejoignez NeuroBlend et découvrez des capsules de café artisanales adaptées aux profils neuroatypiques.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

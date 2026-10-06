import { Suspense } from 'react';
import { isDemo } from '@/lib/demo';
import { DemoEnterCard } from '@/components/demo/demo-enter-card';
import { LoginForm } from './login-form';

// En démo, il n'y a pas de connexion par mot de passe : cette page devient
// la porte d'entrée de la démonstration.
export default function LoginPage() {
  if (!isDemo) return <LoginForm />;
  return (
    // La carte lit l'adresse (messages de plafond) : il lui faut un Suspense.
    <Suspense>
      <DemoEnterCard />
    </Suspense>
  );
}

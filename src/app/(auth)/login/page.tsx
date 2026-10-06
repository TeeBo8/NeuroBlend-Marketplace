import { Suspense } from 'react';
import { isDemo } from '@/lib/demo';
import { DemoEnterCard } from '@/components/demo/demo-enter-card';
import { LoginForm } from './login-form';

// En démo, il n'y a pas de connexion par mot de passe : cette page devient
// la porte d'entrée de la démonstration.
export default function LoginPage() {
  // Les deux lisent l'adresse de la page : il leur faut un Suspense.
  return <Suspense>{isDemo ? <DemoEnterCard /> : <LoginForm />}</Suspense>;
}

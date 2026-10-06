import { isDemo } from '@/lib/demo';
import { DemoEnterCard } from '@/components/demo/demo-enter-card';
import { LoginForm } from './login-form';

// En démo, il n'y a pas de connexion par mot de passe : cette page devient
// la porte d'entrée de la démonstration.
export default function LoginPage() {
  return isDemo ? <DemoEnterCard /> : <LoginForm />;
}

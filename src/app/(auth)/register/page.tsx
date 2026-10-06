import { redirect } from 'next/navigation';
import { isDemo } from '@/lib/demo';
import { RegisterForm } from './register-form';

// En démo, l'inscription est fermée : on renvoie vers l'entrée de la démo.
export default function RegisterPage() {
  if (isDemo) redirect('/login');
  return <RegisterForm />;
}

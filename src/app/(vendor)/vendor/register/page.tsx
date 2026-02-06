import type { Metadata } from 'next';
import { RegisterContent } from './register-content';

export const metadata: Metadata = {
  title: 'Devenir vendeur',
  description: 'Inscrivez-vous en tant que vendeur sur NeuroBlend',
};

export default function VendorRegisterPage() {
  return <RegisterContent />;
}

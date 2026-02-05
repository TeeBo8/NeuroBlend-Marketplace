import type { Metadata } from 'next';
import { SettingsContent } from './settings-content';

export const metadata: Metadata = {
  title: 'Paramètres',
  description: 'Gérez les paramètres de votre compte NeuroBlend',
};

export default function SettingsPage() {
  return <SettingsContent />;
}

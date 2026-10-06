import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({
  // Dans le navigateur, l'adresse est celle de la page : la connexion marche
  // aussi sur un aperçu Vercel, dont l'adresse change à chaque branche.
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;

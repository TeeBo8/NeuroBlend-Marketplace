type SiteEnv = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_APP_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_URL?: string;
};

/**
 * Adresse publique du site, sans barre finale. À lire côté serveur seulement :
 * les variables VERCEL_* n'existent pas dans le navigateur.
 *
 * Sur un aperçu Vercel, on prend l'adresse de l'aperçu et non
 * NEXT_PUBLIC_APP_URL : sinon la connexion et le retour de paiement
 * renverraient le visiteur vers le site de production.
 */
export function resolveSiteUrl(env: SiteEnv): string {
  if (env.VERCEL_ENV === 'preview') {
    const host = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    if (host) return `https://${host}`;
  }
  return (env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** Toutes les adresses sous lesquelles ce déploiement peut être visité. */
export function resolveTrustedOrigins(env: SiteEnv): string[] {
  const origins = [resolveSiteUrl(env)];
  if (env.VERCEL_ENV === 'preview') {
    for (const host of [env.VERCEL_BRANCH_URL, env.VERCEL_URL]) {
      if (host) origins.push(`https://${host}`);
    }
  }
  return [...new Set(origins)];
}

export const siteUrl = resolveSiteUrl(process.env);
export const trustedOrigins = resolveTrustedOrigins(process.env);

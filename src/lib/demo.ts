/**
 * Mode démonstration.
 *
 * Avec DEMO_MODE, le site devient une démo publique : chaque visiteur reçoit
 * un bac à sable (trois comptes éphémères : client, vendeur, admin), le décor
 * est en lecture seule et l'inscription publique est fermée. Sans cette
 * variable, le code est celui d'une place de marché normale.
 */
export const isDemo = process.env.DEMO_MODE === 'true';

/** Même interrupteur, lisible par le navigateur (bandeau, pages d'entrée). */
export const isDemoClient = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/** Durée de vie d'un bac à sable avant son nettoyage. */
export const SANDBOX_TTL_HOURS = 24;

/** Rôles qu'un visiteur peut jouer dans son bac à sable. */
export const DEMO_ROLES = ['customer', 'vendor', 'admin'] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export function isDemoRole(value: unknown): value is DemoRole {
  return DEMO_ROLES.includes(value as DemoRole);
}

/** Les trois comptes créés pour chaque visiteur, et la page où chacun arrive. */
export const DEMO_PERSONAS: Record<DemoRole, { name: string; label: string; home: string }> = {
  customer: { name: 'Client démo', label: 'Client', home: '/products' },
  vendor: { name: 'Vendeur démo', label: 'Vendeur', home: '/vendor/dashboard' },
  admin: { name: 'Admin démo', label: 'Admin', home: '/admin/dashboard' },
};

/** Carte de test Stripe, affichée dans le bandeau. */
export const DEMO_TEST_CARD = '4242 4242 4242 4242';

/** Domaine réservé (RFC 2606) : aucune adresse de démo ne peut recevoir d'e-mail. */
export const DEMO_EMAIL_DOMAIN = 'demo.invalid';

// En démo, seules ces routes Better Auth restent ouvertes au navigateur. Tout
// le reste (inscription, connexion par mot de passe, changement d'e-mail…)
// est refusé : les comptes sont créés et connectés par /api/demo/enter et
// /api/demo/switch, jamais par l'API publique.
const DEMO_ALLOWED_AUTH_ROUTES = ['GET /get-session', 'POST /sign-out', 'GET /ok'];

export function isDemoAuthRouteAllowed(method: string, pathname: string): boolean {
  const path = pathname.replace(/^\/api\/auth/, '').replace(/\/$/, '');
  return DEMO_ALLOWED_AUTH_ROUTES.includes(`${method.toUpperCase()} ${path}`);
}

/** Plafonds contre l'abus : bacs à sable ouverts en même temps, et par adresse IP. */
export const DEMO_MAX_ACTIVE_SANDBOXES = 300;
export const DEMO_MAX_SANDBOXES_PER_IP_PER_HOUR = 5;
export const DEMO_MAX_SANDBOXES_PER_IP_PER_DAY = 15;

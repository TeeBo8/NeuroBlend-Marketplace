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

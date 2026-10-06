import { createHmac, randomUUID } from 'node:crypto';
import { and, countDistinct, eq, gt, inArray, isNotNull, lt } from 'drizzle-orm';
import { getIp } from 'better-auth/api';
import { auth } from '@/server/auth/config';
import { db } from '@/server/db';
import { orders, products, sessions, users } from '@/server/db/schema';
import {
  DEMO_EMAIL_DOMAIN,
  DEMO_MAX_ACTIVE_SANDBOXES,
  DEMO_MAX_SANDBOXES_PER_IP_PER_DAY,
  DEMO_MAX_SANDBOXES_PER_IP_PER_HOUR,
  DEMO_PERSONAS,
  DEMO_ROLES,
  SANDBOX_TTL_HOURS,
  type DemoRole,
} from '@/lib/demo';
import { SEED_PRODUCTS } from './seed-data';

// Mot de passe d'un compte de démo : dérivé de son e-mail avec le secret du
// serveur. Rien n'est stocké en clair, et personne ne peut le recalculer sans
// BETTER_AUTH_SECRET.
function demoPassword(email: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET est absente');
  return createHmac('sha256', secret).update(email).digest('hex');
}

function demoEmail(role: DemoRole, sandboxId: string): string {
  return `${role}-${sandboxId}@${DEMO_EMAIL_DOMAIN}`;
}

/**
 * Crée le bac à sable d'un visiteur : trois comptes éphémères (client,
 * vendeur, admin) reliés par le même identifiant. Renvoie cet identifiant.
 */
export async function createSandbox(): Promise<string> {
  const sandboxId = randomUUID();

  for (const role of DEMO_ROLES) {
    const email = demoEmail(role, sandboxId);
    const { user } = await auth.api.signUpEmail({
      body: { email, password: demoPassword(email), name: DEMO_PERSONAS[role].name },
    });
    // Le rôle n'est pas accepté à l'inscription : on le pose ensuite.
    await db
      .update(users)
      .set({ role, demoSandboxId: sandboxId, emailVerified: true })
      .where(eq(users.id, user.id));
    // L'inscription ouvre une session dont on ne se sert pas.
    await revokeSessions(user.id);
  }

  return sandboxId;
}

/** Bac à sable d'un utilisateur, ou null si ce n'est pas un compte de démo. */
export async function getSandboxId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ sandboxId: users.demoSandboxId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.sandboxId ?? null;
}

/**
 * Ouvre une session sur le compte d'un rôle du bac à sable et renvoie les
 * cookies à poser sur la réponse. Null si ce compte n'existe pas (ou plus).
 */
export async function signInSandboxRole(
  sandboxId: string,
  role: DemoRole,
  headers: Headers
): Promise<string[] | null> {
  const email = demoEmail(role, sandboxId);
  const [account] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), eq(users.demoSandboxId, sandboxId)))
    .limit(1);
  if (!account) return null;

  // On ne transmet que de quoi dater la session (navigateur, adresse IP) : ni
  // les cookies ni l'origine du visiteur n'ont à entrer dans cette connexion.
  const forwarded = new Headers();
  for (const name of ['user-agent', 'x-forwarded-for', 'x-real-ip']) {
    const value = headers.get(name);
    if (value) forwarded.set(name, value);
  }

  const response = await auth.api.signInEmail({
    body: { email, password: demoPassword(email) },
    headers: forwarded,
    asResponse: true,
  });
  if (!response.ok) throw new Error(`Connexion de démo refusée (${response.status})`);
  return response.headers.getSetCookie();
}

/** Ferme les sessions d'un compte (au changement de rôle, pour ne pas en accumuler). */
export async function revokeSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

const HOUR_MS = 60 * 60 * 1000;

/** Vrai quand trop de bacs à sable sont ouverts en même temps. */
export async function isDemoFull(): Promise<boolean> {
  const [row] = await db
    .select({ count: countDistinct(users.demoSandboxId) })
    .from(users)
    .where(isNotNull(users.demoSandboxId));
  return Number(row?.count ?? 0) >= DEMO_MAX_ACTIVE_SANDBOXES;
}

// Bacs à sable ouverts depuis une adresse IP après une date donnée. L'adresse
// est celle que Better Auth enregistre sur chaque session ; `getIp` applique
// la même normalisation, pour que la comparaison tombe juste.
async function countSandboxesFromIp(ip: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: countDistinct(users.demoSandboxId) })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.ipAddress, ip),
        gt(users.createdAt, since),
        isNotNull(users.demoSandboxId)
      )
    );
  return Number(row?.count ?? 0);
}

/**
 * Limite par adresse IP, sur une heure et sur un jour. Sans adresse lisible,
 * la limite ne s'applique pas : le plafond global reste le filet de sécurité.
 */
export async function isIpOverLimit(headers: Headers, now = new Date()): Promise<boolean> {
  const ip = getIp(headers, auth.options);
  if (!ip) return false;

  const [lastHour, lastDay] = await Promise.all([
    countSandboxesFromIp(ip, new Date(now.getTime() - HOUR_MS)),
    countSandboxesFromIp(ip, new Date(now.getTime() - 24 * HOUR_MS)),
  ]);
  return (
    lastHour >= DEMO_MAX_SANDBOXES_PER_IP_PER_HOUR ||
    lastDay >= DEMO_MAX_SANDBOXES_PER_IP_PER_DAY
  );
}

/**
 * Supprime les bacs à sable expirés et renvoie le nombre de comptes retirés.
 * Les commandes n'ont pas de suppression en cascade (on ne perd pas une
 * commande par accident) : on les retire d'abord, leurs lignes suivent. Les
 * sessions, avis et abonnements partent avec le compte.
 */
export async function deleteExpiredSandboxes(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - SANDBOX_TTL_HOURS * HOUR_MS);
  const expired = db
    .select({ id: users.id })
    .from(users)
    .where(and(isNotNull(users.demoSandboxId), lt(users.createdAt, cutoff)));

  await db.delete(orders).where(inArray(orders.userId, expired));
  const deleted = await db
    .delete(users)
    .where(and(isNotNull(users.demoSandboxId), lt(users.createdAt, cutoff)))
    .returning({ id: users.id });
  return deleted.length;
}

/** Remet le stock des produits du décor à sa valeur de départ. */
export async function resetSeedStock(): Promise<void> {
  for (const product of SEED_PRODUCTS) {
    await db
      .update(products)
      .set({ stock: product.stock })
      .where(eq(products.id, product.slug));
  }
}

import { createHmac, randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/server/auth/config';
import { db } from '@/server/db';
import { sessions, users } from '@/server/db/schema';
import { DEMO_EMAIL_DOMAIN, DEMO_PERSONAS, DEMO_ROLES, type DemoRole } from '@/lib/demo';

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

import { sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { isDemo } from '@/lib/demo';

type Viewer = {
  session: { user: { demoSandboxId?: string | null } } | null;
};

/**
 * Cloisonnement de la démo. Condition SQL : la ligne appartient à un compte
 * que ce visiteur a le droit de voir, c'est-à-dire un compte du décor ou un
 * compte de son propre bac à sable. Un visiteur ne voit donc jamais les
 * commandes ni les avis d'un autre.
 *
 * `ownerId` est la colonne qui porte l'identifiant du compte propriétaire
 * (orders.userId, reviews.userId, users.id…). Hors démo, il n'y a aucune
 * restriction : la fonction renvoie undefined, que `and()` ignore.
 */
export function ownerVisibleTo(ownerId: AnyColumn, ctx: Viewer): SQL | undefined {
  if (!isDemo) return undefined;

  // Sans bac à sable (visiteur pas encore entré), seul le décor est visible.
  const sandboxId = ctx.session?.user.demoSandboxId ?? null;
  return sql`${ownerId} IN (
    SELECT demo_user.id
    FROM users AS demo_user
    WHERE demo_user.is_seed OR demo_user.demo_sandbox_id = ${sandboxId}
  )`;
}

/**
 * Condition SQL pour les écritures : en démo, on ne modifie que ce qui
 * appartient à son propre bac à sable. Le décor se lit, il ne se change pas.
 */
export function ownerEditableBy(ownerId: AnyColumn, ctx: Viewer): SQL | undefined {
  if (!isDemo) return undefined;

  const sandboxId = ctx.session?.user.demoSandboxId ?? null;
  return sql`${ownerId} IN (
    SELECT demo_user.id
    FROM users AS demo_user
    WHERE demo_user.demo_sandbox_id = ${sandboxId}
  )`;
}

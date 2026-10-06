import { and, asc, desc, eq } from 'drizzle-orm';
import type { Database } from '@/server/db';
import { orders, users, vendors } from '@/server/db/schema';
import { isPlaced } from '@/server/orders/status';
import { isDemo } from '@/lib/demo';

type VendorContext = {
  db: Database;
  session: {
    user: { id: string; role?: string | null; demoSandboxId?: string | null };
  };
};

/**
 * La boutique de l'utilisateur connecté, ou undefined s'il n'en a pas.
 * Tous les routeurs passent par ici : c'est le seul endroit qui décide
 * « quelle boutique gère cet utilisateur ».
 */
export async function findVendorOfUser(ctx: VendorContext) {
  const { id, role, demoSandboxId } = ctx.session.user;

  if (isDemo && demoSandboxId && role !== 'customer') {
    return findDemoShop(ctx.db, demoSandboxId);
  }

  return ctx.db.query.vendors.findFirst({
    where: eq(vendors.userId, id),
  });
}

/**
 * En démo, le vendeur d'un bac à sable n'a pas de boutique à lui : il tient
 * une boutique du décor. On lui donne celle où son bac à sable a commandé en
 * dernier, pour qu'il voie arriver la commande qu'il vient de passer comme
 * client. Avant toute commande, c'est la première boutique du décor.
 */
async function findDemoShop(db: Database, sandboxId: string) {
  const [latest] = await db
    .select({ vendorId: orders.vendorId })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(and(eq(users.demoSandboxId, sandboxId), isPlaced))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (latest) {
    return db.query.vendors.findFirst({ where: eq(vendors.id, latest.vendorId) });
  }
  return db.query.vendors.findFirst({ orderBy: asc(vendors.businessName) });
}

import { eq } from 'drizzle-orm';
import type { Database } from '@/server/db';
import { vendors } from '@/server/db/schema';

type VendorContext = {
  db: Database;
  session: { user: { id: string } };
};

/**
 * La boutique de l'utilisateur connecté, ou undefined s'il n'en a pas.
 * Tous les routeurs passent par ici : c'est le seul endroit qui décide
 * « quelle boutique gère cet utilisateur ».
 */
export async function findVendorOfUser(ctx: VendorContext) {
  return ctx.db.query.vendors.findFirst({
    where: eq(vendors.userId, ctx.session.user.id),
  });
}

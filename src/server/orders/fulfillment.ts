import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '@/server/db';
import { orders } from '@/server/db/schema';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { fromCents, toCents } from '@/lib/order-totals';

/**
 * Passe une commande « en attente » à « payée » et retire les quantités du
 * stock. Renvoie true si c'est cet appel qui a fait la bascule.
 *
 * Tout tient dans une seule requête SQL, donc dans une seule transaction : le
 * webhook Stripe et la page de succès peuvent l'appeler en même temps, ou
 * plusieurs fois (Stripe rejoue ses événements), le stock n'est retiré qu'une
 * fois. Le second appel ne trouve plus de commande « en attente » et ne
 * touche à rien.
 */
export async function markOrderPaid(
  db: Database,
  orderId: string,
  paymentIntentId: string | null
): Promise<boolean> {
  const result = await db.execute(sql`
    WITH paid AS (
      UPDATE orders
      SET status = 'paid',
          stripe_payment_intent_id = ${paymentIntentId},
          updated_at = now()
      WHERE id = ${orderId} AND status = 'pending'
      RETURNING id
    ),
    stock_update AS (
      UPDATE products
      SET stock = GREATEST(COALESCE(products.stock, 0) - order_items.quantity, 0),
          updated_at = now()
      FROM order_items
      JOIN paid ON paid.id = order_items.order_id
      WHERE products.id = order_items.product_id
    )
    SELECT id FROM paid
  `);

  return result.rows.length > 0;
}

/** Annule une commande restée en attente (session de paiement expirée). */
export async function cancelPendingOrder(db: Database, orderId: string) {
  await db
    .update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')));
}

/**
 * Valide une commande payée : bascule de statut, stock, puis e-mail de
 * confirmation. L'e-mail ne part que pour l'appel qui a fait la bascule.
 */
export async function fulfillOrder(
  db: Database,
  orderId: string,
  paymentIntentId: string | null
) {
  const justPaid = await markOrderPaid(db, orderId, paymentIntentId);
  if (!justPaid) return;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: true,
      user: { columns: { email: true, name: true } },
    },
  });
  if (!order?.user.email) return;

  await sendOrderConfirmationEmail(order.user.email, {
    name: order.user.name || 'Client',
    orderNumber: order.orderNumber,
    total: `${fromCents(toCents(order.total))} €`,
    items: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: `${fromCents(toCents(item.totalPrice))} €`,
    })),
  });
}

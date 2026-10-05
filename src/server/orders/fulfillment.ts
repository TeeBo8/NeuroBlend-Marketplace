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

/**
 * Supprime une commande restée en attente (paiement abandonné ou expiré).
 * Elle n'a jamais été payée : la garder comme « annulée » remplirait
 * l'historique du client de paniers abandonnés. Ses lignes partent avec elle.
 */
export async function discardPendingOrder(db: Database, orderId: string) {
  await db
    .delete(orders)
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

type CheckoutSessionLike = {
  metadata: Record<string, string> | null;
  payment_status: string;
  payment_intent: string | { id: string } | null;
};

/**
 * Traite les événements Stripe d'une session de paiement de commande.
 * Les sessions d'abonnement n'ont pas d'orderId et sont ignorées ici.
 */
export async function handleCheckoutSessionEvent(
  db: Database,
  eventType: string,
  session: CheckoutSessionLike
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  switch (eventType) {
    // "completed" arrive aussi pour les moyens de paiement différés, pas
    // encore encaissés : seul payment_status fait foi.
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (session.payment_status === 'paid') {
        await fulfillOrder(
          db,
          orderId,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null)
        );
      }
      break;

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      await discardPendingOrder(db, orderId);
      break;
  }
}

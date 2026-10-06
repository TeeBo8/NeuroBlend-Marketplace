import { sql } from 'drizzle-orm';
import type { Database } from '@/server/db';
import { getStripe } from '@/server/stripe';

/**
 * Rembourse intégralement le paiement d'une commande.
 *
 * Le paiement est un « destination charge » : l'argent est parti chez le
 * vendeur, la commission est restée sur la plateforme. Le remboursement
 * reprend donc le virement au vendeur et rend la commission.
 *
 * La clé d'idempotence est liée à la commande : rejouer l'appel après une
 * erreur ne rembourse pas deux fois. Passé le délai de cette clé, Stripe
 * répond « déjà remboursé », ce qui revient au même pour nous.
 */
export async function refundOrderPayment(orderId: string, paymentIntentId: string) {
  try {
    await getStripe().refunds.create(
      {
        payment_intent: paymentIntentId,
        reverse_transfer: true,
        refund_application_fee: true,
      },
      { idempotencyKey: `refund-order-${orderId}` }
    );
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'charge_already_refunded') throw error;
  }
}

/**
 * Passe une commande encaissée à « annulée ». Renvoie true si c'est cet appel
 * qui a fait la bascule.
 *
 * Comme pour le paiement, tout tient dans une seule requête SQL : deux
 * annulations simultanées ne remettent le stock qu'une fois. Les quantités ne
 * reviennent en stock que si le colis n'était pas encore parti.
 */
export async function markOrderCancelled(
  db: Database,
  orderId: string,
  note: string
): Promise<boolean> {
  const result = await db.execute(sql`
    WITH target AS (
      SELECT id, status
      FROM orders
      WHERE id = ${orderId} AND status IN ('paid', 'processing', 'shipped')
      FOR UPDATE
    ),
    cancelled AS (
      UPDATE orders
      SET status = 'cancelled',
          notes = ${note},
          updated_at = now()
      FROM target
      WHERE orders.id = target.id
      RETURNING orders.id, target.status AS previous_status
    ),
    stock_update AS (
      UPDATE products
      SET stock = COALESCE(products.stock, 0) + order_items.quantity,
          updated_at = now()
      FROM order_items
      JOIN cancelled ON cancelled.id = order_items.order_id
      WHERE products.id = order_items.product_id
        AND cancelled.previous_status IN ('paid', 'processing')
    )
    SELECT id FROM cancelled
  `);

  return result.rows.length > 0;
}

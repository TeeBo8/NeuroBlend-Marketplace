import type { Database } from '@/server/db';
import * as schema from '@/server/db/schema';
import { computeOrderTotals, fromCents } from '@/lib/order-totals';
import {
  SEED_CUSTOMERS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_VENDORS,
} from './seed-data';

const DAY_MS = 24 * 60 * 60 * 1000;

type SeedOptions = {
  /**
   * Compte Stripe Connect de test partagé par les boutiques du décor. Sans
   * lui, les produits s'affichent mais ne peuvent pas être payés.
   */
  stripeAccountId?: string | null;
  now?: Date;
};

/**
 * Vide la base puis charge le décor de la démo : boutiques, produits,
 * clients fictifs, commandes livrées et avis.
 *
 * Destructif : tous les comptes et toutes les commandes sont supprimés.
 */
export async function seedDemo(db: Database, options: SeedOptions = {}) {
  const now = options.now ?? new Date();
  const stripeAccountId = options.stripeAccountId ?? null;

  // Des tables qui dépendent des autres vers celles dont on dépend.
  await db.delete(schema.reviews);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.subscriptionItems);
  await db.delete(schema.subscriptions);
  await db.delete(schema.products);
  await db.delete(schema.vendors);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.verifications);
  await db.delete(schema.users);

  // Aucun de ces comptes n'a de mot de passe : personne ne peut s'y connecter.
  await db.insert(schema.users).values([
    ...SEED_VENDORS.map((vendor) => ({
      id: vendor.ownerId,
      name: vendor.ownerName,
      email: vendor.ownerEmail,
      emailVerified: true,
      role: 'vendor' as const,
      isSeed: true,
    })),
    ...SEED_CUSTOMERS.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      emailVerified: true,
      role: 'customer' as const,
      isSeed: true,
    })),
  ]);

  await db.insert(schema.vendors).values(
    SEED_VENDORS.map((vendor) => ({
      id: vendor.id,
      userId: vendor.ownerId,
      businessName: vendor.businessName,
      description: vendor.description,
      approved: true,
      commissionRate: vendor.commissionRate,
      stripeAccountId,
      stripeOnboardingComplete: stripeAccountId !== null,
    }))
  );

  const vendorOfCategory = new Map(
    SEED_VENDORS.map((vendor) => [vendor.category as string, vendor])
  );
  const products = SEED_PRODUCTS.map((product) => {
    const vendor = vendorOfCategory.get(product.category ?? '');
    if (!vendor) {
      throw new Error(`Aucune boutique pour le produit ${product.slug}`);
    }
    return { ...product, id: product.slug, vendorId: vendor.id };
  });
  await db.insert(schema.products).values(products);

  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const vendorById = new Map(SEED_VENDORS.map((vendor) => [vendor.id, vendor]));
  const customerById = new Map(SEED_CUSTOMERS.map((customer) => [customer.id, customer]));

  for (const [index, order] of SEED_ORDERS.entries()) {
    const lines = order.items.map((item) => {
      const product = productBySlug.get(item.slug);
      if (!product) throw new Error(`Produit inconnu : ${item.slug}`);
      return { product, quantity: item.quantity };
    });

    const vendorId = lines[0].product.vendorId;
    if (lines.some((line) => line.product.vendorId !== vendorId)) {
      throw new Error(`La commande ${index + 1} mélange plusieurs boutiques`);
    }

    const totals = computeOrderTotals(
      lines.map((line) => ({ unitPrice: line.product.price, quantity: line.quantity })),
      vendorById.get(vendorId)!.commissionRate
    );
    const orderedAt = new Date(now.getTime() - order.daysAgo * DAY_MS);
    const orderId = `seed-order-${index + 1}`;

    await db.insert(schema.orders).values({
      id: orderId,
      orderNumber: `NB-DEMO-${String(index + 1).padStart(4, '0')}`,
      userId: order.customerId,
      vendorId,
      subtotal: fromCents(totals.subtotalCents),
      commission: fromCents(totals.commissionCents),
      total: fromCents(totals.subtotalCents),
      status: 'delivered',
      shippingName: customerById.get(order.customerId)!.name,
      shippingAddress: '12 rue des Cafés',
      shippingCity: 'Bordeaux',
      shippingPostalCode: '33000',
      shippingCountry: 'France',
      createdAt: orderedAt,
      updatedAt: orderedAt,
    });

    await db.insert(schema.orderItems).values(
      lines.map((line, lineIndex) => ({
        orderId,
        productId: line.product.id,
        productName: line.product.name,
        quantity: line.quantity,
        unitPrice: line.product.price,
        totalPrice: fromCents(totals.lineTotalsCents[lineIndex]),
        createdAt: orderedAt,
      }))
    );

    if (order.review) {
      // L'avis arrive deux jours après la commande, jamais dans le futur.
      const reviewedAt = new Date(
        Math.min(orderedAt.getTime() + 2 * DAY_MS, now.getTime())
      );
      await db.insert(schema.reviews).values({
        id: `seed-review-${index + 1}`,
        userId: order.customerId,
        productId: productBySlug.get(order.review.slug)!.id,
        rating: order.review.rating,
        title: order.review.title,
        comment: order.review.comment,
        verified: true,
        createdAt: reviewedAt,
        updatedAt: reviewedAt,
      });
    }
  }

  return {
    vendors: SEED_VENDORS.length,
    products: products.length,
    customers: SEED_CUSTOMERS.length,
    orders: SEED_ORDERS.length,
    reviews: SEED_ORDERS.filter((order) => order.review).length,
  };
}

// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import type { Database } from "@/server/db";
import { orderItems, orders, reviews, users } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { createTestDb, seedShop } from "./helpers/test-db";

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

const callerFor = (user: { id: string; email: string; role: string } | null) =>
  createCallerFactory(appRouter)({
    db,
    session: user ? { user, session: {} } : null,
  } as never);

const asVisitor = () => callerFor(null);
const asCustomer = () =>
  callerFor({ id: shop.customer.id, email: shop.customer.email, role: "customer" });

/** Une commande d'un exemplaire du produit, pour le client donné. */
async function addPurchase(userId: string, status: (typeof orders.$inferInsert)["status"]) {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId,
      vendorId: shop.vendor.id,
      subtotal: "10.00",
      commission: "1.50",
      total: "10.00",
      status,
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    productId: shop.product.id,
    productName: shop.product.name,
    quantity: 1,
    unitPrice: "10.00",
    totalPrice: "10.00",
  });
}

beforeEach(async () => {
  db = await createTestDb();
  shop = await seedShop(db);
  await db.insert(users).values({ id: "client-2", email: "noa@exemple.fr" });
});

describe("la note d'un produit", () => {
  it("calcule la note sur tous les avis, pas sur les dix derniers affichés", async () => {
    // Dix 5 étoiles récents, deux 1 étoile plus anciens.
    await db.insert(reviews).values(
      Array.from({ length: 12 }, (_, index) => ({
        userId: shop.customer.id,
        productId: shop.product.id,
        rating: index < 2 ? 1 : 5,
        createdAt: new Date(2026, 0, index + 1),
      }))
    );

    const product = await asVisitor().product.byId({ id: shop.product.id });

    expect(product.reviews).toHaveLength(10);
    expect(product.reviewStats).toEqual({ count: 12, average: 4.3 });
  });

  it("renvoie une note nulle pour un produit sans avis", async () => {
    const product = await asVisitor().product.byId({ id: shop.product.id });

    expect(product.reviewStats).toEqual({ count: 0, average: 0 });
  });
});

describe("le badge « achat vérifié »", () => {
  it("va à l'avis d'un client livré, même s'il n'est pas le premier acheteur", async () => {
    await addPurchase("client-2", "paid");
    await addPurchase(shop.customer.id, "delivered");

    const review = await asCustomer().review.create({ productId: shop.product.id, rating: 5 });

    expect(review.verified).toBe(true);
  });

  it("ne va pas à un client qui n'a pas encore été livré", async () => {
    await addPurchase("client-2", "delivered");
    await addPurchase(shop.customer.id, "paid");

    const review = await asCustomer().review.create({ productId: shop.product.id, rating: 5 });

    expect(review.verified).toBe(false);
  });
});

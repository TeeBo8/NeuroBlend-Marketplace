// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orders, orderItems, products } from "@/server/db/schema";
import {
  discardPendingOrder,
  fulfillOrder,
  handleCheckoutSessionEvent,
  markOrderPaid,
} from "@/server/orders/fulfillment";
import { createTestDb, seedShop } from "./helpers/test-db";

const sendOrderConfirmationEmail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail }));

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

async function createPendingOrder(quantity: number) {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId: shop.customer.id,
      vendorId: shop.vendor.id,
      subtotal: "25.80",
      commission: "3.87",
      total: "25.80",
      status: "pending",
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    productId: shop.product.id,
    productName: shop.product.name,
    quantity,
    unitPrice: "12.90",
    totalPrice: "25.80",
  });
  return order;
}

const stockOf = async () =>
  (await db.query.products.findFirst({ where: eq(products.id, shop.product.id) }))!.stock;

const statusOf = async (orderId: string) =>
  (await db.query.orders.findFirst({ where: eq(orders.id, orderId) }))!.status;

beforeEach(async () => {
  sendOrderConfirmationEmail.mockReset();
  db = await createTestDb();
  shop = await seedShop(db, { stock: 10 });
});

describe("markOrderPaid", () => {
  it("passe la commande à payée et retire les quantités du stock", async () => {
    const order = await createPendingOrder(2);

    expect(await markOrderPaid(db, order.id, "pi_123")).toBe(true);

    const paid = await db.query.orders.findFirst({ where: eq(orders.id, order.id) });
    expect(paid?.status).toBe("paid");
    expect(paid?.stripePaymentIntentId).toBe("pi_123");
    expect(await stockOf()).toBe(8);
  });

  it("ne retire le stock qu'une fois si Stripe rejoue l'événement", async () => {
    const order = await createPendingOrder(2);

    expect(await markOrderPaid(db, order.id, "pi_123")).toBe(true);
    expect(await markOrderPaid(db, order.id, "pi_123")).toBe(false);
    expect(await markOrderPaid(db, order.id, "pi_123")).toBe(false);

    expect(await stockOf()).toBe(8);
  });

  it("ne retire le stock qu'une fois quand webhook et page de succès arrivent ensemble", async () => {
    const order = await createPendingOrder(3);

    const results = await Promise.all([
      markOrderPaid(db, order.id, "pi_123"),
      markOrderPaid(db, order.id, "pi_123"),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await stockOf()).toBe(7);
  });

  it("ne descend jamais le stock sous zéro", async () => {
    const order = await createPendingOrder(25);

    await markOrderPaid(db, order.id, "pi_123");

    expect(await stockOf()).toBe(0);
  });

  it("ne touche ni aux autres commandes ni à une commande inconnue", async () => {
    const order = await createPendingOrder(2);
    const other = await createPendingOrder(4);

    expect(await markOrderPaid(db, "commande-inconnue", "pi_x")).toBe(false);
    await markOrderPaid(db, order.id, "pi_123");

    expect(await statusOf(other.id)).toBe("pending");
    expect(await stockOf()).toBe(8);
  });

  it("ne fait rien pour une commande abandonnée, déjà supprimée", async () => {
    const order = await createPendingOrder(2);
    await discardPendingOrder(db, order.id);

    expect(await markOrderPaid(db, order.id, "pi_123")).toBe(false);
    expect(await stockOf()).toBe(10);
  });
});

describe("discardPendingOrder", () => {
  it("supprime la commande en attente et ses lignes", async () => {
    const order = await createPendingOrder(2);

    await discardPendingOrder(db, order.id);

    expect(await db.select().from(orders)).toHaveLength(0);
    expect(await db.select().from(orderItems)).toHaveLength(0);
  });

  it("ne supprime jamais une commande déjà payée", async () => {
    const order = await createPendingOrder(2);
    await markOrderPaid(db, order.id, "pi_123");

    await discardPendingOrder(db, order.id);

    expect(await statusOf(order.id)).toBe("paid");
  });
});

describe("fulfillOrder", () => {
  it("envoie l'e-mail de confirmation une seule fois", async () => {
    const order = await createPendingOrder(2);

    await fulfillOrder(db, order.id, "pi_123");
    await fulfillOrder(db, order.id, "pi_123");

    expect(sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(sendOrderConfirmationEmail).toHaveBeenCalledWith("lea@exemple.fr", {
      name: "Léa Client",
      orderNumber: order.orderNumber,
      total: "25.80 €",
      items: [{ name: "Café Test", quantity: 2, price: "25.80 €" }],
    });
  });
});

describe("handleCheckoutSessionEvent", () => {
  const session = (orderId: string, payment_status = "paid") => ({
    metadata: { orderId },
    payment_status,
    payment_intent: "pi_123",
  });

  it("valide la commande quand Stripe confirme le paiement, même si le client a fermé l'onglet", async () => {
    const order = await createPendingOrder(2);

    await handleCheckoutSessionEvent(db, "checkout.session.completed", session(order.id));

    expect(await statusOf(order.id)).toBe("paid");
    expect(await stockOf()).toBe(8);
    expect(sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it("attend l'encaissement pour un moyen de paiement différé", async () => {
    const order = await createPendingOrder(2);

    await handleCheckoutSessionEvent(db, "checkout.session.completed", session(order.id, "unpaid"));
    expect(await statusOf(order.id)).toBe("pending");
    expect(await stockOf()).toBe(10);

    await handleCheckoutSessionEvent(db, "checkout.session.async_payment_succeeded", session(order.id));
    expect(await statusOf(order.id)).toBe("paid");
    expect(await stockOf()).toBe(8);
  });

  it("supprime la commande quand la session de paiement expire", async () => {
    const order = await createPendingOrder(2);

    await handleCheckoutSessionEvent(db, "checkout.session.expired", session(order.id, "unpaid"));

    expect(await db.select().from(orders)).toHaveLength(0);
    expect(await stockOf()).toBe(10);
  });

  it("ignore une session sans orderId", async () => {
    const order = await createPendingOrder(2);

    await handleCheckoutSessionEvent(db, "checkout.session.completed", {
      metadata: { planId: "decouverte" },
      payment_status: "paid",
      payment_intent: null,
    });

    expect(await statusOf(order.id)).toBe("pending");
  });
});

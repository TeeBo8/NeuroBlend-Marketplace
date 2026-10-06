// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orderItems, orders, products, users, vendors } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { orderRouter } from "@/server/api/routers/order";
import { createTestDb, seedShop } from "./helpers/test-db";

const refunds = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/server/stripe", () => ({ getStripe: () => ({ refunds }) }));

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

const callerFor = (user: { id: string; email: string; role: string }) =>
  createCallerFactory(orderRouter)({ db, session: { user, session: {} } } as never);

const asAdmin = () => callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });
const asVendor = () =>
  callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });

type Status = NonNullable<(typeof orders.$inferInsert)["status"]>;

/** Une commande de deux exemplaires du produit, dans le statut voulu. */
async function addOrder(status: Status, values: Partial<typeof orders.$inferInsert> = {}) {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId: shop.customer.id,
      vendorId: shop.vendor.id,
      subtotal: "25.80",
      commission: "3.87",
      total: "25.80",
      status,
      stripePaymentIntentId: "pi_123",
      ...values,
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    productId: shop.product.id,
    productName: shop.product.name,
    quantity: 2,
    unitPrice: "12.90",
    totalPrice: "25.80",
  });
  return order;
}

const stockOf = async () =>
  (await db.query.products.findFirst({ where: eq(products.id, shop.product.id) }))!.stock;

const reload = async (orderId: string) =>
  (await db.query.orders.findFirst({ where: eq(orders.id, orderId) }))!;

beforeEach(async () => {
  refunds.create.mockReset().mockResolvedValue({ id: "re_1" });
  db = await createTestDb();
  // Stock après la vente des deux exemplaires de chaque commande de test.
  shop = await seedShop(db, { stock: 8 });
});

describe("order.adminCancel", () => {
  it("rembourse le client, annule la commande et remet le stock en vente", async () => {
    const order = await addOrder("paid");

    const cancelled = await asAdmin().adminCancel({ orderId: order.id, reason: "Rupture" });

    expect(cancelled).toMatchObject({
      id: order.id,
      status: "cancelled",
      notes: "Cancelled by admin: Rupture",
    });
    expect(await stockOf()).toBe(10);
    expect(refunds.create).toHaveBeenCalledTimes(1);
  });

  it("reprend l'argent chez le vendeur et rend la commission", async () => {
    const order = await addOrder("processing");

    await asAdmin().adminCancel({ orderId: order.id });

    const [params, options] = refunds.create.mock.calls[0];
    expect(params).toEqual({
      payment_intent: "pi_123",
      reverse_transfer: true,
      refund_application_fee: true,
    });
    // Un second essai avec la même clé ne rembourse pas deux fois.
    expect(options).toEqual({ idempotencyKey: `refund-order-${order.id}` });
  });

  it("n'annule rien si Stripe refuse le remboursement", async () => {
    const order = await addOrder("paid");
    refunds.create.mockRejectedValue(new Error("Stripe indisponible"));

    await expect(asAdmin().adminCancel({ orderId: order.id })).rejects.toThrow(
      "Stripe indisponible"
    );

    expect((await reload(order.id)).status).toBe("paid");
    expect(await stockOf()).toBe(8);
  });

  it("termine l'annulation si le paiement était déjà remboursé", async () => {
    const order = await addOrder("paid");
    refunds.create.mockRejectedValue(
      Object.assign(new Error("already refunded"), { code: "charge_already_refunded" })
    );

    const cancelled = await asAdmin().adminCancel({ orderId: order.id });

    expect(cancelled.status).toBe("cancelled");
    expect(await stockOf()).toBe(10);
  });

  it("ne remet pas en stock une commande déjà expédiée", async () => {
    const order = await addOrder("shipped");

    const cancelled = await asAdmin().adminCancel({ orderId: order.id });

    expect(cancelled.status).toBe("cancelled");
    expect(refunds.create).toHaveBeenCalledTimes(1);
    expect(await stockOf()).toBe(8);
  });

  it("refuse une commande déjà annulée, sans second remboursement", async () => {
    const order = await addOrder("paid");
    await asAdmin().adminCancel({ orderId: order.id });

    await expect(asAdmin().adminCancel({ orderId: order.id })).rejects.toThrow(
      /already cancelled/
    );

    expect(refunds.create).toHaveBeenCalledTimes(1);
    expect(await stockOf()).toBe(10);
  });

  it("refuse une commande livrée", async () => {
    const order = await addOrder("delivered");

    await expect(asAdmin().adminCancel({ orderId: order.id })).rejects.toThrow(
      /Cannot cancel a delivered order/
    );

    expect(refunds.create).not.toHaveBeenCalled();
  });

  it("refuse un paiement en attente : le client est peut-être en train de payer", async () => {
    const order = await addOrder("pending", { stripePaymentIntentId: null });

    await expect(asAdmin().adminCancel({ orderId: order.id })).rejects.toThrow(
      /not been paid yet/
    );

    expect((await reload(order.id)).status).toBe("pending");
    expect(await stockOf()).toBe(8);
  });

  it("refuse un vendeur", async () => {
    const order = await addOrder("paid");

    await expect(asVendor().adminCancel({ orderId: order.id })).rejects.toThrow(/admin/);

    expect((await reload(order.id)).status).toBe("paid");
  });
});

describe("order.updateStatus", () => {
  it("fait avancer la commande et enregistre le numéro de suivi", async () => {
    const order = await addOrder("paid");

    await asVendor().updateStatus({ orderId: order.id, status: "processing" });
    await asVendor().updateStatus({
      orderId: order.id,
      status: "shipped",
      trackingNumber: "  COLISSIMO-123  ",
    });
    const delivered = await asVendor().updateStatus({ orderId: order.id, status: "delivered" });

    expect(delivered).toMatchObject({ status: "delivered", trackingNumber: "COLISSIMO-123" });
  });

  it("laisse expédier directement une commande payée", async () => {
    const order = await addOrder("paid");

    const shipped = await asVendor().updateStatus({ orderId: order.id, status: "shipped" });

    expect(shipped.status).toBe("shipped");
  });

  it.each<[Status, "processing" | "shipped" | "delivered"]>([
    ["pending", "processing"],
    ["pending", "shipped"],
    ["paid", "delivered"],
    ["shipped", "processing"],
    ["delivered", "shipped"],
    ["cancelled", "shipped"],
    ["cancelled", "delivered"],
  ])("refuse de passer de %s à %s", async (from, to) => {
    const order = await addOrder(from);

    await expect(asVendor().updateStatus({ orderId: order.id, status: to })).rejects.toThrow(
      /Cannot move an order/
    );

    expect((await reload(order.id)).status).toBe(from);
  });

  it("refuse la commande d'un autre vendeur", async () => {
    await db.insert(users).values({ id: "vendeur-2", email: "zoe@exemple.fr", role: "vendor" });
    const [other] = await db
      .insert(vendors)
      .values({ userId: "vendeur-2", businessName: "Autre Boutique", approved: true })
      .returning();
    const order = await addOrder("paid", { vendorId: other.id });

    await expect(
      asVendor().updateStatus({ orderId: order.id, status: "shipped" })
    ).rejects.toThrow(/Order not found/);

    expect((await reload(order.id)).status).toBe("paid");
  });
});

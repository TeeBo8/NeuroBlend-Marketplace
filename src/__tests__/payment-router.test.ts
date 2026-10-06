// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orderItems, orders, products, vendors } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { paymentRouter } from "@/server/api/routers/payment";
import { createTestDb, seedShop } from "./helpers/test-db";

const stripe = vi.hoisted(() => ({
  create: vi.fn(),
  retrieve: vi.fn(),
}));
vi.mock("@/server/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: stripe } }),
}));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: vi.fn() }));

const address = {
  name: "Léa Client",
  address: "12 rue des Cafés",
  city: "Bordeaux",
  postalCode: "33000",
  country: "France",
};

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

const callerFor = (user: { id: string; email: string; role: string }) =>
  createCallerFactory(paymentRouter)({
    db,
    session: { user, session: {} },
  } as never);

const asCustomer = () =>
  callerFor({ id: shop.customer.id, email: shop.customer.email, role: "customer" });

const allOrders = () => db.query.orders.findMany({ with: { items: true } });

const stockOf = async () =>
  (await db.query.products.findFirst({ where: eq(products.id, shop.product.id) }))!.stock;

beforeEach(async () => {
  stripe.create.mockReset().mockResolvedValue({ id: "cs_test_1", url: "https://stripe.test/pay" });
  stripe.retrieve.mockReset();
  db = await createTestDb();
  shop = await seedShop(db, { stock: 10, price: "12.90", commissionRate: "15.00" });
});

describe("payment.createCheckoutSession", () => {
  it("crée une commande en attente avec les prix de la base", async () => {
    const result = await asCustomer().createCheckoutSession({
      items: [{ productId: shop.product.id, quantity: 3 }],
      shippingAddress: address,
    });

    expect(result).toEqual({ sessionId: "cs_test_1", url: "https://stripe.test/pay" });

    const [order] = await allOrders();
    expect(order).toMatchObject({
      status: "pending",
      userId: shop.customer.id,
      vendorId: shop.vendor.id,
      subtotal: "38.70",
      commission: "5.81",
      total: "38.70",
      shippingCity: "Bordeaux",
    });
    // Lecture directe de la table : via une relation, Postgres renvoie les
    // décimaux en JSON et "38.70" devient "38.7".
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: shop.product.id,
      quantity: 3,
      unitPrice: "12.90",
      totalPrice: "38.70",
    });
    // Le stock ne bouge qu'au paiement.
    expect(await stockOf()).toBe(10);
  });

  it("n'envoie à Stripe que l'identifiant de la commande, et les montants en centimes", async () => {
    await asCustomer().createCheckoutSession({
      items: [{ productId: shop.product.id, quantity: 3 }],
      shippingAddress: address,
    });

    const [order] = await allOrders();
    const params = stripe.create.mock.calls[0][0];

    expect(params.metadata).toEqual({ orderId: order.id, orderNumber: order.orderNumber });
    expect(params.line_items[0].price_data.unit_amount).toBe(1290);
    expect(params.line_items[0].quantity).toBe(3);
    expect(params.payment_intent_data.application_fee_amount).toBe(581);
    expect(params.payment_intent_data.transfer_data.destination).toBe("acct_test");
  });

  it("regroupe deux lignes du même produit au lieu de refuser le panier", async () => {
    await asCustomer().createCheckoutSession({
      items: [
        { productId: shop.product.id, quantity: 2 },
        { productId: shop.product.id, quantity: 1 },
      ],
      shippingAddress: address,
    });

    const [order] = await allOrders();
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(3);
  });

  it("refuse une quantité supérieure au stock", async () => {
    await expect(
      asCustomer().createCheckoutSession({
        items: [{ productId: shop.product.id, quantity: 11 }],
        shippingAddress: address,
      })
    ).rejects.toThrow(/Stock insuffisant/);

    expect(await allOrders()).toHaveLength(0);
    expect(stripe.create).not.toHaveBeenCalled();
  });

  it("refuse un produit désactivé", async () => {
    await db.update(products).set({ active: false }).where(eq(products.id, shop.product.id));

    await expect(
      asCustomer().createCheckoutSession({
        items: [{ productId: shop.product.id, quantity: 1 }],
        shippingAddress: address,
      })
    ).rejects.toThrow(/ne sont plus disponibles/);

    expect(stripe.create).not.toHaveBeenCalled();
  });

  it("refuse un produit inconnu", async () => {
    await expect(
      asCustomer().createCheckoutSession({
        items: [{ productId: "inconnu", quantity: 1 }],
        shippingAddress: address,
      })
    ).rejects.toThrow(/ne sont plus disponibles/);
  });

  it("refuse un vendeur qui n'est pas approuvé", async () => {
    await db.update(vendors).set({ approved: false }).where(eq(vendors.id, shop.vendor.id));

    await expect(
      asCustomer().createCheckoutSession({
        items: [{ productId: shop.product.id, quantity: 1 }],
        shippingAddress: address,
      })
    ).rejects.toThrow(/ne peut pas encore recevoir de paiements/);

    expect(await allOrders()).toHaveLength(0);
  });

  it("refuse les quantités nulles, négatives ou démesurées", async () => {
    for (const quantity of [0, -1, 1.5, 100]) {
      await expect(
        asCustomer().createCheckoutSession({
          items: [{ productId: shop.product.id, quantity }],
          shippingAddress: address,
        })
      ).rejects.toThrow();
    }
  });

  it("ne laisse pas de commande en attente si Stripe refuse de créer la session", async () => {
    stripe.create.mockRejectedValue(new Error("Stripe indisponible"));

    await expect(
      asCustomer().createCheckoutSession({
        items: [{ productId: shop.product.id, quantity: 1 }],
        shippingAddress: address,
      })
    ).rejects.toThrow("Stripe indisponible");

    expect(await allOrders()).toHaveLength(0);
  });

  it("refuse un visiteur non connecté", async () => {
    const anonymous = createCallerFactory(paymentRouter)({ db, session: null } as never);

    await expect(
      anonymous.createCheckoutSession({
        items: [{ productId: shop.product.id, quantity: 1 }],
        shippingAddress: address,
      })
    ).rejects.toThrow(/UNAUTHORIZED/);
  });
});

describe("payment.verifyCheckout", () => {
  async function checkout(quantity = 2) {
    await asCustomer().createCheckoutSession({
      items: [{ productId: shop.product.id, quantity }],
      shippingAddress: address,
    });
    const [order] = await allOrders();
    return order;
  }

  const paidSession = (orderId: string) => ({
    payment_status: "paid",
    payment_intent: "pi_123",
    metadata: { orderId },
  });

  it("valide la commande payée et retire le stock", async () => {
    const order = await checkout(2);
    stripe.retrieve.mockResolvedValue(paidSession(order.id));

    const result = await asCustomer().verifyCheckout({ sessionId: "cs_test_1" });

    expect(result).toMatchObject({
      id: order.id,
      status: "paid",
      stripePaymentIntentId: "pi_123",
    });
    expect(await stockOf()).toBe(8);
  });

  it("peut être rappelée sans retirer le stock une seconde fois", async () => {
    const order = await checkout(2);
    stripe.retrieve.mockResolvedValue(paidSession(order.id));

    await asCustomer().verifyCheckout({ sessionId: "cs_test_1" });
    const again = await asCustomer().verifyCheckout({ sessionId: "cs_test_1" });

    expect(again.status).toBe("paid");
    expect(await stockOf()).toBe(8);
  });

  it("ne valide rien tant que Stripe n'a pas encaissé", async () => {
    const order = await checkout(2);
    stripe.retrieve.mockResolvedValue({ ...paidSession(order.id), payment_status: "unpaid" });

    await expect(asCustomer().verifyCheckout({ sessionId: "cs_test_1" })).rejects.toThrow(
      /Payment not completed/
    );

    const [unchanged] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(unchanged.status).toBe("pending");
    expect(await stockOf()).toBe(10);
  });

  it("refuse la session d'un autre client", async () => {
    const order = await checkout(2);
    stripe.retrieve.mockResolvedValue(paidSession(order.id));
    const stranger = callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });

    await expect(stranger.verifyCheckout({ sessionId: "cs_test_1" })).rejects.toThrow(
      /Order not found/
    );

    expect(await stockOf()).toBe(10);
  });

  it("refuse proprement une session qui n'est pas une commande", async () => {
    stripe.retrieve.mockResolvedValue({ payment_status: "paid", metadata: { planId: "x" } });

    await expect(asCustomer().verifyCheckout({ sessionId: "cs_sub_1" })).rejects.toThrow(
      /Order not found/
    );
  });
});

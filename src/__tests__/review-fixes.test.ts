// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orderItems, orders, products, users, vendors } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { createTestDb, seedShop } from "./helpers/test-db";

const stripe = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/server/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: stripe } }),
}));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: vi.fn(),
  sendVendorApprovedEmail: vi.fn(),
}));

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

const callerFor = (user: { id: string; email: string; role: string }) =>
  createCallerFactory(appRouter)({ db, session: { user, session: {} } } as never);

const asVendor = () => callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });
const asCustomer = () =>
  callerFor({ id: shop.customer.id, email: shop.customer.email, role: "customer" });
const asAdmin = () => callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

const roleOf = async (userId: string) =>
  (await db.query.users.findFirst({ where: eq(users.id, userId) }))!.role;

/** Une commande du client pour le produit de la boutique. */
async function addOrder(status: "pending" | "paid" = "paid") {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId: shop.customer.id,
      vendorId: shop.vendor.id,
      subtotal: "12.90",
      commission: "1.94",
      total: "12.90",
      status,
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    productId: shop.product.id,
    productName: shop.product.name,
    quantity: 1,
    unitPrice: "12.90",
    totalPrice: "12.90",
  });
  return order;
}

beforeEach(async () => {
  stripe.create.mockReset().mockResolvedValue({ id: "cs_test_1", url: "https://stripe.test/pay" });
  db = await createTestDb();
  shop = await seedShop(db);
  await db.insert(users).values({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });
});

describe("supprimer un produit", () => {
  it("refuse avec un message clair quand le produit a déjà été commandé", async () => {
    await addOrder();

    await expect(asVendor().product.delete({ id: shop.product.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringContaining("déjà été commandé"),
    });
    expect(await db.select().from(products)).toHaveLength(1);
  });

  it("supprime un produit jamais commandé", async () => {
    await asVendor().product.delete({ id: shop.product.id });

    expect(await db.select().from(products)).toHaveLength(0);
  });
});

describe("rôle admin et boutiques", () => {
  it("garde le rôle admin d'un admin qui crée une boutique", async () => {
    await asAdmin().vendor.register({ businessName: "Boutique de l'admin" });

    expect(await roleOf("admin-1")).toBe("admin");
  });

  it("fait d'un client un vendeur quand il crée sa boutique", async () => {
    await asCustomer().vendor.register({ businessName: "Boutique de Léa" });

    expect(await roleOf(shop.customer.id)).toBe("vendor");
  });

  it("garde le rôle admin quand sa boutique est refusée", async () => {
    const created = await asAdmin().vendor.register({ businessName: "Boutique de l'admin" });

    await asAdmin().vendor.reject({ vendorId: created.id });

    expect(await roleOf("admin-1")).toBe("admin");
    expect(await db.select().from(vendors)).toHaveLength(1);
  });

  it("refuse de supprimer une boutique qui a déjà des commandes", async () => {
    await addOrder();

    await expect(asAdmin().vendor.reject({ vendorId: shop.vendor.id })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(await roleOf(shop.owner.id)).toBe("vendor");
  });
});

describe("paiements en attente", () => {
  const checkout = () =>
    asCustomer().payment.createCheckoutSession({
      items: [{ productId: shop.product.id, quantity: 1 }],
      shippingAddress: {
        name: "Léa Client",
        address: "12 rue des Cafés",
        city: "Bordeaux",
        postalCode: "33000",
        country: "France",
      },
    });

  it("refuse une sixième page de paiement ouverte par le même compte", async () => {
    for (let index = 0; index < 5; index++) await checkout();

    await expect(checkout()).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(stripe.create).toHaveBeenCalledTimes(5);
    expect(await db.select().from(orders)).toHaveLength(5);
  });

  it("ne compte pas les commandes déjà payées", async () => {
    for (let index = 0; index < 5; index++) await addOrder("paid");

    await expect(checkout()).resolves.toMatchObject({ url: "https://stripe.test/pay" });
  });
});

describe("limites des champs", () => {
  it("refuse un prix qui dépasserait la colonne", async () => {
    await expect(
      asVendor().product.create({ name: "Café hors de prix", price: 100_000_000 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("refuse un nom d'utilisateur démesuré", async () => {
    await expect(
      asCustomer().user.update({ name: "a".repeat(101) })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

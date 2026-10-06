// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import type { Database } from "@/server/db";
import { orders, users, vendors } from "@/server/db/schema";
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

const asCustomer = () =>
  callerFor({ id: shop.customer.id, email: shop.customer.email, role: "customer" });
const asVendor = () =>
  callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });
const asAdmin = () => callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

type Status = NonNullable<(typeof orders.$inferInsert)["status"]>;

async function addOrder(
  status: Status,
  total: string,
  commission: string,
  values: Partial<typeof orders.$inferInsert> = {}
) {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId: shop.customer.id,
      vendorId: shop.vendor.id,
      subtotal: total,
      commission,
      total,
      status,
      ...values,
    })
    .returning();
  return order;
}

/** Une commande par statut : seules les quatre du milieu sont encaissées. */
async function seedOrders() {
  return {
    pending: await addOrder("pending", "10.00", "1.50"),
    paid: await addOrder("paid", "20.10", "3.02"),
    processing: await addOrder("processing", "30.20", "4.53"),
    shipped: await addOrder("shipped", "40.00", "6.00"),
    delivered: await addOrder("delivered", "50.00", "7.50"),
    cancelled: await addOrder("cancelled", "60.00", "9.00"),
  };
}

/** Un second vendeur et un second client, pour vérifier le cloisonnement. */
async function seedOtherShop() {
  await db.insert(users).values([
    { id: "client-2", email: "noa@exemple.fr" },
    { id: "vendeur-2", email: "zoe@exemple.fr", role: "vendor" },
  ]);
  const [vendor] = await db
    .insert(vendors)
    .values({ userId: "vendeur-2", businessName: "Autre Boutique", approved: false })
    .returning();
  return vendor;
}

beforeEach(async () => {
  db = await createTestDb();
  shop = await seedShop(db);
});

describe("admin.getStats", () => {
  it("compte le volume d'affaires de toutes les commandes encaissées", async () => {
    await seedOrders();

    const stats = await asAdmin().admin.getStats();

    // 20,10 + 30,20 + 40 + 50 : expédier une commande ne la retire pas du chiffre.
    expect(stats.gmv).toBe(140.3);
    expect(stats.commissionEarned).toBe(21.05);
  });

  it("ne compte pas les paiements en attente parmi les commandes", async () => {
    await seedOrders();

    const stats = await asAdmin().admin.getStats();

    expect(stats.orders).toBe(5);
    expect(stats.ordersByStatus.map((row) => row.status).sort()).toEqual([
      "cancelled",
      "delivered",
      "paid",
      "processing",
      "shipped",
    ]);
  });

  it("compte les utilisateurs, les vendeurs et les produits", async () => {
    await seedOtherShop();

    const stats = await asAdmin().admin.getStats();

    expect(stats).toMatchObject({
      users: 4,
      vendors: 1,
      pendingVendors: 1,
      products: 1,
      orders: 0,
      gmv: 0,
      commissionEarned: 0,
    });
  });
});

describe("les autres chiffres de l'admin", () => {
  it("getRecentOrders ne montre pas les paiements en attente", async () => {
    await seedOrders();

    const recent = await asAdmin().admin.getRecentOrders({ limit: 10 });

    expect(recent).toHaveLength(5);
    expect(recent.map((order) => order.status)).not.toContain("pending");
  });

  it("getTopVendors additionne les commandes encaissées", async () => {
    await seedOrders();

    const [top] = await asAdmin().admin.getTopVendors({ limit: 5 });

    expect(top).toMatchObject({
      vendor: { id: shop.vendor.id },
      totalRevenue: 140.3,
      orderCount: 4,
    });
  });
});

describe("vendor.myStats", () => {
  it("calcule les chiffres sur toutes les commandes, pas sur la première page", async () => {
    for (let i = 0; i < 12; i++) {
      await addOrder("delivered", "10.00", "1.50");
    }

    const stats = await asVendor().vendor.myStats();

    // 12 × (10,00 − 1,50) : le vendeur touche le total moins la commission.
    expect(stats).toEqual({ products: 1, orders: 12, revenue: 102, toProcess: 0 });
  });

  it("ne compte ni les paiements en attente ni les annulations dans les revenus", async () => {
    await seedOrders();

    const stats = await asVendor().vendor.myStats();

    expect(stats).toEqual({ products: 1, orders: 5, revenue: 119.25, toProcess: 2 });
  });

  it("ne voit pas les commandes d'un autre vendeur", async () => {
    const other = await seedOtherShop();
    await addOrder("paid", "99.00", "9.90", { vendorId: other.id });

    const stats = await asVendor().vendor.myStats();

    expect(stats).toEqual({ products: 1, orders: 0, revenue: 0, toProcess: 0 });
  });

  it("renvoie des zéros sans profil vendeur", async () => {
    const admin = callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

    expect(await admin.vendor.myStats()).toEqual({
      products: 0,
      orders: 0,
      revenue: 0,
      toProcess: 0,
    });
  });
});

describe("order.myStats", () => {
  it("additionne ce que le client a réellement payé", async () => {
    await seedOrders();

    expect(await asCustomer().order.myStats()).toEqual({ orders: 5, totalSpent: 140.3 });
  });

  it("ne voit pas les commandes d'un autre client", async () => {
    await seedOtherShop();
    await addOrder("paid", "99.00", "9.90", { userId: "client-2" });

    expect(await asCustomer().order.myStats()).toEqual({ orders: 0, totalSpent: 0 });
  });
});

describe("vendor.me", () => {
  it("renvoie null, et non undefined, pour un utilisateur sans boutique", async () => {
    expect(await asCustomer().vendor.me()).toBeNull();
  });

  it("renvoie la boutique du vendeur", async () => {
    expect(await asVendor().vendor.me()).toMatchObject({ id: shop.vendor.id });
  });
});

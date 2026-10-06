// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orders, products, users, vendors } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { seedDemo } from "@/server/demo/seed";
import { SEED_PRODUCTS } from "@/server/demo/seed-data";
import { createTestDb, seedShop } from "./helpers/test-db";

let db: Database;

const callerFor = (user: { id: string; email: string; role: string } | null) =>
  createCallerFactory(appRouter)({
    db,
    session: user ? { user, session: {} } : null,
  } as never);

const NOW = new Date("2026-10-06T12:00:00Z");
const cents = (amount: string) => Math.round(Number(amount) * 100);

beforeEach(async () => {
  db = await createTestDb();
});

describe("seedDemo", () => {
  it("charge trois boutiques approuvées, neuf produits et quatre clients de décor", async () => {
    const summary = await seedDemo(db, { stripeAccountId: "acct_test", now: NOW });

    expect(summary).toEqual({ vendors: 3, products: 9, customers: 4, orders: 8, reviews: 8 });
    const shops = await db.query.vendors.findMany({ with: { products: true } });
    expect(shops).toHaveLength(3);
    for (const shop of shops) {
      expect(shop.approved).toBe(true);
      expect(shop.stripeAccountId).toBe("acct_test");
      expect(shop.stripeOnboardingComplete).toBe(true);
      expect(shop.products).toHaveLength(3);
      // Une boutique ne vend qu'une catégorie.
      expect(new Set(shop.products.map((product) => product.category)).size).toBe(1);
    }
  });

  it("marque tous ses comptes comme décor, sans mot de passe", async () => {
    await seedDemo(db, { now: NOW });

    const everyone = await db.query.users.findMany({ with: { accounts: true } });
    expect(everyone).toHaveLength(7);
    expect(everyone.every((user) => user.isSeed)).toBe(true);
    expect(everyone.every((user) => user.demoSandboxId === null)).toBe(true);
    expect(everyone.every((user) => user.accounts.length === 0)).toBe(true);
  });

  it("garde l'adresse des fiches produit d'un chargement à l'autre", async () => {
    await seedDemo(db, { now: NOW });

    const ids = (await db.select({ id: products.id }).from(products)).map((row) => row.id).sort();
    expect(ids).toEqual(SEED_PRODUCTS.map((product) => product.slug).sort());
  });

  it("produit des commandes livrées dont les montants se recoupent", async () => {
    await seedDemo(db, { stripeAccountId: "acct_test", now: NOW });
    const admin = callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

    const stats = await admin.admin.getStats();
    const all = await db.query.orders.findMany({ with: { items: true } });

    expect(all.every((order) => order.status === "delivered")).toBe(true);
    expect(all.every((order) => order.createdAt.getTime() <= NOW.getTime())).toBe(true);
    // Le total de chaque commande est la somme de ses lignes.
    for (const order of all) {
      const lines = order.items.reduce((sum, item) => sum + cents(item.totalPrice), 0);
      expect(cents(order.total)).toBe(lines);
    }
    const gmvCents = all.reduce((sum, order) => sum + cents(order.total), 0);
    expect(Math.round(stats.gmv * 100)).toBe(gmvCents);
    expect(stats).toMatchObject({ vendors: 3, pendingVendors: 0, products: 9, orders: 8 });
  });

  it("applique le taux de commission de chaque boutique", async () => {
    await seedDemo(db, { now: NOW });

    // Torréfaction Moreau est à 10 %, les deux autres à 15 %.
    const moreau = await db.query.orders.findFirst({
      where: eq(orders.vendorId, "torrefaction-moreau"),
    });
    const dubois = await db.query.orders.findFirst({
      where: eq(orders.vendorId, "atelier-dubois"),
    });
    expect(Number(moreau!.commission) / Number(moreau!.total)).toBeCloseTo(0.1, 2);
    expect(Number(dubois!.commission) / Number(dubois!.total)).toBeCloseTo(0.15, 2);
  });

  it("donne des avis vérifiés et une note visible sur la fiche produit", async () => {
    await seedDemo(db, { now: NOW });

    const product = await callerFor(null).product.byId({ id: "synaptic-focus" });

    // Deux avis sur ce produit : 5 et 4 étoiles.
    expect(product.reviewStats).toEqual({ count: 2, average: 4.5 });
    expect(product.reviews.every((review) => review.verified)).toBe(true);
  });

  it("ne rend les produits payables que si un compte Stripe est fourni", async () => {
    await seedDemo(db, { now: NOW });

    const shops = await db.select().from(vendors);
    expect(shops.every((shop) => shop.stripeAccountId === null)).toBe(true);
    expect(shops.every((shop) => shop.stripeOnboardingComplete === false)).toBe(true);
  });

  it("repart de zéro : les comptes et commandes présents avant sont supprimés", async () => {
    await seedShop(db);
    await seedDemo(db, { now: NOW });
    await seedDemo(db, { now: NOW });

    expect(await db.select().from(users)).toHaveLength(7);
    expect(await db.select().from(orders)).toHaveLength(8);
    expect(await db.select().from(products)).toHaveLength(9);
  });
});

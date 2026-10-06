// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { products, users, vendors } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { productRouter } from "@/server/api/routers/product";
import { createTestDb, seedShop } from "./helpers/test-db";

let db: Database;
let shop: Awaited<ReturnType<typeof seedShop>>;

const callerFor = (user: { id: string; email: string; role: string } | null) =>
  createCallerFactory(productRouter)({
    db,
    session: user ? { user, session: {} } : null,
  } as never);

beforeEach(async () => {
  db = await createTestDb();
  shop = await seedShop(db);
});

describe("product.byId sur un produit désactivé", () => {
  beforeEach(async () => {
    await db.update(products).set({ active: false }).where(eq(products.id, shop.product.id));
  });

  it("est introuvable pour un visiteur", async () => {
    await expect(callerFor(null).byId({ id: shop.product.id })).rejects.toThrow(
      /Product not found/
    );
  });

  it("est introuvable pour un client connecté", async () => {
    const customer = callerFor({ id: shop.customer.id, email: shop.customer.email, role: "customer" });

    await expect(customer.byId({ id: shop.product.id })).rejects.toThrow(/Product not found/);
  });

  it("est introuvable pour un autre vendeur", async () => {
    await db.insert(users).values({ id: "vendeur-2", email: "zoe@exemple.fr", role: "vendor" });
    await db.insert(vendors).values({ userId: "vendeur-2", businessName: "Autre Boutique" });
    const other = callerFor({ id: "vendeur-2", email: "zoe@exemple.fr", role: "vendor" });

    await expect(other.byId({ id: shop.product.id })).rejects.toThrow(/Product not found/);
  });

  it("reste visible pour le vendeur qui le possède, pour qu'il puisse le modifier", async () => {
    const owner = callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });

    expect((await owner.byId({ id: shop.product.id })).id).toBe(shop.product.id);
  });

  it("reste visible pour un admin", async () => {
    const admin = callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

    expect((await admin.byId({ id: shop.product.id })).id).toBe(shop.product.id);
  });
});

describe("product.byId sur un produit actif", () => {
  it("est visible par tout le monde", async () => {
    expect((await callerFor(null).byId({ id: shop.product.id })).id).toBe(shop.product.id);
  });
});

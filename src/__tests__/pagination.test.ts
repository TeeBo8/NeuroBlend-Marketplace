// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { eq, sql } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orders, products, reviews, users, vendors } from "@/server/db/schema";
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
const asVendor = () =>
  callerFor({ id: shop.owner.id, email: shop.owner.email, role: "vendor" });
const asAdmin = () => callerFor({ id: "admin-1", email: "admin@exemple.fr", role: "admin" });

const at = (time: string) => sql`${`2026-01-01 ${time}`}::timestamp`;

type Page = { items: { id: string }[]; nextCursor?: string };

/** Suit les curseurs jusqu'au bout et renvoie les identifiants, page par page. */
async function allPages(fetchPage: (cursor?: string) => Promise<Page>) {
  const pages: string[][] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    pages.push(page.items.map((item) => item.id));
    cursor = page.nextCursor;
  } while (cursor && pages.length < 20);
  return pages;
}

async function addProduct(id: string, time: string, values: Partial<typeof products.$inferInsert> = {}) {
  await db.insert(products).values({
    id,
    vendorId: shop.vendor.id,
    name: `Café ${id}`,
    slug: id,
    price: "9.90",
    stock: 5,
    createdAt: at(time),
    ...values,
  });
}

async function addOrder(id: string, time: string, status: (typeof orders.$inferInsert)["status"] = "paid") {
  await db.insert(orders).values({
    id,
    orderNumber: `NB-${id}`,
    userId: shop.customer.id,
    vendorId: shop.vendor.id,
    subtotal: "10.00",
    commission: "1.50",
    total: "10.00",
    status,
    createdAt: at(time),
  });
}

beforeEach(async () => {
  db = await createTestDb();
  shop = await seedShop(db);
  // Le produit de seedShop sort du catalogue : chaque test pose les siens.
  await db.update(products).set({ active: false }).where(eq(products.id, shop.product.id));
});

describe("product.list", () => {
  it("avance d'une page à l'autre sans doublon ni oubli", async () => {
    await addProduct("p1", "10:00:01");
    await addProduct("p2", "10:00:02");
    await addProduct("p3", "10:00:03");
    await addProduct("p4", "10:00:04");
    await addProduct("p5", "10:00:05");

    const pages = await allPages((cursor) => asVisitor().product.list({ limit: 2, cursor }));

    expect(pages).toEqual([["p5", "p4"], ["p3", "p2"], ["p1"]]);
  });

  it("n'annonce pas de page suivante quand la dernière page est pleine", async () => {
    await addProduct("p1", "10:00:01");
    await addProduct("p2", "10:00:02");

    const page = await asVisitor().product.list({ limit: 2 });

    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBeUndefined();
  });

  it("départage par l'identifiant les produits créés au même instant", async () => {
    for (const id of ["a", "b", "c", "d", "e"]) {
      await addProduct(id, "10:00:00");
    }

    const pages = await allPages((cursor) => asVisitor().product.list({ limit: 2, cursor }));

    expect(pages).toEqual([["e", "d"], ["c", "b"], ["a"]]);
  });

  it("ne perd pas les produits créés dans la même milliseconde", async () => {
    // Postgres garde les microsecondes, JavaScript s'arrête aux millisecondes.
    await addProduct("p1", "10:00:00.123100");
    await addProduct("p2", "10:00:00.123500");
    await addProduct("p3", "10:00:00.123900");

    const pages = await allPages((cursor) => asVisitor().product.list({ limit: 1, cursor }));

    expect(pages).toEqual([["p3"], ["p2"], ["p1"]]);
  });

  it("garde les filtres sur les pages suivantes", async () => {
    await addProduct("hpi-1", "10:00:01", { category: "HPI" });
    await addProduct("adhd-1", "10:00:02", { category: "ADHD" });
    await addProduct("hpi-2", "10:00:03", { category: "HPI" });
    await addProduct("adhd-2", "10:00:04", { category: "ADHD" });
    await addProduct("hpi-3", "10:00:05", { category: "HPI" });

    const pages = await allPages((cursor) =>
      asVisitor().product.list({ limit: 2, category: "HPI", cursor })
    );

    expect(pages).toEqual([["hpi-3", "hpi-2"], ["hpi-1"]]);
  });

  it("renvoie une page vide pour un curseur inconnu", async () => {
    await addProduct("p1", "10:00:01");

    const page = await asVisitor().product.list({ limit: 2, cursor: "inconnu" });

    expect(page).toEqual({ items: [], nextCursor: undefined });
  });
});

describe("les autres listes paginées", () => {
  it("product.myProducts et product.adminList", async () => {
    await addProduct("p1", "10:00:01");
    await addProduct("p2", "10:00:02");
    await addProduct("p3", "10:00:03");

    expect(
      await allPages((cursor) => asVendor().product.myProducts({ limit: 2, cursor }))
    ).toEqual([[shop.product.id, "p3"], ["p2", "p1"]]);
    expect(
      await allPages((cursor) => asAdmin().product.adminList({ limit: 2, active: true, cursor }))
    ).toEqual([["p3", "p2"], ["p1"]]);
  });

  it("order.myOrders, order.vendorOrders et order.adminList", async () => {
    await addOrder("o1", "10:00:01");
    await addOrder("o2", "10:00:02");
    await addOrder("o3", "10:00:03");

    const expected = [["o3", "o2"], ["o1"]];
    expect(await allPages((cursor) => asCustomer().order.myOrders({ limit: 2, cursor }))).toEqual(expected);
    expect(await allPages((cursor) => asVendor().order.vendorOrders({ limit: 2, cursor }))).toEqual(expected);
    expect(await allPages((cursor) => asAdmin().order.adminList({ limit: 2, cursor }))).toEqual(expected);
  });

  it("review.byProduct", async () => {
    await addProduct("p1", "10:00:01");
    await addProduct("p2", "10:00:02");
    await addProduct("p3", "10:00:03");
    for (const [id, productId, time] of [
      ["r1", "p1", "11:00:01"],
      ["r2", "p2", "11:00:02"],
      ["r3", "p3", "11:00:03"],
    ]) {
      await db.insert(reviews).values({
        id,
        userId: shop.customer.id,
        productId,
        rating: 4,
        createdAt: at(time),
      });
    }
    await db.insert(users).values({ id: "client-2", email: "noa@exemple.fr" });
    await db.insert(reviews).values([
      { id: "r4", userId: shop.owner.id, productId: "p1", rating: 5, createdAt: at("11:00:04") },
      { id: "r5", userId: "client-2", productId: "p1", rating: 3, createdAt: at("11:00:05") },
    ]);

    expect(
      await allPages((cursor) => asVisitor().review.byProduct({ productId: "p1", limit: 2, cursor }))
    ).toEqual([["r5", "r4"], ["r1"]]);
  });

  it("vendor.list, vendor.adminList et user.adminList", async () => {
    for (const [index, id] of ["u1", "u2", "u3"].entries()) {
      await db.insert(users).values({
        id,
        email: `${id}@exemple.fr`,
        role: "vendor",
        createdAt: at(`12:00:0${index + 1}`),
      });
      await db.insert(vendors).values({
        id: `v-${id}`,
        userId: id,
        businessName: `Boutique ${id}`,
        approved: true,
        createdAt: at(`12:00:0${index + 1}`),
      });
    }
    // Le vendeur de seedShop est créé à l'heure courante : il sort en premier.
    const vendorPages = await allPages((cursor) => asVisitor().vendor.list({ limit: 2, cursor }));
    expect(vendorPages).toEqual([[shop.vendor.id, "v-u3"], ["v-u2", "v-u1"]]);

    const adminVendorPages = await allPages((cursor) =>
      asAdmin().vendor.adminList({ limit: 3, approved: true, cursor })
    );
    expect(adminVendorPages).toEqual([[shop.vendor.id, "v-u3", "v-u2"], ["v-u1"]]);

    const userPages = await allPages((cursor) =>
      asAdmin().user.adminList({ limit: 2, role: "vendor", cursor })
    );
    expect(userPages).toEqual([[shop.owner.id, "u3"], ["u2", "u1"]]);
  });
});

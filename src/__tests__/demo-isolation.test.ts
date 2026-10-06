// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { orderItems, orders, products, reviews, sessions, users } from "@/server/db/schema";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { seedDemo } from "@/server/demo/seed";
import { createTestDb } from "./helpers/test-db";

// Le nettoyage et les plafonds lisent la base par le module `@/server/db` :
// on le fait pointer sur la base en mémoire du test en cours.
const holder = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("@/server/db", () => ({
  db: new Proxy(
    {},
    {
      get(_target, prop) {
        const db = holder.db as Record<string | symbol, unknown>;
        const value = db[prop];
        return typeof value === "function" ? value.bind(db) : value;
      },
    }
  ),
}));
vi.mock("@/lib/demo", async (original) => ({
  ...(await original<typeof import("@/lib/demo")>()),
  isDemo: true,
}));
const refunds = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/server/stripe", () => ({ getStripe: () => ({ refunds }) }));

const { deleteExpiredSandboxes, isIpOverLimit, resetSeedStock } = await import(
  "@/server/demo/sandbox"
);
const { GET: cleanup } = await import("@/app/api/demo/cleanup/route");

const NOW = new Date("2026-10-06T12:00:00Z");
const HOUR_MS = 60 * 60 * 1000;
let db: Database;

type Role = "customer" | "vendor" | "admin";

/** Les trois comptes d'un visiteur, comme les crée l'entrée dans la démo. */
async function addSandbox(sandboxId: string, createdAt = NOW) {
  await db.insert(users).values(
    (["customer", "vendor", "admin"] as const).map((role) => ({
      id: `${role}-${sandboxId}`,
      name: `${role} ${sandboxId}`,
      email: `${role}-${sandboxId}@demo.invalid`,
      role,
      demoSandboxId: sandboxId,
      createdAt,
    }))
  );
}

/** Un visiteur du bac à sable donné, dans le rôle donné. */
const as = (sandboxId: string, role: Role) =>
  createCallerFactory(appRouter)({
    db,
    session: {
      user: {
        id: `${role}-${sandboxId}`,
        email: `${role}-${sandboxId}@demo.invalid`,
        role,
        demoSandboxId: sandboxId,
      },
      session: {},
    },
  } as never);

const anonymous = () => createCallerFactory(appRouter)({ db, session: null } as never);

type Status = NonNullable<(typeof orders.$inferInsert)["status"]>;

/** Une commande du client d'un bac à sable, pour un produit du décor. */
async function addOrder(sandboxId: string, productId: string, status: Status = "paid") {
  const product = (await db.query.products.findFirst({ where: eq(products.id, productId) }))!;
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: `NB-${crypto.randomUUID()}`,
      userId: `customer-${sandboxId}`,
      vendorId: product.vendorId,
      subtotal: product.price,
      commission: "1.00",
      total: product.price,
      status,
      stripePaymentIntentId: "pi_123",
    })
    .returning();
  await db.insert(orderItems).values({
    orderId: order.id,
    productId,
    productName: product.name,
    quantity: 1,
    unitPrice: product.price,
    totalPrice: product.price,
  });
  return order;
}

const ids = (rows: { id: string }[]) => rows.map((row) => row.id);

beforeEach(async () => {
  refunds.create.mockReset().mockResolvedValue({ id: "re_1" });
  db = await createTestDb();
  holder.db = db;
  await seedDemo(db, { stripeAccountId: "acct_test", now: NOW });
  await addSandbox("a");
  await addSandbox("b");
});

describe("cloisonnement : l'admin d'un bac à sable", () => {
  it("voit le décor et ses propres commandes, jamais celles d'un autre visiteur", async () => {
    const mine = await addOrder("a", "synaptic-focus");
    const theirs = await addOrder("b", "synaptic-focus");

    const page = await as("a", "admin").order.adminList({ limit: 100 });

    expect(page.items).toHaveLength(9);
    expect(ids(page.items)).toContain(mine.id);
    expect(ids(page.items)).not.toContain(theirs.id);
  });

  it("a des statistiques qui ne comptent que le décor et son bac à sable", async () => {
    await addOrder("a", "synaptic-focus");
    await addOrder("b", "synaptic-focus");
    await addOrder("b", "deep-thought");

    const stats = await as("a", "admin").admin.getStats();
    const recent = await as("a", "admin").admin.getRecentOrders({ limit: 50 });

    // 7 comptes de décor + ses 3 comptes ; 8 commandes de décor + la sienne.
    expect(stats.users).toBe(10);
    expect(stats.orders).toBe(9);
    expect(recent).toHaveLength(9);
    expect(recent.every((order) => order.user.email !== "customer-b@demo.invalid")).toBe(true);
  });

  it("ne voit pas les comptes des autres visiteurs", async () => {
    const page = await as("a", "admin").user.adminList({ limit: 100 });

    expect(page.items).toHaveLength(10);
    expect(page.items.some((user) => user.email.endsWith("-b@demo.invalid"))).toBe(false);
  });

  it("peut annuler sa commande, pas celle d'un autre visiteur", async () => {
    const mine = await addOrder("a", "synaptic-focus");
    const theirs = await addOrder("b", "synaptic-focus");

    const cancelled = await as("a", "admin").order.adminCancel({ orderId: mine.id });
    expect(cancelled.status).toBe("cancelled");

    await expect(
      as("a", "admin").order.adminCancel({ orderId: theirs.id })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(refunds.create).toHaveBeenCalledTimes(1);
  });
});

describe("cloisonnement : le vendeur d'un bac à sable", () => {
  it("tient la première boutique du décor avant toute commande", async () => {
    const shop = await as("a", "vendor").vendor.me();

    expect(shop?.businessName).toBe("Atelier Dubois");
  });

  it("tient la boutique où son bac à sable a commandé en dernier", async () => {
    // hyper-focus est vendu par Maison Chen.
    await addOrder("a", "hyper-focus");

    const shop = await as("a", "vendor").vendor.me();
    const other = await as("b", "vendor").vendor.me();

    expect(shop?.businessName).toBe("Maison Chen");
    expect(other?.businessName).toBe("Atelier Dubois");
  });

  it("ne donne pas de boutique au client du bac à sable", async () => {
    expect(await as("a", "customer").vendor.me()).toBeNull();
  });

  it("voit arriver sa commande, pas celle d'un autre visiteur dans la même boutique", async () => {
    const mine = await addOrder("a", "hyper-focus");
    const theirs = await addOrder("b", "hyper-focus");

    const page = await as("a", "vendor").order.vendorOrders({ limit: 50 });
    const stats = await as("a", "vendor").vendor.myStats();

    expect(ids(page.items)).toContain(mine.id);
    expect(ids(page.items)).not.toContain(theirs.id);
    expect(page.items.every((order) => order.vendorId === mine.vendorId)).toBe(true);
    expect(stats.toProcess).toBe(1);
  });

  it("peut expédier sa commande, pas celle d'un autre visiteur", async () => {
    const mine = await addOrder("a", "hyper-focus");
    const theirs = await addOrder("b", "hyper-focus");

    const shipped = await as("a", "vendor").order.updateStatus({
      orderId: mine.id,
      status: "shipped",
    });
    expect(shipped.status).toBe("shipped");

    await expect(
      as("a", "vendor").order.updateStatus({ orderId: theirs.id, status: "shipped" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("le décor en lecture seule", () => {
  it("refuse de faire avancer ou d'annuler une commande du décor", async () => {
    // Si le décor reçoit un jour une commande en cours, elle reste intouchable.
    await db.update(orders).set({ status: "paid" }).where(eq(orders.id, "seed-order-1"));
    const seedOrder = (await db.query.orders.findFirst({ where: eq(orders.id, "seed-order-1") }))!;
    await db.insert(orders).values({
      orderNumber: "NB-A",
      userId: "customer-a",
      vendorId: seedOrder.vendorId,
      subtotal: "1.00",
      commission: "0.10",
      total: "1.00",
      status: "paid",
    });

    await expect(
      as("a", "vendor").order.updateStatus({ orderId: "seed-order-1", status: "shipped" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      as("a", "admin").order.adminCancel({ orderId: "seed-order-1" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(refunds.create).not.toHaveBeenCalled();
  });

  it("ne montre pas l'identifiant du compte Stripe partagé", async () => {
    const shop = await as("a", "vendor").vendor.me();
    const status = await as("a", "vendor").payment.getConnectStatus();

    expect(shop?.stripeAccountId).toBeNull();
    expect(status).toEqual({ connected: true, onboardingComplete: true, payoutsEnabled: true });
  });
});

describe("cloisonnement : les avis", () => {
  it("ne montre l'avis d'un visiteur qu'à lui-même", async () => {
    await as("b", "customer").review.create({
      productId: "synaptic-focus",
      rating: 1,
      comment: "Texte que personne d'autre ne doit lire",
    });

    // Le décor compte deux avis sur ce produit (5 et 4 étoiles).
    for (const viewer of [as("a", "customer"), anonymous()]) {
      const product = await viewer.product.byId({ id: "synaptic-focus" });
      const page = await viewer.review.byProduct({ productId: "synaptic-focus" });
      expect(product.reviewStats).toEqual({ count: 2, average: 4.5 });
      expect(product.reviews).toHaveLength(2);
      expect(page.items).toHaveLength(2);
    }

    const own = await as("b", "customer").product.byId({ id: "synaptic-focus" });
    expect(own.reviewStats.count).toBe(3);
    expect(own.reviews).toHaveLength(3);
  });
});

describe("actions désactivées en démo", () => {
  it("refuse tout ce qui modifierait le décor", async () => {
    const admin = as("a", "admin");
    const vendor = as("a", "vendor");
    const blocked = [
      vendor.product.create({ name: "Produit pirate", price: 1 }),
      vendor.product.update({ id: "synaptic-focus", name: "Renommé" } as never),
      vendor.product.delete({ id: "synaptic-focus" }),
      admin.product.adminToggleActive({ productId: "synaptic-focus" }),
      admin.admin.toggleProductFeatured({ productId: "synaptic-focus" }),
      admin.vendor.approve({ vendorId: "atelier-dubois" }),
      admin.vendor.reject({ vendorId: "atelier-dubois" }),
      admin.vendor.updateCommission({ vendorId: "atelier-dubois", commissionRate: 0 }),
      admin.user.adminUpdateRole({ userId: "customer-b", role: "admin" }),
      as("a", "customer").vendor.register({ businessName: "Ma boutique" }),
      vendor.payment.createConnectAccount(),
    ];

    for (const attempt of blocked) {
      await expect(attempt).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
    const product = await db.query.products.findFirst({
      where: eq(products.id, "synaptic-focus"),
    });
    expect(product?.name).toBe("Synaptic Focus");
    expect(await db.query.vendors.findMany()).toHaveLength(3);
  });
});

describe("nettoyage des bacs à sable", () => {
  it("supprime les bacs à sable expirés avec leurs commandes et leurs avis, et garde le reste", async () => {
    await addSandbox("vieux", new Date(NOW.getTime() - 25 * HOUR_MS));
    const old = await addOrder("vieux", "synaptic-focus");
    await as("vieux", "customer").review.create({ productId: "synaptic-focus", rating: 3 });
    const recent = await addOrder("a", "synaptic-focus");

    const deleted = await deleteExpiredSandboxes(NOW);

    expect(deleted).toBe(3);
    expect(await db.query.orders.findFirst({ where: eq(orders.id, old.id) })).toBeUndefined();
    expect(await db.select().from(orderItems).where(eq(orderItems.orderId, old.id))).toHaveLength(0);
    expect(await db.query.orders.findFirst({ where: eq(orders.id, recent.id) })).toBeDefined();
    // Décor intact : 7 comptes, 8 commandes, 8 avis ; plus les bacs à sable a et b.
    expect(await db.select().from(users)).toHaveLength(13);
    expect(await db.select().from(orders)).toHaveLength(9);
    expect(await db.select().from(reviews)).toHaveLength(8);
  });

  it("remet le stock du décor à sa valeur de départ", async () => {
    const before = (await db.query.products.findFirst({
      where: eq(products.id, "synaptic-focus"),
    }))!.stock;
    await db.update(products).set({ stock: 0 }).where(eq(products.id, "synaptic-focus"));

    await resetSeedStock();

    const after = await db.query.products.findFirst({
      where: eq(products.id, "synaptic-focus"),
    });
    expect(after?.stock).toBe(before);
  });

  it("n'est ouvert qu'à la tâche planifiée", async () => {
    process.env.CRON_SECRET = "secret-du-cron";
    const call = (authorization?: string) =>
      cleanup(
        new Request("http://localhost:3000/api/demo/cleanup", {
          headers: authorization ? { authorization } : {},
        })
      );

    expect((await call()).status).toBe(401);
    expect((await call("Bearer mauvais")).status).toBe(401);
    const ok = await call("Bearer secret-du-cron");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ deletedAccounts: 0 });

    delete process.env.CRON_SECRET;
    expect((await call("Bearer undefined")).status).toBe(401);
  });
});

describe("limite par adresse IP", () => {
  const from = (ip: string) => new Headers({ "x-forwarded-for": ip });

  /** Un bac à sable ouvert depuis cette adresse, à cette date. */
  async function openFrom(ip: string, sandboxId: string, createdAt: Date) {
    await addSandbox(sandboxId, createdAt);
    await db.update(users).set({ demoIp: ip }).where(eq(users.demoSandboxId, sandboxId));
  }

  it("bloque la sixième entrée dans l'heure depuis la même adresse", async () => {
    for (let index = 0; index < 4; index++) await openFrom("203.0.113.7", `h${index}`, NOW);
    expect(await isIpOverLimit(from("203.0.113.7"), NOW)).toBe(false);

    await openFrom("203.0.113.7", "h4", NOW);

    expect(await isIpOverLimit(from("203.0.113.7"), NOW)).toBe(true);
    expect(await isIpOverLimit(from("203.0.113.8"), NOW)).toBe(false);
  });

  it("compte encore un visiteur qui s'est déconnecté entre deux entrées", async () => {
    for (let index = 0; index < 5; index++) await openFrom("203.0.113.7", `d${index}`, NOW);
    // Se déconnecter supprime les sessions, pas les comptes.
    await db.delete(sessions);

    expect(await isIpOverLimit(from("203.0.113.7"), NOW)).toBe(true);
  });

  it("oublie les entrées de plus d'une heure, dans la limite du jour", async () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * HOUR_MS);
    for (let index = 0; index < 5; index++) await openFrom("203.0.113.7", `j${index}`, twoHoursAgo);

    expect(await isIpOverLimit(from("203.0.113.7"), NOW)).toBe(false);
  });
});

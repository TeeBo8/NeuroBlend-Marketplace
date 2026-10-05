import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "@/server/db";
import * as schema from "@/server/db/schema";

/**
 * Base Postgres en mémoire (PGlite), créée à partir des vraies migrations.
 * Les tests exécutent ainsi le même SQL qu'en production, sans réseau.
 */
export async function createTestDb(): Promise<Database> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  // Même API de requêtes que le client Neon utilisé par l'application.
  return db as unknown as Database;
}

type SeedOptions = { stock?: number; price?: string; commissionRate?: string };

/** Un client, un vendeur approuvé et un produit en stock. */
export async function seedShop(db: Database, options: SeedOptions = {}) {
  const [customer] = await db
    .insert(schema.users)
    .values({ id: "client-1", name: "Léa Client", email: "lea@exemple.fr" })
    .returning();
  const [owner] = await db
    .insert(schema.users)
    .values({ id: "vendeur-1", name: "Marc Vendeur", email: "marc@exemple.fr", role: "vendor" })
    .returning();
  const [vendor] = await db
    .insert(schema.vendors)
    .values({
      userId: owner.id,
      businessName: "Torréfaction Test",
      stripeAccountId: "acct_test",
      stripeOnboardingComplete: true,
      approved: true,
      commissionRate: options.commissionRate ?? "15.00",
    })
    .returning();
  const [product] = await db
    .insert(schema.products)
    .values({
      vendorId: vendor.id,
      name: "Café Test",
      slug: "cafe-test",
      price: options.price ?? "12.90",
      stock: options.stock ?? 10,
    })
    .returning();

  return { customer, owner, vendor, product };
}

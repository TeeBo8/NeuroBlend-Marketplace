/**
 * Charge le décor de la démo dans la base de DATABASE_URL.
 * Usage : pnpm db:seed --reset
 *
 * Destructif : la base est vidée avant le chargement (comptes, commandes,
 * avis, tout). D'où l'option --reset obligatoire, et le nom de la base
 * affiché avant d'agir.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { isNotNull } from 'drizzle-orm';
import type { Database } from './index';
import * as schema from './schema';
import { seedDemo } from '../demo/seed';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL est absente : vérifier .env.local');
    process.exit(1);
  }

  const host = new URL(url).hostname;
  console.log(`Base visée : ${host}`);

  if (!process.argv.includes('--reset')) {
    console.error(
      'Cette commande VIDE la base avant de charger le décor.\n' +
        'Relancer avec --reset pour confirmer : pnpm db:seed --reset'
    );
    process.exit(1);
  }

  const db = drizzle(neon(url), { schema }) as unknown as Database;

  // Les boutiques du décor partagent un compte Stripe Connect de test. On
  // prend celui de DEMO_STRIPE_ACCOUNT_ID, sinon celui déjà présent en base.
  const [existing] = await db
    .select({ stripeAccountId: schema.vendors.stripeAccountId })
    .from(schema.vendors)
    .where(isNotNull(schema.vendors.stripeAccountId))
    .limit(1);
  const stripeAccountId =
    process.env.DEMO_STRIPE_ACCOUNT_ID ?? existing?.stripeAccountId ?? null;

  const summary = await seedDemo(db, { stripeAccountId });

  console.log(
    `Décor chargé : ${summary.vendors} boutiques, ${summary.products} produits, ` +
      `${summary.customers} clients, ${summary.orders} commandes, ${summary.reviews} avis.`
  );
  console.log(
    stripeAccountId
      ? 'Compte Stripe Connect de test relié : les produits sont payables.'
      : 'Aucun compte Stripe Connect : les produits ne sont pas payables. ' +
          'Renseigner DEMO_STRIPE_ACCOUNT_ID puis relancer.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

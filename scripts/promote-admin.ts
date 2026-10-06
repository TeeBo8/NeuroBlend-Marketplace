/**
 * Donne le rôle admin à un compte existant.
 * Usage : pnpm db:promote-admin <email>
 *
 * Il n'existe volontairement aucun écran pour créer le premier admin : il se
 * nomme depuis la machine qui a accès à la base.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { users } from '../src/server/db/schema';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage : pnpm db:promote-admin <email>');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL est absente : vérifier .env.local');
    process.exit(1);
  }

  const db = drizzle(neon(process.env.DATABASE_URL));

  const [updated] = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning({ email: users.email, role: users.role });

  if (!updated) {
    console.error(`Aucun compte avec l'adresse « ${email} ».`);
    process.exit(1);
  }

  console.log(`${updated.email} est maintenant admin.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

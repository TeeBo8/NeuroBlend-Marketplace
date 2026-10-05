import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}

export type Database = ReturnType<typeof createDb>;

let instance: Database | undefined;

// La connexion est créée au premier accès, pas à l'import : `next build`
// charge ce module sans DATABASE_URL (CI, clone tout neuf) et ne doit pas planter.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    instance ??= createDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

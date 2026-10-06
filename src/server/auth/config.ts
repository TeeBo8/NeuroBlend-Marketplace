import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';
import * as schema from '@/server/db/schema';
import { siteUrl, trustedOrigins } from '@/lib/site-url';

export const auth = betterAuth({
  baseURL: siteUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: false,
      },
    },
  },
});

type Session = typeof auth.$Infer.Session;

// Extended user type with role
export type SessionUser = Session['user'] & {
  role: 'customer' | 'vendor' | 'admin';
};

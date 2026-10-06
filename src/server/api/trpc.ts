import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '@/server/db';
import { auth, type SessionUser } from '@/server/auth/config';
import { headers } from 'next/headers';
import { isDemo } from '@/lib/demo';

export const createTRPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    db,
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      // Une erreur imprévue (SQL, Stripe) ne montre pas son détail au
      // navigateur : il reste dans les journaux du serveur.
      message:
        error.code === 'INTERNAL_SERVER_ERROR'
          ? 'Une erreur est survenue. Réessayez dans un instant.'
          : shape.message,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

// En démo, le décor est en lecture seule : les procédures qui le modifieraient
// (catalogue, boutiques, rôles) ou qui sortent du parcours montré portent ce
// garde. À ajouter avec `.use(blockedInDemo)`.
export const blockedInDemo = t.middleware(({ next }) => {
  if (isDemo) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Action désactivée dans la démonstration.',
    });
  }
  return next();
});

// Public procedure - anyone can access
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  // Cast user to include role field
  const user = ctx.session.user as SessionUser;
  return next({
    ctx: {
      session: { ...ctx.session, user },
    },
  });
});

// Vendor procedure - requires vendor role
export const vendorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'vendor' && role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be a vendor to access this resource',
    });
  }
  return next({ ctx });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  return next({ ctx });
});

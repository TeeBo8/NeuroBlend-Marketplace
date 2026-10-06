import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  blockedInDemo,
} from '../trpc';
import { users } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { fromCursor, newestFirst, toPage } from '../pagination';
import { ownerVisibleTo } from '@/server/demo/visibility';

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  // Update user profile
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100).optional(),
        image: z.string().url().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image,
          role: users.role,
        });

      return updatedUser;
    }),

  // Admin: List all users
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        role: z.enum(['customer', 'vendor', 'admin']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        ownerVisibleTo(users.id, ctx),
        fromCursor(users, input.cursor),
      ];

      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }

      const items = await ctx.db.query.users.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(users),
        columns: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
        },
      });

      return toPage(items, input.limit);
    }),

  // Admin: Update user role
  adminUpdateRole: adminProcedure
    .use(blockedInDemo)
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['customer', 'vendor', 'admin']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent changing own role
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot change your own role',
        });
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        });

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return updatedUser;
    }),
});

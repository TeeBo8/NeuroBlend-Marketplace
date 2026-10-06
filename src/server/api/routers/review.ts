import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '../trpc';
import { reviews, orderItems, orders } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { fromCursor, newestFirst, toPage } from '../pagination';
import { ownerVisibleTo } from '@/server/demo/visibility';

export const reviewRouter = createTRPCRouter({
  // Create a review
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(100).optional(),
        comment: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reviewed this product
      const existingReview = await ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.userId, ctx.session.user.id),
          eq(reviews.productId, input.productId)
        ),
      });

      if (existingReview) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Vous avez déjà laissé un avis pour ce produit',
        });
      }

      // Verified badge: this user received this product in one of their
      // own orders.
      const [deliveredPurchase] = await ctx.db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orderItems.productId, input.productId),
            eq(orders.userId, ctx.session.user.id),
            eq(orders.status, 'delivered')
          )
        )
        .limit(1);

      const isVerified = deliveredPurchase !== undefined;

      const [review] = await ctx.db
        .insert(reviews)
        .values({
          userId: ctx.session.user.id,
          productId: input.productId,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          verified: isVerified,
        })
        .returning();

      return review;
    }),

  // Get reviews for a product
  byProduct: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.reviews.findMany({
        where: and(
          eq(reviews.productId, input.productId),
          ownerVisibleTo(reviews.userId, ctx),
          fromCursor(reviews, input.cursor)
        ),
        limit: input.limit + 1,
        orderBy: newestFirst(reviews),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),
});

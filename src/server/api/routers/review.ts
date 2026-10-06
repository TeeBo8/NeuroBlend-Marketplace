import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '../trpc';
import { reviews, orderItems } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { fromCursor, newestFirst, toPage } from '../pagination';

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

      // Check if user has purchased this product (for verified badge)
      const purchasedItem = await ctx.db.query.orderItems.findFirst({
        where: eq(orderItems.productId, input.productId),
        with: {
          order: {
            columns: {
              userId: true,
              status: true,
            },
          },
        },
      });

      const isVerified =
        purchasedItem?.order?.userId === ctx.session.user.id &&
        purchasedItem?.order?.status === 'delivered';

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

  // Get my reviews
  myReviews: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.reviews.findMany({
        where: and(
          eq(reviews.userId, ctx.session.user.id),
          fromCursor(reviews, input.cursor)
        ),
        limit: input.limit + 1,
        orderBy: newestFirst(reviews),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
              slug: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),

  // Delete my review
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.id, input.id),
          eq(reviews.userId, ctx.session.user.id)
        ),
      });

      if (!review) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Avis introuvable',
        });
      }

      await ctx.db.delete(reviews).where(eq(reviews.id, input.id));

      return { success: true };
    }),
});

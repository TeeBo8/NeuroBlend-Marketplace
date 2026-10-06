import { z } from 'zod';
import { eq, and, ne, sql } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  vendorProcedure,
  adminProcedure,
} from '../trpc';
import { orders } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { fromCursor, newestFirst, toPage } from '../pagination';
import { isCollected, isPlaced, STATUSES_BEFORE } from '@/server/orders/status';
import {
  markOrderCancelled,
  refundOrderPayment,
} from '@/server/orders/cancellation';
import { findVendorOfUser } from '@/server/vendors';

export const orderRouter = createTRPCRouter({
  // Get user's orders
  myOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        status: z
          .enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(orders.userId, ctx.session.user.id),
        fromCursor(orders, input.cursor),
      ];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(orders),
        with: {
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
          vendor: {
            columns: {
              id: true,
              businessName: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),

  // Customer dashboard figures, computed over every order.
  myStats: protectedProcedure.query(async ({ ctx }) => {
    const [totals] = await ctx.db
      .select({
        count: sql<number>`count(*)`,
        totalSpent: sql<string>`coalesce(sum(${orders.total}) filter (where ${isCollected}), 0)`,
      })
      .from(orders)
      .where(and(eq(orders.userId, ctx.session.user.id), isPlaced));

    return {
      orders: Number(totals.count),
      totalSpent: Number(totals.totalSpent),
    };
  }),

  // Get single order
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: and(
          eq(orders.id, input.id),
          eq(orders.userId, ctx.session.user.id)
        ),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          vendor: {
            columns: {
              id: true,
              businessName: true,
              logo: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      return order;
    }),

  // Vendor: Get orders for vendor
  vendorOrders: vendorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        status: z
          .enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const vendor = await findVendorOfUser(ctx);

      if (!vendor) {
        return { items: [], nextCursor: undefined };
      }

      // A pending order is not paid yet: the vendor must neither see it nor
      // start preparing it.
      const conditions = [
        eq(orders.vendorId, vendor.id),
        ne(orders.status, 'pending'),
        fromCursor(orders, input.cursor),
      ];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(orders),
        with: {
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),

  // Vendor: Update order status
  updateStatus: vendorProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(['processing', 'shipped', 'delivered']),
        trackingNumber: z.string().trim().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await findVendorOfUser(ctx);

      if (!vendor) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vendor profile not found',
        });
      }

      const order = await ctx.db.query.orders.findFirst({
        where: and(
          eq(orders.id, input.orderId),
          eq(orders.vendorId, vendor.id)
        ),
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      // An order only moves forward, and only once it has been paid.
      const allowedFrom: readonly string[] = STATUSES_BEFORE[input.status];
      if (!order.status || !allowedFrom.includes(order.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot move an order from "${order.status}" to "${input.status}"`,
        });
      }

      const updateData: Partial<typeof orders.$inferInsert> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.trackingNumber) {
        updateData.trackingNumber = input.trackingNumber;
      }

      const [updatedOrder] = await ctx.db
        .update(orders)
        .set(updateData)
        // The status is checked again in the query: the order may have been
        // cancelled since it was read.
        .where(and(eq(orders.id, order.id), eq(orders.status, order.status)))
        .returning();

      if (!updatedOrder) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'The order has changed in the meantime, please reload',
        });
      }

      return updatedOrder;
    }),

  // Admin: Get all orders
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        status: z
          .enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
          .optional(),
        vendorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [fromCursor(orders, input.cursor)];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      if (input.vendorId) {
        conditions.push(eq(orders.vendorId, input.vendorId));
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(orders),
        with: {
          items: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          vendor: {
            columns: {
              id: true,
              businessName: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),

  // Admin: Cancel order
  adminCancel: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().trim().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      if (order.status === 'delivered') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel a delivered order',
        });
      }

      if (order.status === 'cancelled') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This order is already cancelled',
        });
      }

      // The customer may be on the payment page right now: cancelling here
      // would leave a paid order nobody fulfils. An unpaid order expires by
      // itself after 30 minutes.
      if (order.status === 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This order has not been paid yet, it will expire by itself',
        });
      }

      // Refund first: if Stripe refuses, nothing has changed on our side and
      // the admin can simply try again.
      if (order.stripePaymentIntentId) {
        await refundOrderPayment(order.id, order.stripePaymentIntentId);
      }

      const cancelled = await markOrderCancelled(
        ctx.db,
        order.id,
        input.reason
          ? `Cancelled by admin: ${input.reason}`
          : 'Cancelled by admin'
      );

      if (!cancelled) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'The order has changed in the meantime, please reload',
        });
      }

      return (await ctx.db.query.orders.findFirst({
        where: eq(orders.id, order.id),
      }))!;
    }),
});

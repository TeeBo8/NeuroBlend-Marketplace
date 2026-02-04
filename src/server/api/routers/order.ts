import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  vendorProcedure,
  adminProcedure,
} from '../trpc';
import { orders, orderItems, vendors } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';

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
      const conditions = [eq(orders.userId, ctx.session.user.id)];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: [desc(orders.createdAt)],
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

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
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
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

      if (!vendor) {
        return { items: [], nextCursor: undefined };
      }

      const conditions = [eq(orders.vendorId, vendor.id)];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      const items = await ctx.db.query.orders.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: [desc(orders.createdAt)],
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

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  // Vendor: Update order status
  updateStatus: vendorProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(['processing', 'shipped', 'delivered']),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

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
        .where(eq(orders.id, input.orderId))
        .returning();

      // TODO: Send status update email to customer

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
      const conditions = [];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      if (input.vendorId) {
        conditions.push(eq(orders.vendorId, input.vendorId));
      }

      const items = await ctx.db.query.orders.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: input.limit + 1,
        orderBy: [desc(orders.createdAt)],
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

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  // Admin: Cancel order
  adminCancel: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().optional(),
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

      const [updatedOrder] = await ctx.db
        .update(orders)
        .set({
          status: 'cancelled',
          notes: input.reason
            ? `Cancelled by admin: ${input.reason}`
            : 'Cancelled by admin',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))
        .returning();

      // TODO: Process refund via Stripe
      // TODO: Send cancellation email

      return updatedOrder;
    }),
});

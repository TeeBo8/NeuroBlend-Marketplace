import { z } from 'zod';
import { and, eq, sql, desc } from 'drizzle-orm';
import { createTRPCRouter, adminProcedure, blockedInDemo } from '../trpc';
import { orders, vendors, users, products } from '@/server/db/schema';
import { isCollected, isPlaced } from '@/server/orders/status';
import { ownerVisibleTo } from '@/server/demo/visibility';

export const adminRouter = createTRPCRouter({
  // Get platform statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [[userCount], [vendorCounts], [productCount], [orderTotals], ordersByStatus] =
      await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(ownerVisibleTo(users.id, ctx)),
        ctx.db
          .select({
            approved: sql<number>`count(*) filter (where ${vendors.approved})`,
            pending: sql<number>`count(*) filter (where not ${vendors.approved})`,
          })
          .from(vendors),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.active, true)),
        // GMV and commission cover every order whose payment was collected,
        // whatever its shipping progress.
        ctx.db
          .select({
            count: sql<number>`count(*)`,
            gmv: sql<string>`coalesce(sum(${orders.total}) filter (where ${isCollected}), 0)`,
            commission: sql<string>`coalesce(sum(${orders.commission}) filter (where ${isCollected}), 0)`,
          })
          .from(orders)
          .where(and(isPlaced, ownerVisibleTo(orders.userId, ctx))),
        ctx.db
          .select({
            status: orders.status,
            count: sql<number>`count(*)`,
          })
          .from(orders)
          .where(and(isPlaced, ownerVisibleTo(orders.userId, ctx)))
          .groupBy(orders.status),
      ]);

    return {
      users: Number(userCount.count),
      vendors: Number(vendorCounts.approved),
      pendingVendors: Number(vendorCounts.pending),
      products: Number(productCount.count),
      orders: Number(orderTotals.count),
      gmv: Number(orderTotals.gmv),
      commissionEarned: Number(orderTotals.commission),
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: Number(o.count),
      })),
    };
  }),

  // Get recent orders
  getRecentOrders: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const recentOrders = await ctx.db.query.orders.findMany({
        where: and(isPlaced, ownerVisibleTo(orders.userId, ctx)),
        limit: input.limit,
        orderBy: [desc(orders.createdAt)],
        with: {
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

      return recentOrders;
    }),

  // Get top vendors by revenue
  getTopVendors: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const topVendors = await ctx.db
        .select({
          vendorId: orders.vendorId,
          totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
          orderCount: sql<number>`count(*)`,
        })
        .from(orders)
        .where(and(isCollected, ownerVisibleTo(orders.userId, ctx)))
        .groupBy(orders.vendorId)
        .orderBy(sql`SUM(${orders.total}) DESC`)
        .limit(input.limit);

      // Get vendor details
      const vendorIds = topVendors.map((v) => v.vendorId);
      const vendorDetails = await ctx.db.query.vendors.findMany({
        where: (vendors, { inArray }) => inArray(vendors.id, vendorIds),
        columns: {
          id: true,
          businessName: true,
          logo: true,
        },
      });

      return topVendors.map((v) => ({
        vendor: vendorDetails.find((vd) => vd.id === v.vendorId),
        totalRevenue: Number(v.totalRevenue),
        orderCount: Number(v.orderCount),
      }));
    }),

  // Toggle product featured status
  toggleProductFeatured: adminProcedure
    .use(blockedInDemo)
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const [updatedProduct] = await ctx.db
        .update(products)
        .set({
          featured: !product.featured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId))
        .returning();

      return updatedProduct;
    }),
});

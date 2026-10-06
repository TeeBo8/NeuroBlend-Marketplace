import { z } from 'zod';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { createTRPCRouter, adminProcedure } from '../trpc';
import { orders, orderItems, vendors, users, products } from '@/server/db/schema';
import { isCollected, isPlaced } from '@/server/orders/status';

export const adminRouter = createTRPCRouter({
  // Get platform statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [[userCount], [vendorCounts], [productCount], [orderTotals], ordersByStatus] =
      await Promise.all([
        ctx.db.select({ count: sql<number>`count(*)` }).from(users),
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
          .where(isPlaced),
        ctx.db
          .select({
            status: orders.status,
            count: sql<number>`count(*)`,
          })
          .from(orders)
          .where(isPlaced)
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
        where: isPlaced,
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

  // Get revenue over time
  getRevenueChart: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const revenueByDay = await ctx.db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
          commission: sql<string>`COALESCE(SUM(${orders.commission}), 0)`,
          orderCount: sql<number>`count(*)`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, startDate), isCollected))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return revenueByDay.map((day) => ({
        date: day.date,
        revenue: Number(day.revenue),
        commission: Number(day.commission),
        orderCount: Number(day.orderCount),
      }));
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
        .where(isCollected)
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

  // Get top products by sales
  getTopProducts: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const topProducts = await ctx.db
        .select({
          productId: orderItems.productId,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          totalRevenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(isCollected)
        .groupBy(orderItems.productId)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(input.limit);

      // Get product details
      const productIds = topProducts.map((p) => p.productId);
      const productDetails = await ctx.db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, productIds),
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
        },
        with: {
          vendor: {
            columns: {
              id: true,
              businessName: true,
            },
          },
        },
      });

      return topProducts.map((p) => ({
        product: productDetails.find((pd) => pd.id === p.productId),
        totalSold: Number(p.totalSold),
        totalRevenue: Number(p.totalRevenue),
      }));
    }),

  // Toggle product featured status
  toggleProductFeatured: adminProcedure
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

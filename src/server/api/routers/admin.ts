import { z } from 'zod';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { createTRPCRouter, adminProcedure } from '../trpc';
import { orders, vendors, users, products } from '@/server/db/schema';

export const adminRouter = createTRPCRouter({
  // Get platform statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Total users
    const [userCount] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Total vendors
    const [vendorCount] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(vendors)
      .where(eq(vendors.approved, true));

    // Pending vendor applications
    const [pendingVendors] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(vendors)
      .where(eq(vendors.approved, false));

    // Total products
    const [productCount] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.active, true));

    // Total orders
    const [orderCount] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    // Total revenue (GMV)
    const [revenue] = await ctx.db
      .select({
        total: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, 'paid'));

    // Total commission earned
    const [commission] = await ctx.db
      .select({
        total: sql<string>`COALESCE(SUM(${orders.commission}), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, 'paid'));

    // Orders by status
    const ordersByStatus = await ctx.db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    return {
      users: Number(userCount.count),
      vendors: Number(vendorCount.count),
      pendingVendors: Number(pendingVendors.count),
      products: Number(productCount.count),
      orders: Number(orderCount.count),
      gmv: parseFloat(revenue.total),
      commissionEarned: parseFloat(commission.total),
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
        .where(
          and(
            gte(orders.createdAt, startDate),
            eq(orders.status, 'paid')
          )
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return revenueByDay.map((day) => ({
        date: day.date,
        revenue: parseFloat(day.revenue),
        commission: parseFloat(day.commission),
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
        .where(eq(orders.status, 'paid'))
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
        totalRevenue: parseFloat(v.totalRevenue),
        orderCount: Number(v.orderCount),
      }));
    }),

  // Get top products by sales
  getTopProducts: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const { orderItems: orderItemsTable } = await import('@/server/db/schema');

      const topProducts = await ctx.db
        .select({
          productId: orderItemsTable.productId,
          totalSold: sql<number>`COALESCE(SUM(${orderItemsTable.quantity}), 0)`,
          totalRevenue: sql<string>`COALESCE(SUM(${orderItemsTable.totalPrice}), 0)`,
        })
        .from(orderItemsTable)
        .groupBy(orderItemsTable.productId)
        .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
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
        totalRevenue: parseFloat(p.totalRevenue),
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

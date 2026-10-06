import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  vendorProcedure,
  adminProcedure,
} from '../trpc';
import { vendors, users, products, orders } from '@/server/db/schema';
import { isCollected, isPlaced } from '@/server/orders/status';
import { TRPCError } from '@trpc/server';
import { sendVendorApprovedEmail } from '@/lib/email';
import { isAllowedImageUrl } from '@/lib/image-hosts';
import { fromCursor, newestFirst, toPage } from '../pagination';

export const vendorRouter = createTRPCRouter({
  // Get vendor by ID (public)
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.id, input.id),
        with: {
          products: {
            where: (products, { eq }) => eq(products.active, true),
            limit: 10,
          },
        },
      });

      if (!vendor || !vendor.approved) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      return vendor;
    }),

  // Get all approved vendors (public)
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.vendors.findMany({
        where: and(
          eq(vendors.approved, true),
          fromCursor(vendors, input.cursor)
        ),
        limit: input.limit + 1,
        orderBy: newestFirst(vendors),
        columns: {
          id: true,
          businessName: true,
          description: true,
          logo: true,
          website: true,
        },
      });

      return toPage(items, input.limit);
    }),

  // Register as vendor (authenticated users only)
  register: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2, 'Business name is required'),
        description: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a vendor profile
      const existingVendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

      if (existingVendor) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already have a vendor profile',
        });
      }

      // Create vendor profile
      const [vendor] = await ctx.db
        .insert(vendors)
        .values({
          userId: ctx.session.user.id,
          businessName: input.businessName,
          description: input.description,
          website: input.website || null,
        })
        .returning();

      // Update user role to vendor
      await ctx.db
        .update(users)
        .set({ role: 'vendor', updatedAt: new Date() })
        .where(eq(users.id, ctx.session.user.id));

      return vendor;
    }),

  // Get current user's vendor profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: eq(vendors.userId, ctx.session.user.id),
    });

    // null, not undefined: React Query rejects a query that returns undefined.
    return vendor ?? null;
  }),

  // Vendor dashboard figures, computed over every order rather than over
  // the few rows a list page happens to show.
  myStats: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: eq(vendors.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!vendor) {
      return { products: 0, orders: 0, revenue: 0, toProcess: 0 };
    }

    const [[productCount], [orderTotals]] = await Promise.all([
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.vendorId, vendor.id)),
      ctx.db
        .select({
          count: sql<number>`count(*)`,
          // What the vendor actually receives: total minus the commission.
          revenue: sql<string>`coalesce(sum(${orders.total} - ${orders.commission}) filter (where ${isCollected}), 0)`,
          toProcess: sql<number>`count(*) filter (where ${orders.status} in ('paid', 'processing'))`,
        })
        .from(orders)
        .where(and(eq(orders.vendorId, vendor.id), isPlaced)),
    ]);

    return {
      products: Number(productCount.count),
      orders: Number(orderTotals.count),
      revenue: Number(orderTotals.revenue),
      toProcess: Number(orderTotals.toProcess),
    };
  }),

  // Update vendor profile
  update: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2).optional(),
        description: z.string().optional(),
        logo: z.string().refine(isAllowedImageUrl, { message: 'Image non autorisée' }).optional(),
        website: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor profile not found',
        });
      }

      const [updatedVendor] = await ctx.db
        .update(vendors)
        .set({
          ...input,
          website: input.website || null,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendor.id))
        .returning();

      return updatedVendor;
    }),

  // Admin: List all vendors
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        approved: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [fromCursor(vendors, input.cursor)];

      if (input.approved !== undefined) {
        conditions.push(eq(vendors.approved, input.approved));
      }

      const items = await ctx.db.query.vendors.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(vendors),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return toPage(items, input.limit);
    }),

  // Admin: Get pending vendor applications
  pendingApplications: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const pendingVendors = await ctx.db.query.vendors.findMany({
        where: eq(vendors.approved, false),
        limit: input.limit,
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return pendingVendors;
    }),

  // Admin: Approve vendor
  approve: adminProcedure
    .input(z.object({ vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [updatedVendor] = await ctx.db
        .update(vendors)
        .set({
          approved: true,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, input.vendorId))
        .returning();

      if (!updatedVendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Send approval email
      const vendorUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, updatedVendor.userId),
        columns: { email: true },
      });
      if (vendorUser?.email) {
        sendVendorApprovedEmail(vendorUser.email, updatedVendor.businessName);
      }

      return updatedVendor;
    }),

  // Admin: Reject vendor
  reject: adminProcedure
    .input(
      z.object({
        vendorId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.id, input.vendorId),
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Delete vendor profile
      await ctx.db.delete(vendors).where(eq(vendors.id, input.vendorId));

      // Reset user role to customer
      await ctx.db
        .update(users)
        .set({ role: 'customer', updatedAt: new Date() })
        .where(eq(users.id, vendor.userId));

      // TODO: Send rejection email with reason

      return { success: true };
    }),

  // Admin: Update commission rate
  updateCommission: adminProcedure
    .input(
      z.object({
        vendorId: z.string(),
        commissionRate: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedVendor] = await ctx.db
        .update(vendors)
        .set({
          commissionRate: input.commissionRate.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, input.vendorId))
        .returning();

      if (!updatedVendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      return updatedVendor;
    }),
});

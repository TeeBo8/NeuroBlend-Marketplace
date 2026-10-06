import { z } from 'zod';
import { eq, and, ilike, sql } from 'drizzle-orm';
import {
  createTRPCRouter,
  publicProcedure,
  vendorProcedure,
  adminProcedure,
} from '../trpc';
import type { Database } from '@/server/db';
import { products, reviews, vendors } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import { isAllowedImageUrl } from '@/lib/image-hosts';
import { fromCursor, newestFirst, toPage } from '../pagination';

// Seules les images passées par l'upload sont acceptées : next/image refuse
// tout autre hôte, et une URL libre ferait planter les pages qui l'affichent.
const uploadedImageUrl = z.string().refine(isAllowedImageUrl, {
  message: 'Image non autorisée',
});

const productInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  capsuleCount: z.number().int().positive().default(10),
  category: z.enum(['HPI', 'ADHD', 'hypersensitive']).optional(),
  imageUrl: uploadedImageUrl.optional(),
  images: z.array(uploadedImageUrl).max(5).optional(),
  stock: z.number().int().min(0).default(0),
  intensityLevel: z.number().int().min(1).max(10).optional(),
  roastLevel: z.enum(['light', 'medium', 'dark']).optional(),
  flavorNotes: z.array(z.string()).optional(),
  origin: z.string().optional(),
});

// The product page only loads the latest reviews: the count and the average
// have to come from the database, over all of them.
async function getReviewStats(db: Database, productId: string) {
  const [stats] = await db
    .select({
      count: sql<number>`count(*)`,
      average: sql<string>`coalesce(round(avg(${reviews.rating}), 1), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  return { count: Number(stats.count), average: Number(stats.average) };
}

export const productRouter = createTRPCRouter({
  // Get all products (public)
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(['HPI', 'ADHD', 'hypersensitive']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        featured: z.boolean().optional(),
        vendorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, search, limit, featured, vendorId } = input;

      const conditions = [
        eq(products.active, true),
        fromCursor(products, input.cursor),
      ];

      if (category) {
        conditions.push(eq(products.category, category));
      }

      if (featured !== undefined) {
        conditions.push(eq(products.featured, featured));
      }

      if (vendorId) {
        conditions.push(eq(products.vendorId, vendorId));
      }

      if (search) {
        conditions.push(ilike(products.name, `%${search}%`));
      }

      const items = await ctx.db.query.products.findMany({
        where: and(...conditions),
        limit: limit + 1,
        orderBy: newestFirst(products),
        with: {
          vendor: {
            columns: {
              id: true,
              businessName: true,
              logo: true,
            },
          },
        },
      });

      return toPage(items, limit);
    }),

  // Get single product by ID or slug
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          vendor: {
            columns: {
              id: true,
              businessName: true,
              logo: true,
              description: true,
            },
          },
          reviews: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
            limit: 10,
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return {
        ...product,
        reviewStats: await getReviewStats(ctx.db, product.id),
      };
    }),

  // Create product (vendor only)
  create: vendorProcedure
    .input(productInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Get vendor for the current user
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must have a vendor profile to create products',
        });
      }

      if (!vendor.approved) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Your vendor account must be approved to create products',
        });
      }

      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug exists
      const existingProduct = await ctx.db.query.products.findFirst({
        where: eq(products.slug, slug),
      });

      const finalSlug = existingProduct
        ? `${slug}-${Date.now()}`
        : slug;

      const [product] = await ctx.db
        .insert(products)
        .values({
          name: input.name,
          slug: finalSlug,
          vendorId: vendor.id,
          description: input.description,
          shortDescription: input.shortDescription,
          price: input.price.toFixed(2),
          compareAtPrice: input.compareAtPrice?.toFixed(2),
          capsuleCount: input.capsuleCount,
          category: input.category,
          imageUrl: input.imageUrl,
          images: input.images,
          stock: input.stock,
          intensityLevel: input.intensityLevel,
          roastLevel: input.roastLevel,
          flavorNotes: input.flavorNotes,
          origin: input.origin,
        })
        .returning();

      return product;
    }),

  // Update product (vendor only)
  update: vendorProcedure
    .input(
      z.object({
        id: z.string(),
        data: productInputSchema.partial(),
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

      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.id, input.id),
          eq(products.vendorId, vendor.id)
        ),
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found or you do not have permission to edit it',
        });
      }

      // Convert prices to strings for database
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.data.name !== undefined) updateData.name = input.data.name;
      if (input.data.description !== undefined) updateData.description = input.data.description;
      if (input.data.shortDescription !== undefined) updateData.shortDescription = input.data.shortDescription;
      if (input.data.price !== undefined) updateData.price = input.data.price.toFixed(2);
      if (input.data.compareAtPrice !== undefined) updateData.compareAtPrice = input.data.compareAtPrice.toFixed(2);
      if (input.data.capsuleCount !== undefined) updateData.capsuleCount = input.data.capsuleCount;
      if (input.data.category !== undefined) updateData.category = input.data.category;
      if (input.data.imageUrl !== undefined) updateData.imageUrl = input.data.imageUrl;
      if (input.data.images !== undefined) updateData.images = input.data.images;
      if (input.data.stock !== undefined) updateData.stock = input.data.stock;
      if (input.data.intensityLevel !== undefined) updateData.intensityLevel = input.data.intensityLevel;
      if (input.data.roastLevel !== undefined) updateData.roastLevel = input.data.roastLevel;
      if (input.data.flavorNotes !== undefined) updateData.flavorNotes = input.data.flavorNotes;
      if (input.data.origin !== undefined) updateData.origin = input.data.origin;

      const [updatedProduct] = await ctx.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, input.id))
        .returning();

      return updatedProduct;
    }),

  // Delete product (vendor only)
  delete: vendorProcedure
    .input(z.object({ id: z.string() }))
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

      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.id, input.id),
          eq(products.vendorId, vendor.id)
        ),
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found or you do not have permission to delete it',
        });
      }

      await ctx.db.delete(products).where(eq(products.id, input.id));

      return { success: true };
    }),

  // Admin: List all products (including inactive)
  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        search: z.string().optional(),
        category: z.enum(['HPI', 'ADHD', 'hypersensitive']).optional(),
        active: z.boolean().optional(),
        featured: z.boolean().optional(),
        vendorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [fromCursor(products, input.cursor)];

      if (input.category) {
        conditions.push(eq(products.category, input.category));
      }
      if (input.active !== undefined) {
        conditions.push(eq(products.active, input.active));
      }
      if (input.featured !== undefined) {
        conditions.push(eq(products.featured, input.featured));
      }
      if (input.vendorId) {
        conditions.push(eq(products.vendorId, input.vendorId));
      }
      if (input.search) {
        conditions.push(ilike(products.name, `%${input.search}%`));
      }

      const items = await ctx.db.query.products.findMany({
        where: and(...conditions),
        limit: input.limit + 1,
        orderBy: newestFirst(products),
        with: {
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

  // Admin: Toggle product active status
  adminToggleActive: adminProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      const [updatedProduct] = await ctx.db
        .update(products)
        .set({
          active: !product.active,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId))
        .returning();

      return updatedProduct;
    }),

  // Get vendor's own products
  myProducts: vendorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: eq(vendors.userId, ctx.session.user.id),
      });

      if (!vendor) {
        return { items: [], nextCursor: undefined };
      }

      const items = await ctx.db.query.products.findMany({
        where: and(
          eq(products.vendorId, vendor.id),
          fromCursor(products, input.cursor)
        ),
        limit: input.limit + 1,
        orderBy: newestFirst(products),
      });

      return toPage(items, input.limit);
    }),
});

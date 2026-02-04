# NeuroBlend - Back-end Structure Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  React Components  │  Zustand Stores  │  tRPC Client (React Query)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  API Routes │  │   tRPC      │  │    Better-Auth          │ │
│  │ /api/...    │  │ /api/trpc   │  │    /api/auth/[...all]   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│         │                │                    │                 │
│         ▼                ▼                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    tRPC ROUTERS                             ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      ││
│  │  │ product  │ │  vendor  │ │  order   │ │  user    │      ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      ││
│  │  ┌──────────┐ ┌──────────┐                                 ││
│  │  │ payment  │ │  admin   │                                 ││
│  │  └──────────┘ └──────────┘                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    DRIZZLE ORM                              ││
│  │              Database Queries & Mutations                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NEON POSTGRESQL (Serverless)                   │
│                                                                 │
│  users │ sessions │ accounts │ verifications │ vendors         │
│  products │ orders │ order_items │ reviews │ subscriptions     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│   Stripe     │   Resend     │  UploadThing │    Anthropic      │
│  Payments    │   Emails     │    Files     │       AI          │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   sessions   │       │   accounts   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ userId (FK)  │       │ id (PK)      │
│ email        │       │ id (PK)      │       │ userId (FK)  │──►
│ name         │       │ token        │       │ providerId   │
│ role         │       │ expiresAt    │       │ accountId    │
│ emailVerified│       └──────────────┘       └──────────────┘
│ image        │
└──────────────┘
       │
       │ 1:1 (si role=vendor)
       ▼
┌──────────────┐       ┌──────────────┐
│   vendors    │       │   products   │
├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ vendorId(FK) │
│ userId (FK)  │──►    │ id (PK)      │
│ businessName │       │ name         │
│ description  │       │ slug         │
│ stripeAcctId │       │ price        │
│ approved     │       │ category     │
│ commission   │       │ stock        │
└──────────────┘       │ active       │
       │               └──────────────┘
       │                      │
       │                      │ 1:N
       │                      ▼
       │               ┌──────────────┐
       │               │   reviews    │
       │               ├──────────────┤
       │               │ id (PK)      │
       │               │ userId (FK)  │◄── users
       │               │ productId(FK)│
       │               │ rating       │
       │               │ comment      │
       │               └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐       ┌──────────────┐
│    orders    │       │ order_items  │
├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ orderId (FK) │
│ userId (FK)  │──►    │ id (PK)      │
│ vendorId(FK) │──►    │ productId(FK)│──► products
│ orderNumber  │       │ quantity     │
│ status       │       │ unitPrice    │
│ total        │       └──────────────┘
│ commission   │
└──────────────┘

┌──────────────┐       ┌──────────────────┐
│ subscriptions│       │ subscription_items│
├──────────────┤       ├──────────────────┤
│ id (PK)      │◄──────│ subscriptionId   │
│ userId (FK)  │──►    │ id (PK)          │
│ stripeSubId  │       │ productId (FK)   │──► products
│ status       │       │ quantity         │
│ frequency    │       └──────────────────┘
└──────────────┘
```

### 2.2 Table Details

#### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  role user_role DEFAULT 'customer',  -- 'customer' | 'vendor' | 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### vendors
```sql
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  website TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### products
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  capsule_count INTEGER DEFAULT 10,
  category category,  -- 'HPI' | 'ADHD' | 'hypersensitive'
  image_url TEXT,
  images TEXT[],
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  intensity_level INTEGER,  -- 1-10
  roast_level TEXT,  -- 'light' | 'medium' | 'dark'
  flavor_notes TEXT[],
  origin TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### orders
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id),
  vendor_id TEXT REFERENCES vendors(id),
  subtotal DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
```

---

## 3. tRPC Architecture

### 3.1 File Structure

```
src/server/
├── api/
│   ├── trpc.ts          # Core setup, context, procedures
│   ├── root.ts          # Root router combining all routers
│   └── routers/
│       ├── product.ts   # Product CRUD
│       ├── vendor.ts    # Vendor management
│       ├── order.ts     # Order management
│       ├── user.ts      # User profile
│       ├── payment.ts   # Stripe integration
│       └── admin.ts     # Admin operations
├── auth/
│   └── config.ts        # Better-auth configuration
└── db/
    ├── index.ts         # Database connection
    └── schema.ts        # Drizzle schema
```

### 3.2 Procedure Types

```typescript
// src/server/api/trpc.ts

// Public - Aucune authentification requise
export const publicProcedure = t.procedure;

// Protected - Utilisateur authentifié requis
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: { ...ctx, session: ctx.session },
  });
});

// Vendor - Rôle vendor ou admin requis
export const vendorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'vendor' && ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

// Admin - Rôle admin uniquement
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

### 3.3 Router Details

#### productRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `list` | Query | Liste produits avec filtres (category, search, featured) |
| `byId` | Query | Produit par ID avec vendeur et avis |
| `bySlug` | Query | Produit par slug |
| `create` | Mutation | Créer produit (vendor) |
| `update` | Mutation | Modifier produit (vendor) |
| `delete` | Mutation | Supprimer produit (vendor) |
| `myProducts` | Query | Produits du vendeur connecté |

#### vendorRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `byId` | Query | Profil vendeur public |
| `list` | Query | Liste vendeurs approuvés |
| `register` | Mutation | Candidature vendeur |
| `me` | Query | Profil vendeur connecté |
| `update` | Mutation | Modifier profil |
| `pendingApplications` | Query | Candidatures en attente (admin) |
| `approve` | Mutation | Approuver vendeur (admin) |
| `reject` | Mutation | Rejeter vendeur (admin) |
| `updateCommission` | Mutation | Modifier commission (admin) |

#### orderRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `myOrders` | Query | Commandes du client |
| `byId` | Query | Détail commande |
| `vendorOrders` | Query | Commandes reçues (vendor) |
| `updateStatus` | Mutation | Mettre à jour statut (vendor) |
| `adminList` | Query | Toutes les commandes (admin) |
| `adminCancel` | Mutation | Annuler commande (admin) |

#### userRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `me` | Query | Profil utilisateur |
| `update` | Mutation | Modifier profil |
| `adminList` | Query | Liste utilisateurs (admin) |
| `adminUpdateRole` | Mutation | Changer rôle (admin) |

#### paymentRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `createConnectAccount` | Mutation | Créer compte Stripe Connect |
| `getConnectStatus` | Query | Statut onboarding Stripe |
| `getDashboardLink` | Query | Lien dashboard Stripe |
| `createCheckoutSession` | Mutation | Créer session checkout |
| `verifyCheckout` | Mutation | Vérifier paiement et créer commande |

#### adminRouter
| Procedure | Type | Description |
|-----------|------|-------------|
| `getStats` | Query | Statistiques globales |
| `getRecentOrders` | Query | Dernières commandes |
| `getRevenueChart` | Query | Revenus par jour |
| `getTopVendors` | Query | Top vendeurs |
| `getTopProducts` | Query | Top produits |
| `toggleProductFeatured` | Mutation | Toggle featured |

---

## 4. Authentication Flow

### 4.1 Better-Auth Configuration

```typescript
// src/server/auth/config.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // Update every 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                // 5 min cache
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Toggle for production
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
```

### 4.2 Session Management

```typescript
// Getting session in tRPC context
const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session,
  };
};
```

### 4.3 Client-Side Auth

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

---

## 5. Payment Integration (Stripe)

### 5.1 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Customer  │     │  Platform   │     │   Vendor    │
│   (Client)  │     │ (NeuroBlend)│     │  (Seller)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. Add to cart   │                   │
       │──────────────────►│                   │
       │                   │                   │
       │  2. Checkout      │                   │
       │──────────────────►│                   │
       │                   │                   │
       │                   │  3. Create Stripe Session
       │                   │  (with application_fee)
       │                   │──────────────────►│
       │                   │                   │
       │  4. Redirect to   │                   │
       │     Stripe        │                   │
       │◄──────────────────│                   │
       │                   │                   │
       │  5. Payment       │                   │
       │  (Stripe hosted)  │                   │
       │                   │                   │
       │  6. Success       │                   │
       │──────────────────►│                   │
       │                   │                   │
       │                   │  7. Split Payment │
       │                   │  - 85% → Vendor   │
       │                   │  - 15% → Platform │
       │                   │                   │
       │  8. Order Created │                   │
       │◄──────────────────│                   │
```

### 5.2 Stripe Connect Flow

```typescript
// 1. Vendor creates Connect account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'FR',
  email: vendor.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
});

// 2. Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${APP_URL}/vendor/payouts?refresh=true`,
  return_url: `${APP_URL}/vendor/payouts?success=true`,
  type: 'account_onboarding',
});

// 3. Create checkout with split
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: items,
  mode: 'payment',
  success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${APP_URL}/cart`,
  payment_intent_data: {
    application_fee_amount: Math.round(total * commissionRate * 100),
    transfer_data: {
      destination: vendor.stripeAccountId,
    },
  },
});
```

### 5.3 Webhook Handling (TODO)

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Create order, send confirmation email
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
    case 'account.updated':
      // Update vendor stripe status
      break;
  }

  return new Response('OK');
}
```

---

## 6. Error Handling

### 6.1 tRPC Error Codes

| Code | HTTP | Usage |
|------|------|-------|
| `BAD_REQUEST` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate entry |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### 6.2 Error Pattern

```typescript
// In router
if (!product) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Produit non trouvé',
  });
}

// Validation errors (automatic with Zod)
const createProductInput = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  price: z.number().positive('Le prix doit être positif'),
});
```

---

## 7. Data Validation

### 7.1 Zod Schemas

```typescript
// Input validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().positive(),
  category: z.enum(['HPI', 'ADHD', 'hypersensitive']),
  stock: z.number().int().min(0),
  capsuleCount: z.number().int().default(10),
  intensityLevel: z.number().int().min(1).max(10).optional(),
  roastLevel: z.enum(['light', 'medium', 'dark']).optional(),
  flavorNotes: z.array(z.string()).optional(),
  origin: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['processing', 'shipped', 'delivered']),
  trackingNumber: z.string().optional(),
});
```

### 7.2 Usage in Procedures

```typescript
export const productRouter = createTRPCRouter({
  create: vendorProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // input is fully typed and validated
      const slug = slugify(input.name);

      const [product] = await ctx.db
        .insert(products)
        .values({
          ...input,
          slug,
          vendorId: ctx.vendor.id,
        })
        .returning();

      return product;
    }),
});
```

---

## 8. Database Queries

### 8.1 Drizzle ORM Patterns

```typescript
// Simple query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Query with relations
const product = await db.query.products.findFirst({
  where: eq(products.slug, slug),
  with: {
    vendor: true,
    reviews: {
      with: { user: true },
      orderBy: [desc(reviews.createdAt)],
      limit: 10,
    },
  },
});

// Complex filter
const products = await db.query.products.findMany({
  where: and(
    eq(products.active, true),
    category ? eq(products.category, category) : undefined,
    search ? ilike(products.name, `%${search}%`) : undefined,
  ),
  orderBy: [desc(products.createdAt)],
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

// Insert with returning
const [order] = await db
  .insert(orders)
  .values({
    orderNumber: generateOrderNumber(),
    userId: ctx.session.user.id,
    vendorId,
    subtotal,
    commission,
    total,
    status: 'paid',
  })
  .returning();

// Update
await db
  .update(orders)
  .set({ status: 'shipped', trackingNumber })
  .where(eq(orders.id, orderId));

// Transaction
await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values(orderData).returning();

  await tx.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    }))
  );

  // Update stock
  for (const item of items) {
    await tx
      .update(products)
      .set({ stock: sql`${products.stock} - ${item.quantity}` })
      .where(eq(products.id, item.productId));
  }

  return order;
});
```

---

## 9. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Auth
BETTER_AUTH_SECRET=your-32-char-secret-minimum

# App
NEXT_PUBLIC_APP_URL=https://neuro-blend-marketplace.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
RESEND_API_KEY=re_...

# Files (optional)
UPLOADTHING_TOKEN=...

# AI (optional)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 10. Security Considerations

### 10.1 Authentication
- Sessions stockées côté serveur (pas JWT)
- Cookies HTTP-only, Secure, SameSite
- Expiration 7 jours avec refresh automatique

### 10.2 Authorization
- Role-based access control (RBAC)
- Vérification dans chaque procédure
- Isolation des données par utilisateur/vendeur

### 10.3 Input Validation
- Validation Zod sur toutes les entrées
- Sanitization automatique
- Protection SQL injection (ORM)

### 10.4 Payment Security
- Stripe gère PCI compliance
- Pas de stockage de cartes
- Webhooks vérifiés par signature

---

*Document créé le 4 février 2026*

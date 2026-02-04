# NeuroBlend - File Structure Document

## 1. Project Root

```
neuroblend-marketplace/
│
├── 📁 docs/                          # Project documentation
│   ├── 01-PROJECT-REQUIREMENTS.md
│   ├── 02-FRONTEND-GUIDELINES.md
│   ├── 03-BACKEND-STRUCTURE.md
│   ├── 04-APP-FLOW.md
│   ├── 05-TECH-STACK.md
│   ├── 06-SYSTEM-PROMPT.md
│   └── 07-FILE-STRUCTURE.md          # This file
│
├── 📁 drizzle/                        # Database migrations (generated)
│
├── 📁 emails/                         # Email templates (React Email)
│   └── (à créer)
│
├── 📁 public/                         # Static assets
│   ├── favicon.ico
│   └── images/
│
├── 📁 src/                            # Source code (see below)
│
├── 📁 tests/                          # Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── 📄 .env.example                    # Environment variables template
├── 📄 .env.local                      # Local environment (git ignored)
├── 📄 .gitignore
├── 📄 drizzle.config.ts               # Drizzle ORM configuration
├── 📄 eslint.config.mjs               # ESLint configuration
├── 📄 next.config.ts                  # Next.js configuration
├── 📄 package.json
├── 📄 pnpm-lock.yaml
├── 📄 postcss.config.mjs              # PostCSS (Tailwind)
├── 📄 tailwind.config.ts              # Tailwind CSS configuration
├── 📄 TODO.md                         # Project progress tracker
├── 📄 tsconfig.json                   # TypeScript configuration
└── 📄 vercel.json                     # Vercel deployment config
```

---

## 2. Source Directory (`src/`)

```
src/
│
├── 📁 app/                            # Next.js App Router
│   │
│   ├── 📁 (auth)/                     # Auth route group (shared layout)
│   │   ├── 📁 login/
│   │   │   └── page.tsx               # /login
│   │   ├── 📁 register/
│   │   │   └── page.tsx               # /register
│   │   └── layout.tsx                 # Auth layout (centered card)
│   │
│   ├── 📁 (marketplace)/              # Public marketplace routes
│   │   ├── 📁 cart/
│   │   │   └── page.tsx               # /cart
│   │   ├── 📁 checkout/
│   │   │   ├── page.tsx               # /checkout
│   │   │   └── 📁 success/
│   │   │       └── page.tsx           # /checkout/success
│   │   ├── 📁 products/
│   │   │   ├── page.tsx               # /products (listing)
│   │   │   └── 📁 [slug]/
│   │   │       └── page.tsx           # /products/[slug] (detail)
│   │   └── layout.tsx                 # Marketplace layout
│   │
│   ├── 📁 account/                    # Customer account (protected)
│   │   ├── page.tsx                   # /account (dashboard)
│   │   ├── 📁 orders/
│   │   │   ├── page.tsx               # /account/orders
│   │   │   └── 📁 [id]/
│   │   │       └── page.tsx           # /account/orders/[id]
│   │   ├── 📁 settings/
│   │   │   └── page.tsx               # /account/settings
│   │   └── layout.tsx                 # Account sidebar layout
│   │
│   ├── 📁 vendor/                     # Vendor dashboard (protected)
│   │   ├── 📁 register/
│   │   │   └── page.tsx               # /vendor/register
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx               # /vendor/dashboard
│   │   ├── 📁 products/
│   │   │   ├── page.tsx               # /vendor/products
│   │   │   ├── 📁 new/
│   │   │   │   └── page.tsx           # /vendor/products/new
│   │   │   └── 📁 [id]/
│   │   │       └── 📁 edit/
│   │   │           └── page.tsx       # /vendor/products/[id]/edit
│   │   ├── 📁 orders/
│   │   │   └── page.tsx               # /vendor/orders
│   │   ├── 📁 payouts/
│   │   │   └── page.tsx               # /vendor/payouts (Stripe)
│   │   └── layout.tsx                 # Vendor sidebar layout
│   │
│   ├── 📁 admin/                      # Admin dashboard (protected)
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx               # /admin/dashboard
│   │   ├── 📁 users/
│   │   │   └── page.tsx               # /admin/users
│   │   ├── 📁 vendors/
│   │   │   └── page.tsx               # /admin/vendors
│   │   ├── 📁 orders/
│   │   │   └── page.tsx               # /admin/orders
│   │   ├── 📁 products/
│   │   │   └── page.tsx               # /admin/products
│   │   └── layout.tsx                 # Admin sidebar layout
│   │
│   ├── 📁 api/                        # API Routes
│   │   ├── 📁 auth/
│   │   │   └── 📁 [...all]/
│   │   │       └── route.ts           # Better-auth handler
│   │   ├── 📁 trpc/
│   │   │   └── 📁 [trpc]/
│   │   │       └── route.ts           # tRPC handler
│   │   └── 📁 webhooks/
│   │       └── 📁 stripe/
│   │           └── route.ts           # Stripe webhooks
│   │
│   ├── 📄 globals.css                 # Global styles + Tailwind
│   ├── 📄 layout.tsx                  # Root layout
│   ├── 📄 page.tsx                    # Homepage (/)
│   ├── 📄 not-found.tsx               # 404 page
│   └── 📄 error.tsx                   # Error boundary
│
├── 📁 components/                     # React components
│   │
│   ├── 📁 ui/                         # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── form.tsx
│   │   ├── checkbox.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── textarea.tsx
│   │   ├── sonner.tsx
│   │   └── skeleton.tsx
│   │
│   ├── 📁 layout/                     # Layout components
│   │   ├── header.tsx                 # Site header
│   │   ├── footer.tsx                 # Site footer
│   │   ├── mobile-nav.tsx             # Mobile navigation
│   │   ├── sidebar.tsx                # Dashboard sidebar
│   │   └── page-header.tsx            # Page title component
│   │
│   ├── 📁 forms/                      # Form components
│   │   ├── auth-form.tsx              # Login/Register form
│   │   ├── product-form.tsx           # Create/Edit product
│   │   ├── checkout-form.tsx          # Checkout shipping
│   │   ├── vendor-register-form.tsx   # Vendor application
│   │   └── profile-form.tsx           # User profile edit
│   │
│   ├── 📁 features/                   # Feature components
│   │   ├── product-card.tsx           # Product grid item
│   │   ├── product-grid.tsx           # Products grid
│   │   ├── product-filters.tsx        # Category/search filters
│   │   ├── product-gallery.tsx        # Product images carousel
│   │   ├── cart-drawer.tsx            # Side cart panel
│   │   ├── cart-item.tsx              # Cart item row
│   │   ├── order-card.tsx             # Order summary card
│   │   ├── order-status-badge.tsx     # Status badge component
│   │   ├── vendor-card.tsx            # Vendor profile card
│   │   ├── review-card.tsx            # Customer review
│   │   ├── review-form.tsx            # Leave a review
│   │   ├── stats-card.tsx             # Dashboard stat card
│   │   └── revenue-chart.tsx          # Admin revenue chart
│   │
│   └── 📁 shared/                     # Shared/utility components
│       ├── loading-spinner.tsx        # Loading indicator
│       ├── error-message.tsx          # Error display
│       ├── empty-state.tsx            # Empty list state
│       ├── confirm-dialog.tsx         # Confirmation modal
│       ├── data-table.tsx             # Generic data table
│       └── pagination.tsx             # Pagination controls
│
├── 📁 hooks/                          # Custom React hooks
│   ├── use-auth.ts                    # Auth state hook
│   ├── use-cart.ts                    # Cart operations hook
│   └── use-media-query.ts             # Responsive hook
│
├── 📁 lib/                            # Utilities
│   ├── auth-client.ts                 # Better-auth client
│   ├── constants.ts                   # App constants
│   └── utils.ts                       # Helper functions
│
├── 📁 server/                         # Server-side code
│   │
│   ├── 📁 api/                        # tRPC API
│   │   ├── trpc.ts                    # tRPC setup, context, procedures
│   │   ├── root.ts                    # Root router
│   │   └── 📁 routers/                # Individual routers
│   │       ├── product.ts
│   │       ├── vendor.ts
│   │       ├── order.ts
│   │       ├── user.ts
│   │       ├── payment.ts
│   │       └── admin.ts
│   │
│   ├── 📁 auth/                       # Authentication
│   │   └── config.ts                  # Better-auth config
│   │
│   ├── 📁 db/                         # Database
│   │   ├── index.ts                   # DB connection
│   │   └── schema.ts                  # Drizzle schema
│   │
│   └── 📁 services/                   # Business logic
│       ├── email.ts                   # Email sending
│       ├── stripe.ts                  # Stripe operations
│       └── upload.ts                  # File uploads
│
├── 📁 stores/                         # Zustand stores
│   ├── cart-store.ts                  # Shopping cart
│   └── ui-store.ts                    # UI state
│
├── 📁 trpc/                           # tRPC client
│   ├── client.tsx                     # React provider
│   ├── server.ts                      # Server caller
│   └── query-client.ts                # React Query config
│
└── 📁 types/                          # TypeScript types
    └── index.ts                       # Exported types
```

---

## 3. File Naming Conventions

### Components

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `src/app/products/page.tsx` |
| Layout | `layout.tsx` | `src/app/vendor/layout.tsx` |
| Component | `kebab-case.tsx` | `product-card.tsx` |
| UI Primitive | `kebab-case.tsx` | `button.tsx` |

### Server Code

| Type | Pattern | Example |
|------|---------|---------|
| Router | `name.ts` | `product.ts` |
| Config | `config.ts` | `auth/config.ts` |
| Schema | `schema.ts` | `db/schema.ts` |
| Service | `name.ts` | `services/email.ts` |

### Utilities

| Type | Pattern | Example |
|------|---------|---------|
| Constants | `constants.ts` | `lib/constants.ts` |
| Utils | `utils.ts` | `lib/utils.ts` |
| Types | `index.ts` | `types/index.ts` |

### Stores

| Type | Pattern | Example |
|------|---------|---------|
| Store | `name-store.ts` | `cart-store.ts` |

### Hooks

| Type | Pattern | Example |
|------|---------|---------|
| Hook | `use-name.ts` | `use-auth.ts` |

---

## 4. Import Aliases

Configured in `tsconfig.json`:

```typescript
// ✅ Use alias
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

// ❌ Avoid relative imports for cross-directory
import { Button } from '../../../components/ui/button';
```

---

## 5. Route Groups

Next.js route groups `(folder)` for organization without affecting URL:

| Group | URL | Purpose |
|-------|-----|---------|
| `(auth)` | `/login`, `/register` | Auth pages with centered layout |
| `(marketplace)` | `/products`, `/cart` | Public shopping pages |
| `account` | `/account/*` | Customer dashboard |
| `vendor` | `/vendor/*` | Vendor dashboard |
| `admin` | `/admin/*` | Admin dashboard |

---

## 6. Protected Routes

Routes requiring authentication:

```
/account/*          → Requires: logged in
/vendor/*           → Requires: logged in + vendor role
/admin/*            → Requires: logged in + admin role
/checkout           → Requires: logged in
```

Implemented via:
1. Server Components: Check session in page
2. Middleware (optional): `src/middleware.ts`

---

## 7. API Endpoints

| Endpoint | Handler | Purpose |
|----------|---------|---------|
| `/api/auth/*` | Better-Auth | Authentication |
| `/api/trpc/*` | tRPC | All data operations |
| `/api/webhooks/stripe` | Route Handler | Stripe events |

---

## 8. Static Assets

```
public/
├── favicon.ico
├── og-image.png              # Open Graph image
├── images/
│   ├── placeholder.jpg       # Product placeholder
│   ├── hero-bg.jpg          # Hero background
│   └── categories/
│       ├── hpi.jpg
│       ├── adhd.jpg
│       └── hypersensitive.jpg
└── fonts/                    # Self-hosted fonts (if any)
```

---

## 9. Environment Files

| File | Purpose | Git |
|------|---------|-----|
| `.env.example` | Template | ✅ Tracked |
| `.env.local` | Local development | ❌ Ignored |
| `.env.production` | Production (Vercel) | ❌ Ignored |

---

## 10. Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS |
| `postcss.config.mjs` | PostCSS plugins |
| `tsconfig.json` | TypeScript |
| `eslint.config.mjs` | ESLint |
| `drizzle.config.ts` | Drizzle ORM |
| `vercel.json` | Vercel deployment |

---

*Document créé le 4 février 2026*

# NeuroBlend - Tech Stack Document

## 1. Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 16  │  React 19  │  TypeScript 5  │  Tailwind CSS 4   │
│  shadcn/ui   │  Zustand   │  React Query   │  React Hook Form  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  tRPC 11     │  Better-Auth  │  Drizzle ORM  │  Zod            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────┤
│  Vercel      │  Neon (PostgreSQL)  │  Stripe  │  Resend        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Framework

### 2.1 Next.js 16

**Version**: `16.1.6`

**Features Used**:
- App Router (Server Components by default)
- Server Actions
- Route Handlers (API routes)
- Image Optimization
- Font Optimization
- Metadata API
- Static Generation + ISR

**Configuration** (`next.config.ts`):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack enabled by default in Next 16
  // Add custom config here
};

export default nextConfig;
```

### 2.2 React 19

**Version**: `19.2.3`

**Features Used**:
- Server Components (RSC)
- Client Components (`'use client'`)
- Hooks (useState, useEffect, useCallback, useMemo)
- Suspense & Streaming
- Error Boundaries

### 2.3 TypeScript 5

**Version**: `5`

**Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 3. Styling

### 3.1 Tailwind CSS 4

**Version**: `4.0.0`

**Setup**: Using `@tailwindcss/postcss` plugin

**Configuration** (`tailwind.config.ts`):
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom colors defined in CSS variables
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3.2 CSS Variables (Design Tokens)

```css
/* globals.css */
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### 3.3 Class Variance Authority (CVA)

**Version**: `0.7.1`

**Usage**: Creating component variants

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## 4. UI Components

### 4.1 shadcn/ui

**Not a dependency** - Components copied into project

**Location**: `src/components/ui/`

**Installed Components**:
| Component | File | Description |
|-----------|------|-------------|
| Button | `button.tsx` | Primary action component |
| Card | `card.tsx` | Container component |
| Input | `input.tsx` | Text input |
| Label | `label.tsx` | Form label |
| Form | `form.tsx` | React Hook Form wrapper |
| Checkbox | `checkbox.tsx` | Checkbox input |
| Select | `select.tsx` | Dropdown select |
| Dialog | `dialog.tsx` | Modal dialog |
| Sheet | `sheet.tsx` | Side drawer |
| Dropdown Menu | `dropdown-menu.tsx` | Context menu |
| Avatar | `avatar.tsx` | User avatar |
| Badge | `badge.tsx` | Status badge |
| Separator | `separator.tsx` | Divider |
| Textarea | `textarea.tsx` | Multi-line input |
| Sonner | `sonner.tsx` | Toast notifications |
| Skeleton | `skeleton.tsx` | Loading placeholder |

### 4.2 Radix UI Primitives

**Dependencies**:
```json
{
  "@radix-ui/react-avatar": "^1.4.3",
  "@radix-ui/react-checkbox": "^1.4.2",
  "@radix-ui/react-dialog": "^1.4.2",
  "@radix-ui/react-dropdown-menu": "^2.4.3",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-select": "^2.4.3",
  "@radix-ui/react-separator": "^1.4.1",
  "@radix-ui/react-slot": "^1.2.1"
}
```

### 4.3 Icons

**Package**: `lucide-react@0.563.0`

**Usage**:
```tsx
import { ShoppingCart, User, Menu, X } from 'lucide-react';

<ShoppingCart className="h-5 w-5" />
```

---

## 5. State Management

### 5.1 Zustand

**Version**: `5.0.11`

**Stores**:
| Store | File | Purpose |
|-------|------|---------|
| Cart | `cart-store.ts` | Shopping cart state |
| UI | `ui-store.ts` | UI state (modals, menus) |

**Features**:
- Persist middleware (localStorage)
- Devtools integration
- TypeScript support

**Example**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  // ...
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),
    }),
    { name: 'neuroblend-cart' }
  )
);
```

### 5.2 React Query (via tRPC)

**Version**: `@tanstack/react-query@5.90.20`

**Features**:
- Automatic caching
- Background refetching
- Optimistic updates
- Infinite queries

---

## 6. Data Fetching

### 6.1 tRPC

**Version**: `11.9.0`

**Packages**:
```json
{
  "@trpc/client": "11.9.0",
  "@trpc/react-query": "11.9.0",
  "@trpc/server": "11.9.0"
}
```

**Setup Files**:
| File | Purpose |
|------|---------|
| `src/server/api/trpc.ts` | Context, procedures |
| `src/server/api/root.ts` | Root router |
| `src/trpc/client.tsx` | React provider |
| `src/trpc/server.ts` | Server-side caller |

### 6.2 SuperJSON

**Version**: `2.2.6`

**Purpose**: Serialize complex types (Date, Decimal, Map, Set)

```typescript
import superjson from 'superjson';

// In tRPC client
httpBatchLink({
  url: '/api/trpc',
  transformer: superjson,
})
```

---

## 7. Forms & Validation

### 7.1 React Hook Form

**Version**: `7.71.1`

**Features**:
- Uncontrolled forms (performance)
- Built-in validation
- TypeScript support
- Integration with Zod

### 7.2 Zod

**Version**: `4.3.6`

**Usage**:
- Form validation
- API input validation
- Type inference

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;
```

### 7.3 @hookform/resolvers

**Version**: `5.2.2`

**Purpose**: Bridge between RHF and Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
});
```

---

## 8. Authentication

### 8.1 Better-Auth

**Version**: `1.4.18`

**Features**:
- Email/password authentication
- Session management (server-side)
- Role-based access control
- Drizzle adapter

**Configuration**:
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 24 hours
  },
  emailAndPassword: { enabled: true },
});
```

---

## 9. Database

### 9.1 Drizzle ORM

**Version**: `0.45.1`

**Features**:
- Type-safe queries
- Relations support
- Migrations
- Schema generation

**Packages**:
```json
{
  "drizzle-orm": "0.45.1",
  "drizzle-kit": "0.31.8"
}
```

### 9.2 Neon Serverless

**Version**: `@neondatabase/serverless@1.0.2`

**Features**:
- Serverless PostgreSQL
- WebSocket connection
- Auto-scaling
- Branching (dev/prod)

**Connection**:
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

## 10. Payments

### 10.1 Stripe

**Version**: `20.3.0`

**Features Used**:
- Checkout Sessions
- Connect (Express accounts)
- Webhooks
- Payment Intents

**Lazy Loading** (for build without API key):
```typescript
let stripeInstance: Stripe | null = null;

function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}
```

---

## 11. File Upload

### 11.1 UploadThing

**Version**: `7.7.4`

**Packages**:
```json
{
  "uploadthing": "7.7.4",
  "@uploadthing/react": "7.3.3"
}
```

**Status**: Installed, not yet configured

---

## 12. Email

### 12.1 Resend

**Version**: `6.9.1`

**Status**: Installed, not yet configured

**Usage**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'NeuroBlend <noreply@neuroblend.com>',
  to: customer.email,
  subject: 'Order Confirmation',
  react: OrderConfirmationEmail({ order }),
});
```

---

## 13. AI (Future)

### 13.1 Vercel AI SDK

**Version**: `ai@6.0.69`

**Package**: `@ai-sdk/anthropic@3.0.36`

**Status**: Installed, not yet configured

**Use Cases**:
- Product recommendations
- Customer support chatbot
- Search enhancement

---

## 14. Development Tools

### 14.1 ESLint

**Version**: `9`

**Config**: `eslint.config.mjs` (Flat config)

### 14.2 Vitest

**Version**: `4.0.18`

**Packages**:
```json
{
  "vitest": "4.0.18",
  "@testing-library/react": "16.3.2",
  "@testing-library/dom": "10.4.1"
}
```

### 14.3 Package Manager

**pnpm**: Configured with workspace

---

## 15. Deployment

### 15.1 Vercel

**Features**:
- Automatic deployments from Git
- Preview deployments
- Edge Functions
- Analytics
- Image optimization CDN

**Configuration** (`vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

---

## 16. Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth session encryption key |
| `NEXT_PUBLIC_APP_URL` | Application URL |

### Optional (for features)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `RESEND_API_KEY` | Email service |
| `UPLOADTHING_TOKEN` | File uploads |
| `ANTHROPIC_API_KEY` | AI features |

---

## 17. Version Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Framework |
| React | 19.2.3 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 4.0.0 | Styling |
| tRPC | 11.9.0 | API Layer |
| Drizzle ORM | 0.45.1 | Database ORM |
| Better-Auth | 1.4.18 | Authentication |
| Zustand | 5.0.11 | State Management |
| React Query | 5.90.20 | Data Fetching |
| Stripe | 20.3.0 | Payments |
| Zod | 4.3.6 | Validation |
| pnpm | 10.x | Package Manager |

---

*Document créé le 4 février 2026*

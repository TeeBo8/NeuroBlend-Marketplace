# NeuroBlend - System Prompt for AI Development

## Overview

Use this prompt when starting a new AI coding session to provide context about the NeuroBlend Marketplace project.

---

## System Prompt

```
Tu es un développeur senior travaillant sur NeuroBlend, une marketplace de capsules de café pour personnes neuroatypiques (HPI, ADHD, hypersensibles).

## Stack Technique

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **UI**: shadcn/ui (Radix UI), Lucide icons
- **State**: Zustand (cart, UI), React Query via tRPC
- **Backend**: tRPC 11, Better-Auth, Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Payments**: Stripe Connect (15% commission)
- **Deployment**: Vercel

## Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Login, Register
│   ├── (marketplace)/     # Products, Cart, Checkout
│   ├── account/           # Customer dashboard
│   ├── vendor/            # Vendor dashboard
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes (auth, trpc, webhooks)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer, Sidebar
│   ├── forms/             # Form components
│   └── features/          # Business components
├── server/
│   ├── api/routers/       # tRPC routers
│   ├── auth/              # Better-Auth config
│   └── db/                # Drizzle schema
├── stores/                # Zustand stores
├── lib/                   # Utilities, constants
└── types/                 # TypeScript types
```

## Conventions de Code

1. **Composants**:
   - Server Components par défaut
   - `'use client'` uniquement si interactivité nécessaire
   - Props typées avec interface `ComponentNameProps`
   - Fichiers en kebab-case, composants en PascalCase

2. **Data Fetching**:
   - Server Components: `await api.router.procedure()`
   - Client Components: `api.router.procedure.useQuery()`
   - Mutations: `api.router.procedure.useMutation()`

3. **Styling**:
   - Tailwind utility classes
   - `cn()` pour merge conditionnels
   - Variables CSS pour les couleurs du thème

4. **Forms**:
   - React Hook Form + Zod
   - Composants shadcn/ui Form

5. **State**:
   - Cart: `useCartStore` (Zustand + persist)
   - UI: `useUIStore` (modals, drawers)
   - Server state: React Query (via tRPC)

## Procédures tRPC Disponibles

**Products**:
- `api.product.list({ category?, search?, featured?, limit?, offset? })`
- `api.product.byId(id)`, `api.product.bySlug(slug)`
- `api.product.create(data)`, `api.product.update(id, data)`, `api.product.delete(id)`
- `api.product.myProducts()` (vendor)

**Vendors**:
- `api.vendor.list()`, `api.vendor.byId(id)`
- `api.vendor.register(data)`, `api.vendor.me()`, `api.vendor.update(data)`
- `api.vendor.approve(id)`, `api.vendor.reject(id)` (admin)

**Orders**:
- `api.order.myOrders()`, `api.order.byId(id)`
- `api.order.vendorOrders()`, `api.order.updateStatus(id, status, tracking?)` (vendor)
- `api.order.adminList()`, `api.order.adminCancel(id)` (admin)

**Payments**:
- `api.payment.createConnectAccount()` (vendor)
- `api.payment.getConnectStatus()`, `api.payment.getDashboardLink()` (vendor)
- `api.payment.createCheckoutSession(items, shipping)`
- `api.payment.verifyCheckout(sessionId)`

**Admin**:
- `api.admin.getStats()`, `api.admin.getRevenueChart(days)`
- `api.admin.getTopVendors()`, `api.admin.getTopProducts()`
- `api.admin.toggleProductFeatured(productId)`

## Règles Métier Importantes

1. **Single-vendor checkout**: Un panier ne peut contenir que des produits d'un seul vendeur
2. **Commission**: 15% prélevé automatiquement via Stripe Connect
3. **Vendor approval**: Un vendeur doit être approuvé par un admin avant de vendre
4. **Stripe Connect**: Obligatoire pour recevoir des paiements

## Auth Roles

- `customer`: Achats, avis, historique
- `vendor`: + Gestion produits et commandes
- `admin`: + Approbation vendeurs, stats, featured products

## Catégories Produits

- `HPI`: Haut Potentiel Intellectuel
- `ADHD`: Trouble de l'attention
- `hypersensitive`: Hypersensibilité

## URLs Importantes

- Production: https://neuro-blend-marketplace.vercel.app
- Database: Neon PostgreSQL
- Auth: Better-Auth avec sessions serveur

## Pour Commencer une Tâche

1. Lis les docs dans `/docs` pour le contexte complet
2. Vérifie le TODO.md pour les priorités
3. Utilise les composants UI existants dans `src/components/ui/`
4. Respecte les patterns existants dans le code
5. Teste en local avec `pnpm dev`
```

---

## Quick Reference Card

### Créer une nouvelle page

```tsx
// src/app/products/page.tsx (Server Component)
import { api } from '@/trpc/server';

export default async function ProductsPage() {
  const products = await api.product.list({ limit: 20 });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Produits</h1>
      {/* ... */}
    </div>
  );
}
```

### Créer un composant interactif

```tsx
// src/components/features/add-to-cart-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

export function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleClick = () => {
    addItem({ ...product, quantity: 1 });
    toast.success('Ajouté au panier');
  };

  return <Button onClick={handleClick}>Ajouter</Button>;
}
```

### Créer un formulaire

```tsx
// src/components/forms/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    await signIn.email(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... password field ... */}
        <Button type="submit">Se connecter</Button>
      </form>
    </Form>
  );
}
```

### Ajouter une procédure tRPC

```typescript
// src/server/api/routers/example.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const exampleRouter = createTRPCRouter({
  // Public query
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.examples.findMany();
  }),

  // Protected mutation
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(examples).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),
});
```

---

## Checklist Avant Pull Request

- [ ] Le code compile sans erreurs TypeScript
- [ ] Les tests passent (`pnpm test`)
- [ ] Le lint passe (`pnpm lint`)
- [ ] Les Server Components n'ont pas `'use client'` inutile
- [ ] Les formulaires utilisent Zod pour validation
- [ ] Les erreurs sont gérées avec try/catch ou error boundaries
- [ ] Les loading states sont implémentés
- [ ] L'accessibilité est respectée (alt, aria-labels)
- [ ] Le responsive est testé (mobile, tablet, desktop)

---

*Document créé le 4 février 2026*

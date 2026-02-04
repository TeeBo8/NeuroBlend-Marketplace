# NeuroBlend - Front-end Guidelines

## 1. Stack Technique

### 1.1 Framework & Runtime
- **Next.js 16** - App Router (RSC by default)
- **React 19** - Server Components + Client Components
- **TypeScript 5** - Strict mode activé

### 1.2 Styling
- **Tailwind CSS 4** - Utility-first CSS
- **CSS Variables** - Pour les couleurs/thèmes
- **class-variance-authority** - Variants de composants

### 1.3 UI Components
- **shadcn/ui** - Composants pré-construits
- **Radix UI** - Primitives accessibles
- **Lucide React** - Icônes

### 1.4 State Management
- **Zustand** - État global client
- **React Query** - Cache serveur (via tRPC)
- **React Hook Form** - Formulaires

---

## 2. Design System

### 2.1 Couleurs

```css
/* Couleurs principales - définies dans src/lib/constants.ts */
:root {
  /* Primary - Purple */
  --primary: #7c3aed;        /* purple-600 */
  --primary-foreground: #ffffff;

  /* Secondary - Gray */
  --secondary: #f1f5f9;      /* slate-100 */
  --secondary-foreground: #1e293b;

  /* Accent - Teal */
  --accent: #14b8a6;         /* teal-500 */

  /* Background */
  --background: #ffffff;
  --foreground: #0f172a;     /* slate-900 */

  /* Muted */
  --muted: #f1f5f9;
  --muted-foreground: #64748b;

  /* Destructive */
  --destructive: #ef4444;    /* red-500 */

  /* Border */
  --border: #e2e8f0;         /* slate-200 */
  --ring: #7c3aed;           /* purple-600 */
}
```

### 2.2 Palette par Catégorie

| Catégorie | Couleur primaire | Usage |
|-----------|-----------------|-------|
| HPI | `purple-600` | Badges, accents |
| ADHD | `blue-600` | Badges, accents |
| Hypersensible | `teal-500` | Badges, accents |

### 2.3 Typography

```tsx
// Font: Inter (Google Fonts)
// Configuré dans src/app/layout.tsx

// Tailles recommandées
<h1 className="text-4xl md:text-6xl font-bold" />     // Héros
<h2 className="text-3xl font-bold" />                  // Titres section
<h3 className="text-xl font-semibold" />               // Sous-titres
<p className="text-base text-gray-600" />              // Corps
<span className="text-sm text-muted-foreground" />     // Labels
```

### 2.4 Spacing

```tsx
// Utiliser les classes Tailwind standard
// Sections: py-12, py-16, py-20
// Container: container mx-auto px-4
// Gap: gap-4, gap-6, gap-8

// Pattern recommandé pour les sections
<section className="py-16 md:py-20">
  <div className="container mx-auto px-4">
    {/* Contenu */}
  </div>
</section>
```

### 2.5 Responsive Breakpoints

```tsx
// Mobile first approach
sm: '640px'   // Téléphones paysage
md: '768px'   // Tablettes
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop

// Exemple
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
```

---

## 3. Architecture des Composants

### 3.1 Structure des Dossiers

```
src/components/
├── ui/                    # shadcn/ui (ne pas modifier)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── layout/               # Composants de mise en page
│   ├── header.tsx
│   ├── footer.tsx
│   ├── mobile-nav.tsx
│   └── sidebar.tsx
├── forms/                # Formulaires réutilisables
│   ├── auth-form.tsx
│   ├── product-form.tsx
│   └── checkout-form.tsx
├── features/             # Composants métier
│   ├── product-card.tsx
│   ├── cart-drawer.tsx
│   └── order-status-badge.tsx
└── shared/               # Composants partagés
    ├── loading-spinner.tsx
    ├── error-message.tsx
    └── empty-state.tsx
```

### 3.2 Convention de Nommage

```tsx
// Fichiers: kebab-case
product-card.tsx
auth-form.tsx

// Composants: PascalCase
export function ProductCard() {}
export function AuthForm() {}

// Props: PascalCase + Props suffix
interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}
```

### 3.3 Pattern de Composant

```tsx
// src/components/features/product-card.tsx
'use client'; // Seulement si nécessaire (interactivité)

import { type Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.featured && (
            <Badge className="absolute top-2 right-2">Featured</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.shortDescription}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="font-bold">{formatPrice(product.price)}</span>
        <Button size="sm" onClick={() => onAddToCart?.(product.id)}>
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 4. Server vs Client Components

### 4.1 Règle Générale

```tsx
// SERVER COMPONENT (défaut) - Pas de directive
// Utiliser pour:
// - Fetch de données
// - Accès direct à la DB
// - Composants sans interactivité
// - SEO critique

export default async function ProductPage({ params }) {
  const product = await api.product.bySlug(params.slug);
  return <ProductDetail product={product} />;
}

// CLIENT COMPONENT - Ajouter 'use client'
// Utiliser pour:
// - Événements (onClick, onChange)
// - Hooks React (useState, useEffect)
// - Browser APIs
// - Stores Zustand

'use client';
export function AddToCartButton({ productId }) {
  const addItem = useCartStore((s) => s.addItem);
  return <Button onClick={() => addItem(productId)}>Ajouter</Button>;
}
```

### 4.2 Pattern de Composition

```tsx
// Page (Server Component)
export default async function ProductsPage() {
  const products = await api.product.list();

  return (
    <div>
      <h1>Nos Produits</h1>
      {/* Client component pour les filtres */}
      <ProductFilters />
      {/* Server component pour la liste */}
      <ProductGrid products={products} />
    </div>
  );
}

// Grille (Server Component passant données à Client)
function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        // Client component pour l'interactivité
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 5. Data Fetching

### 5.1 Server Components (Recommandé)

```tsx
// src/app/products/page.tsx
import { api } from '@/trpc/server';

export default async function ProductsPage() {
  // Appel direct côté serveur - pas de useQuery
  const products = await api.product.list({
    limit: 20,
    category: undefined,
  });

  return <ProductList products={products} />;
}
```

### 5.2 Client Components (Interactivité)

```tsx
// src/components/features/product-list.tsx
'use client';

import { api } from '@/trpc/client';

export function ProductList({ initialCategory }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory);

  // useQuery pour données dynamiques
  const { data: products, isLoading } = api.product.list.useQuery({
    category,
    limit: 20,
  });

  if (isLoading) return <ProductListSkeleton />;

  return (
    <>
      <CategoryFilter value={category} onChange={setCategory} />
      <div className="grid grid-cols-3 gap-6">
        {products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
```

### 5.3 Mutations (Actions)

```tsx
'use client';

import { api } from '@/trpc/client';
import { toast } from 'sonner';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleClick = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
      vendorId: product.vendorId,
    });
    toast.success('Produit ajouté au panier');
  };

  return <Button onClick={handleClick}>Ajouter au panier</Button>;
}
```

---

## 6. Formulaires

### 6.1 Stack

- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation
- **@hookform/resolvers** - Bridge RHF + Zod

### 6.2 Pattern Standard

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await signIn.email(data);
      toast.success('Connexion réussie');
    } catch (error) {
      toast.error('Identifiants incorrects');
    }
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
                <Input type="email" placeholder="vous@exemple.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 7. State Management

### 7.1 Zustand Stores

```tsx
// src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  vendorId: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          };
        }
        return {
          items: [...state.items, { ...item, quantity: item.quantity || 1 }],
        };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
      })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'neuroblend-cart',
    }
  )
);
```

### 7.2 Usage dans les Composants

```tsx
'use client';

import { useCartStore } from '@/stores/cart-store';

export function CartIcon() {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <Button variant="ghost" size="icon" className="relative">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
```

---

## 8. Loading & Error States

### 8.1 Loading Skeletons

```tsx
// src/components/shared/product-card-skeleton.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 8.2 Error Boundaries

```tsx
// src/components/shared/error-message.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorMessage({
  title = 'Une erreur est survenue',
  message = 'Veuillez réessayer plus tard.',
  retry,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### 8.3 Empty States

```tsx
// src/components/shared/empty-state.tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
```

---

## 9. Accessibilité

### 9.1 Règles de Base

```tsx
// ✅ Toujours fournir un alt pour les images
<Image src={url} alt="Description de l'image" />

// ✅ Labels pour les inputs
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ✅ Aria labels pour les boutons icon-only
<Button variant="ghost" size="icon" aria-label="Ouvrir le panier">
  <ShoppingCart />
</Button>

// ✅ Focus visible (déjà géré par shadcn/ui)
// ✅ Contraste suffisant (vérifier avec les outils)
// ✅ Navigation clavier (Tab, Enter, Escape)
```

### 9.2 Skip Links

```tsx
// src/app/layout.tsx
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded"
  >
    Aller au contenu principal
  </a>
  <Header />
  <main id="main-content">{children}</main>
  <Footer />
</body>
```

---

## 10. Performance

### 10.1 Images

```tsx
// Toujours utiliser next/image
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
  priority={isAboveFold} // Pour les images visibles immédiatement
/>
```

### 10.2 Code Splitting

```tsx
// Lazy load des composants lourds
import dynamic from 'next/dynamic';

const ProductGallery = dynamic(() => import('./product-gallery'), {
  loading: () => <ProductGallerySkeleton />,
});
```

### 10.3 Prefetching

```tsx
// Next.js prefetch automatiquement les <Link>
<Link href="/products" prefetch={true}>Produits</Link>

// Désactiver si nécessaire
<Link href="/admin" prefetch={false}>Admin</Link>
```

---

## 11. Tests

### 11.1 Structure

```
tests/
├── components/
│   ├── product-card.test.tsx
│   └── cart-drawer.test.tsx
├── hooks/
│   └── use-cart.test.ts
└── utils/
    └── format-price.test.ts
```

### 11.2 Pattern de Test

```tsx
// tests/components/product-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/features/product-card';

const mockProduct = {
  id: '1',
  name: 'Focus Blend',
  slug: 'focus-blend',
  price: '12.99',
  category: 'ADHD',
  imageUrl: '/test.jpg',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Focus Blend')).toBeInTheDocument();
    expect(screen.getByText('12,99 €')).toBeInTheDocument();
    expect(screen.getByText('ADHD')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByText('Ajouter'));

    expect(onAddToCart).toHaveBeenCalledWith('1');
  });
});
```

---

*Document créé le 4 février 2026*

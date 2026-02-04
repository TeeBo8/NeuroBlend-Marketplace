# NeuroBlend Marketplace - Suivi du Projet

## Statut Actuel
- **Build Vercel**: Passé
- **URL**: https://neuro-blend-marketplace.vercel.app
- **Problème actuel**: Erreur 404 NOT_FOUND (probablement car les tables DB n'existent pas encore)

---

## Ce qui a été fait

### 1. Infrastructure & Configuration

- [x] Initialisation projet Next.js 16 avec TypeScript
- [x] Configuration Tailwind CSS 4
- [x] Configuration pnpm avec `onlyBuiltDependencies`
- [x] Fichier `.env.example` créé
- [x] Push sur GitHub: https://github.com/TeeBo8/NeuroBlend-Marketplace.git
- [x] Déploiement Vercel configuré

### 2. Base de données (Drizzle ORM)

- [x] Configuration `drizzle.config.ts`
- [x] Schéma complet créé (`src/server/db/schema.ts`):
  - Table `users` avec rôles (customer, vendor, admin)
  - Table `sessions` (Better-auth)
  - Table `accounts` (Better-auth)
  - Table `verifications` (Better-auth)
  - Table `vendors` (profils vendeurs avec Stripe Connect)
  - Table `products` avec catégories
  - Table `orders` et `orderItems`
  - Table `subscriptions` et `subscriptionItems`
  - Table `reviews`
- [x] Relations Drizzle définies
- [x] Types exportés

### 3. Authentification (Better-auth)

- [x] Configuration Better-auth (`src/server/auth/config.ts`)
- [x] Adapter Drizzle configuré
- [x] Rôles utilisateur (customer, vendor, admin)
- [x] Type `SessionUser` créé pour TypeScript
- [x] Route handler (`src/app/api/auth/[...all]/route.ts`)
- [x] Client auth (`src/lib/auth-client.ts`)

### 4. API tRPC

- [x] Configuration tRPC (`src/server/api/trpc.ts`)
- [x] Procédures: `publicProcedure`, `protectedProcedure`, `vendorProcedure`, `adminProcedure`
- [x] Router principal (`src/server/api/root.ts`)
- [x] Routers créés:
  - `productRouter` - CRUD produits, recherche, filtres
  - `vendorRouter` - Gestion profil vendeur
  - `orderRouter` - Commandes et historique
  - `userRouter` - Profil utilisateur
  - `paymentRouter` - Stripe Connect (lazy loading)
  - `adminRouter` - Administration
- [x] Client tRPC (`src/trpc/client.ts`)
- [x] Server tRPC (`src/trpc/server.ts`)

### 5. Stripe Connect

- [x] Lazy loading pour éviter erreur build sans API key
- [x] `createConnectAccount` - Création compte Express
- [x] `getConnectStatus` - Statut onboarding
- [x] `getDashboardLink` - Lien dashboard Stripe
- [x] `createCheckoutSession` - Checkout avec split payment (15% commission)
- [x] `verifyCheckout` - Vérification et création commande

### 6. State Management (Zustand)

- [x] `cart-store.ts` - Panier avec persistance localStorage
- [x] `ui-store.ts` - État UI (mobile menu, modals)

### 7. UI Components (shadcn/ui)

- [x] Installation et configuration
- [x] Composants installés: button, card, input, label, form, toast, sonner, dropdown-menu, avatar, badge, separator, skeleton, dialog, select, textarea, tabs, table, checkbox, switch
- [x] Utilitaires: `cn()`, constantes, types

### 8. Pages créées

- [x] Homepage (`src/app/page.tsx`) - Hero section basique
- [x] Layout principal (`src/app/layout.tsx`)

---

## Ce qui reste à faire

### Priorité 1 - Critique (pour que l'app fonctionne)

- [x] **Configurer les variables d'environnement Vercel** ✅

- [x] **Créer les tables dans la base de données** ✅
  ```bash
  pnpm drizzle-kit push  # Fait le 4 février 2026
  ```

- [x] **Redéployer sur Vercel** ✅ (fix: ajout vercel.json avec framework: nextjs)

### Priorité 2 - Pages essentielles

- [ ] **Layout & Navigation**:
  - [ ] Header avec navigation
  - [ ] Footer
  - [ ] Mobile menu

- [ ] **Authentification**:
  - [ ] Page `/auth/login`
  - [ ] Page `/auth/register`
  - [ ] Page `/auth/forgot-password`
  - [ ] Composant AuthProvider

- [ ] **Catalogue**:
  - [ ] Page `/products` - Liste produits avec filtres
  - [ ] Page `/products/[id]` - Détail produit
  - [ ] Page `/categories/[category]` - Produits par catégorie

- [ ] **Panier & Checkout**:
  - [ ] Page `/cart` - Panier
  - [ ] Page `/checkout` - Formulaire checkout
  - [ ] Page `/checkout/success` - Confirmation commande

### Priorité 3 - Espace Client

- [ ] Page `/account` - Dashboard client
- [ ] Page `/account/orders` - Historique commandes
- [ ] Page `/account/orders/[id]` - Détail commande
- [ ] Page `/account/settings` - Paramètres compte

### Priorité 4 - Espace Vendeur

- [ ] Page `/vendor/register` - Inscription vendeur
- [ ] Page `/vendor/dashboard` - Dashboard vendeur
- [ ] Page `/vendor/products` - Gestion produits
- [ ] Page `/vendor/products/new` - Créer produit
- [ ] Page `/vendor/products/[id]/edit` - Modifier produit
- [ ] Page `/vendor/orders` - Commandes reçues
- [ ] Page `/vendor/payouts` - Stripe Connect onboarding

### Priorité 5 - Administration

- [ ] Page `/admin/dashboard` - Dashboard admin
- [ ] Page `/admin/users` - Gestion utilisateurs
- [ ] Page `/admin/vendors` - Gestion vendeurs
- [ ] Page `/admin/orders` - Toutes les commandes
- [ ] Page `/admin/products` - Tous les produits

### Priorité 6 - Fonctionnalités avancées

- [ ] **Abonnements**:
  - [ ] Page `/subscriptions` - Plans d'abonnement
  - [ ] Gestion abonnements utilisateur
  - [ ] Stripe Billing intégration

- [ ] **Avis clients**:
  - [ ] Composant ReviewForm
  - [ ] Affichage avis sur page produit

- [ ] **Emails (Resend)**:
  - [ ] Configuration Resend
  - [ ] Templates emails (confirmation commande, bienvenue, etc.)

- [ ] **AI Features (Vercel AI SDK)**:
  - [ ] Chatbot assistant
  - [ ] Recommandations produits

- [ ] **UploadThing**:
  - [ ] Configuration upload images
  - [ ] Upload images produits

### Priorité 7 - Finitions

- [ ] SEO (meta tags, sitemap)
- [ ] Tests (Vitest)
- [ ] Responsive design complet
- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] 404 et pages d'erreur personnalisées

---

## Variables d'environnement requises

```env
# Base de données
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=

# App
NEXT_PUBLIC_APP_URL=

# Stripe (quand prêt)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (quand prêt)
RESEND_API_KEY=

# UploadThing (quand prêt)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# AI (quand prêt)
ANTHROPIC_API_KEY=
```

---

## Commandes utiles

```bash
# Développement
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Base de données
pnpm drizzle-kit push      # Push schema vers DB
pnpm drizzle-kit studio    # Interface visuelle DB
pnpm drizzle-kit generate  # Générer migrations

# Git
git add .
git commit -m "message"
git push origin main
```

---

## Architecture des dossiers

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes auth (login, register)
│   ├── (shop)/            # Routes boutique
│   ├── account/           # Espace client
│   ├── vendor/            # Espace vendeur
│   ├── admin/             # Espace admin
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui
│   ├── layout/            # Header, Footer, etc.
│   ├── forms/             # Formulaires
│   └── features/          # Composants métier
├── hooks/                 # Custom hooks
├── lib/                   # Utilitaires
├── server/
│   ├── api/               # tRPC
│   ├── auth/              # Better-auth
│   └── db/                # Drizzle
├── stores/                # Zustand
└── types/                 # Types globaux
```

---

## Notes importantes

1. **Erreur 404 actuelle**: L'app renvoie 404 car la DB n'est pas connectée. Les variables d'environnement doivent être configurées sur Vercel.

2. **Stripe**: Le lazy loading a été implémenté pour permettre le build sans STRIPE_SECRET_KEY. L'API key peut être ajoutée plus tard.

3. **Better-auth secret généré**: `<SECRET_RETIRE>`

4. **Commission**: 15% sur chaque vente via Stripe Connect (application_fee)

---

*Dernière mise à jour: 4 février 2026*

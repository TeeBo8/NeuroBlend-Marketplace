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

- [x] **Layout & Navigation**: ✅ (feat: header sticky, footer, mobile nav sheet)
  - [x] Header avec navigation
  - [x] Footer
  - [x] Mobile menu

- [x] **Authentification**: ✅ (feat: login, register, forgot-password + useSession dans header/mobile-nav)
  - [x] Page `/login`
  - [x] Page `/register`
  - [x] Page `/forgot-password`
  - [x] Session intégrée dans Header & MobileNav (useSession, signOut, user dropdown)

- [x] **Catalogue**: ✅ (feat: product listing, detail, category pages with filters + infinite scroll)
  - [x] Page `/products` - Liste produits avec filtres (search, catégorie) + infinite scroll
  - [x] Page `/products/[id]` - Détail produit (image, prix, vendor, avis, intensité, notes)
  - [x] Page `/categories/[category]` - Produits par catégorie (hero thématique, cross-nav)
  - [x] Composant réutilisable `ProductCard` + `ProductCardSkeleton`

- [x] **Panier & Checkout**: ✅ (feat: cart page, checkout with Stripe, success confirmation + add-to-cart hooked up + header badge)
  - [x] Page `/cart` - Panier (quantité +/-, suppression, récapitulatif, état vide)
  - [x] Page `/checkout` - Formulaire checkout (adresse livraison, résumé, redirection Stripe)
  - [x] Page `/checkout/success` - Confirmation commande (vérification paiement, détails commande)
  - [x] Bouton "Ajouter au panier" connecté sur page produit
  - [x] Badge compteur panier dans le header

### Priorité 3 - Espace Client ✅

- [x] Page `/account` - Dashboard client (stats, commandes récentes, quick links)
- [x] Page `/account/orders` - Historique commandes (filtres statut, infinite scroll)
- [x] Page `/account/orders/[id]` - Détail commande (timeline, articles, adresse, suivi)
- [x] Page `/account/settings` - Paramètres compte (profil éditable, infos compte)
- [x] Layout `(account)` - Sidebar nav + auth guard + responsive
- [x] Fix lien "Mon tableau de bord" header/mobile → `/account`

### Priorité 4 - Espace Vendeur ✅

- [x] Layout `(vendor)` - Sidebar nav + auth/role guard + responsive + bouton "Nouveau produit"
- [x] Page `/vendor/register` - Inscription vendeur (bénéfices, formulaire, redirection si déjà vendeur)
- [x] Page `/vendor/dashboard` - Dashboard vendeur (stats, alertes validation/Stripe, commandes récentes, quick links)
- [x] Page `/vendor/products` - Gestion produits (liste, actions, suppression avec confirmation)
- [x] Page `/vendor/products/new` - Créer produit (formulaire complet : info, prix, stock, caractéristiques, image)
- [x] Page `/vendor/products/[id]/edit` - Modifier produit (formulaire pré-rempli, suppression)
- [x] Page `/vendor/orders` - Commandes reçues (filtres statut, détails client/items, actions statut, suivi)
- [x] Page `/vendor/payouts` - Stripe Connect onboarding (checklist statut, configuration, dashboard Stripe)
- [x] Composant réutilisable `ProductForm` (partagé entre new/edit)

### Priorité 5 - Administration

- [x] Page `/admin/dashboard` - Dashboard admin
- [x] Page `/admin/users` - Gestion utilisateurs
- [x] Page `/admin/vendors` - Gestion vendeurs
- [x] Page `/admin/orders` - Toutes les commandes
- [x] Page `/admin/products` - Tous les produits

### Priorité 6 - Fonctionnalités avancées ✅

- [x] **Avis clients**: ✅ (router tRPC review, ReviewForm avec étoiles interactives, intégré page produit)
  - [x] Composant ReviewForm avec star rating interactif
  - [x] Affichage avis sur page produit avec badge "vérifié"
  - [x] Router tRPC `review` (create, byProduct, myReviews, delete)

- [x] **UploadThing**: ✅ (config serveur, route handler, composant ImageUpload avec drag & drop)
  - [x] Configuration upload images (`src/server/uploadthing.ts`)
  - [x] Route handler `/api/uploadthing`
  - [x] Composant `ImageUpload` avec preview et suppression
  - [x] Intégré dans le formulaire produit vendeur

- [x] **Emails (Resend)**: ✅ (client Resend, templates HTML, emails transactionnels)
  - [x] Configuration Resend (`src/lib/email.ts`)
  - [x] Templates emails: bienvenue, confirmation commande, approbation vendeur
  - [x] Intégré dans les routers vendor (approval) et payment (order confirmation)

- [x] **Abonnements**: ✅ (page pricing, Stripe Billing checkout, webhook, gestion)
  - [x] Page `/subscriptions` - 3 plans (Découverte, Essentiel, Premium)
  - [x] Router tRPC `subscription` (getPlans, mySubscription, createCheckout, manage)
  - [x] Webhook Stripe (`/api/webhooks/stripe`) pour subscription events
  - [x] Lien "Abonnements" dans la navigation

- [x] **AI Features (Vercel AI SDK + Gemini)**: ✅ (chatbot flottant, recommandations produit)
  - [x] Chatbot assistant flottant (`useChat` v3 + Gemini 2.5 Flash)
  - [x] Recommandations produit AI sur page produit
  - [x] Routes API `/api/chat` et `/api/recommendations`

### Priorité 7 - Finitions

- [x] **SEO (meta tags, sitemap)**: ✅ (metadataBase, sitemap.ts, robots.ts, enriched metadata)
- [x] **Tests (Vitest)**: ✅ (65 tests - utils, constants, cart-store)
- [x] **Responsive design complet**: ✅ (sidebar nav mobile, checkout grid, skeleton max-width)
- [x] **Loading states & skeletons**: ✅ (loading.tsx pour chaque route group)
- [x] **Error boundaries**: ✅ (error.tsx global + par route group)
- [x] **404 et pages d'erreur personnalisées**: ✅ (not-found.tsx custom NeuroBlend)

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

# Resend
RESEND_API_KEY=

# UploadThing
UPLOADTHING_TOKEN=

# AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=
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

*Dernière mise à jour: 6 février 2026*

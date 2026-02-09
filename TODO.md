# NeuroBlend Marketplace - Suivi du Projet

## Statut Actuel
- **Build Vercel**: Passé
- **URL**: https://neuro-blend-marketplace.vercel.app
- **Phase en cours**: Roadmap V2 — Post-Audit

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

## Roadmap V2 — Post-Audit (7 février 2026)

> Audit réalisé par Claude navigateur + validé et ajusté par Claude Code.
> Les phases sont ordonnées par priorité d'impact business.

---

### PHASE 1 : Corriger les bugs critiques (Priorité MAX) ✅

**Pourquoi** : 8 liens du footer mènent en 404. Un visiteur qui veut en savoir plus avant d'acheter perd confiance immédiatement.

#### 1.1 — Créer les pages manquantes (8 pages 404 du footer) ✅

- [x] `/about` — Page "À propos" (histoire de NeuroBlend, mission, valeurs, le fondateur)
- [x] `/contact` — Page Contact (formulaire email simple avec Resend)
- [x] `/faq` — Page FAQ (reprendre la FAQ abonnements + questions générales marketplace)
- [x] `/shipping` — Page Livraison (délais, zones, tarifs, politique retour)
- [x] `/privacy` — Politique de confidentialité (template RGPD adapté)
- [x] `/terms` — Conditions Générales de Vente (template CGV marketplace)
- [x] `/cookies` — Politique Cookies (informations sur les cookies utilisés)
- [x] `/vendors` — Page "Nos torréfacteurs" (listing public des vendeurs actifs avec profil + tRPC)

#### 1.2 — Corriger l'accessibilité ✅

- [x] Ajouter `aria-label="Ouvrir le chat"` au bouton flottant du chatbot
- [x] Ajouter `aria-label="Fermer le chat"` au bouton close du chatbot
- [x] Ajouter `aria-label="Votre message"` au champ input du chatbot
- [x] Contraste amélioré : `text-purple-200` → `text-purple-100` pour "Propulsé par Gemini"

#### 1.3 — SEO de base manquant ✅

- [x] Créer une image OG (1200x630px) via `opengraph-image.tsx` (génération dynamique Next.js)
- [x] `og:image` et `twitter:image` servis automatiquement par Next.js via le fichier opengraph-image.tsx
- [x] Ajouter des exports `metadata` aux pages auth (login, register, forgot-password — via layouts dédiés)
- [x] Mettre à jour le sitemap.ts pour inclure les 8 nouvelles pages

---

### PHASE 2 : Landing page qui convertit

**Pourquoi** : La homepage actuelle est fonctionnelle mais ne convertit pas. Il manque de l'émotion, de la preuve sociale et de la différenciation. Pour un public neuroatypique, la page doit valider émotionnellement qu'ils sont au bon endroit.

#### 2.1 — Refonte du Hero section

- [x] Titre plus émotionnel : "Votre cerveau mérite un café à sa hauteur"
- [x] Sous-titre avec bénéfice clair : "Des blends créés par des torréfacteurs artisanaux, adaptés aux profils HPI, ADHD et Hypersensibles"
- [x] Badges de confiance ("100% artisanal", "Livraison offerte", "Sans engagement")
- [x] CTA principal renforcé : "Trouver mon blend idéal"

#### 2.1b — Thème Caffeine + Dark Mode

- [x] Appliquer le thème Caffeine (tweakcn) : variables CSS light + dark dans `globals.css`
- [x] Configurer `ThemeProvider` (next-themes) dans `layout.tsx` avec `defaultTheme="system"`
- [x] Créer le composant `ThemeToggle` (Sun/Moon) dans `src/components/theme-toggle.tsx`
- [x] Intégrer le toggle dans le Header (avant le panier)
- [x] Adapter les composants principaux aux couleurs sémantiques : Header, Footer, Mobile Nav, Homepage (Hero, Categories, How it Works, CTA)
- [x] Migrer les couleurs hardcodées (`purple-*`, `gray-*`) dans le reste du projet (pages admin, vendor, account, product-card, etc.)

#### 2.2 — Section preuve sociale (nouvelle) ✅

- [x] Section "Ils ont trouvé leur blend" avec 3-4 témoignages (fictifs pour le MVP — prénom + profil neuro)
- [x] Compteur animé : "X esprits neuroatypiques nous font confiance"

#### 2.3 — Section "Pourquoi NeuroBlend ?" (nouvelle)

- [ ] 3-4 cards avec icônes expliquant la proposition de valeur unique :
  - "Adapté à votre profil cognitif"
  - "Torréfacteurs artisanaux"
  - "Communauté neuroatypique"
  - "Sans engagement"

#### 2.4 — Améliorer les cards profils (HPI/ADHD/Hypersensible)

- [ ] Remplacer les lettres dans cercles violets par des icônes/illustrations plus parlantes
- [ ] Ajouter une courte description du bénéfice café pour chaque profil

#### 2.5 — Section abonnements teaser sur la homepage

- [ ] Ajouter un aperçu des 3 plans d'abonnement avec pricing cards
- [ ] CTA vers la page `/subscriptions`

#### 2.6 — Section torréfacteurs améliorée

- [ ] Remplacer le simple CTA "Vous êtes torréfacteur ?" par 2-3 mini-profils de torréfacteurs partenaires
- [ ] Ajoute de la confiance pour les acheteurs (vrais artisans derrière les produits)

#### 2.7 — Footer enrichi

- [ ] Ajouter les liens réseaux sociaux (Instagram, LinkedIn, TikTok)
- [ ] Ajouter un formulaire newsletter ("Recevez nos découvertes café chaque semaine")

---

### PHASE 3 : Landing page vendeur (torréfacteurs)

**Pourquoi** : Le bouton "Devenir torréfacteur" mène directement à la page d'inscription protégée. Un torréfacteur qui découvre le site doit d'abord comprendre la proposition de valeur AVANT de créer un compte.

#### 3.1 — Page `/vendor/landing` (accessible SANS connexion)

- [ ] Hero : "Vendez votre café à 15-20% de la population française"
- [ ] Proposition de valeur : 0€ d'inscription, 15% de commission, communauté ciblée
- [ ] 3 étapes visuelles : Inscrivez-vous → Ajoutez vos produits → Vendez
- [ ] FAQ vendeur (questions courantes des torréfacteurs)
- [ ] Témoignages torréfacteurs (fictifs au début)
- [ ] CTA : "Créer mon espace vendeur gratuitement" → redirige vers `/vendor/register`
- [ ] Modifier le bouton "Devenir torréfacteur" de la homepage pour pointer vers cette page

---

### PHASE 4 : Fonctionnalités manquantes

#### 4.1 — Bannière cookies RGPD

- [ ] Implémenter une bannière de consentement cookies conforme RGPD/CNIL
- [ ] Stocker le consentement en cookie/localStorage
- [ ] Conditionner le chargement des scripts analytics au consentement

#### 4.2 — Produits de démonstration (seed data)

- [ ] Créer un script de seed (`src/server/db/seed.ts`)
- [ ] 6-9 produits fictifs (2-3 par catégorie HPI/ADHD/Hypersensible)
- [ ] Avec images, descriptions, notes de dégustation, prix, intensité
- [ ] Créer un vendeur test associé
- [ ] Marqués comme produits de démonstration

#### 4.3 — Quiz interactif de recommandation

- [ ] Mini-quiz en 3 questions :
  - "Comment fonctionne votre esprit ?" (analytique/créatif/intense)
  - "Qu'attendez-vous de votre café ?" (focus/calme/énergie)
  - "Quelle intensité préférez-vous ?" (doux/équilibré/corsé)
- [ ] Résultat : recommandation de profil + produits adaptés
- [ ] Intégrer sur la homepage ou comme page dédiée `/quiz`

---

### PHASE 5 : Optimisations

#### 5.1 — SEO avancé

- [ ] Schema.org markup (Product, Organization, FAQ, BreadcrumbList)
- [ ] Pages catégories avec contenu SEO enrichi
- [ ] Metadata unique et optimisée par page

#### 5.2 — Analytics

- [ ] Intégrer un analytics privacy-friendly (Plausible ou PostHog)
- [ ] Event tracking : inscription, ajout panier, clic CTA, ouverture chat, complétion quiz

#### 5.3 — Performance

- [ ] Optimiser les images uploadées en WebP/AVIF
- [ ] Preload des fonts critiques (Inter)
- [ ] Audit Lighthouse et corrections

---

### Résumé des phases

| Phase | Contenu | Impact |
|-------|---------|--------|
| **1** | ~~Corriger 404, accessibilité, SEO de base~~ | ✅ Terminé |
| **2** | Refonte landing page | Conversion visiteurs |
| **3** | Landing page vendeur | Acquisition torréfacteurs |
| **4** | Cookies RGPD, seed data, quiz | Fonctionnalités & UX |
| **5** | Schema.org, analytics, performance | Croissance & SEO |

---

*Dernière mise à jour: 7 février 2026 — Phase 1 terminée (commit fad7a30)*

# NeuroBlend - Application Flow Document

## 1. User Journeys Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VISITOR FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Homepage ──► Browse Products ──► View Product ──► Register/Login     │
│       │              │                  │                   │           │
│       ▼              ▼                  ▼                   ▼           │
│   Categories    Filter/Search      Add to Cart        Create Account   │
│                                         │                   │           │
│                                         ▼                   ▼           │
│                                     Checkout ◄──────── Login           │
│                                         │                               │
│                                         ▼                               │
│                                   Order Complete                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          VENDOR FLOW                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Login ──► Apply as Vendor ──► Wait Approval ──► Setup Stripe         │
│                                       │                │                │
│                                       ▼                ▼                │
│                              Admin Approves    Complete Onboarding     │
│                                       │                │                │
│                                       ▼                ▼                │
│                               Vendor Dashboard ◄───────┘                │
│                                       │                                 │
│                    ┌──────────────────┼──────────────────┐             │
│                    ▼                  ▼                  ▼             │
│              Add Products      Manage Orders       View Payouts        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Login ──► Admin Dashboard                                             │
│                   │                                                     │
│   ┌───────────────┼───────────────┬───────────────┬─────────────────┐  │
│   ▼               ▼               ▼               ▼                 │  │
│ Statistics   Approve Vendors  Manage Users   Featured Products      │  │
│                                                                     │  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Flow: Customer Purchase

### 2.1 Discovery & Browsing

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Homepage                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    HERO SECTION                              ││
│  │  "Le café qui comprend votre esprit"                        ││
│  │                                                              ││
│  │  [Découvrir nos produits]  [Devenir torréfacteur]          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │     HPI     │ │    ADHD     │ │ Hypersensible│              │
│  │   Cliquez   │ │   Cliquez   │ │   Cliquez   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  User Action: Click category OR "Découvrir nos produits"        │
│  → Navigate to /products?category=HPI (or all products)         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Product Listing (/products)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Filters:                                                    │ │
│  │ [Catégorie ▼] [Torréfaction ▼] [Prix ▼] [Recherche...]    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Product │ │ Product │ │ Product │ │ Product │              │
│  │  Card   │ │  Card   │ │  Card   │ │  Card   │              │
│  │ [Add]   │ │ [Add]   │ │ [Add]   │ │ [Add]   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  API Call: api.product.list({ category, search, page })         │
│  User Action: Click product card → /products/[slug]             │
│               OR Click "Add" → Add to cart (toast notification) │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Product Detail (/products/[slug])                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐ │
│  │                  │  │ Focus Blend - HPI                    │ │
│  │     Product      │  │ ★★★★☆ (24 avis)                     │ │
│  │      Image       │  │                                      │ │
│  │                  │  │ 12,99 € / 10 capsules               │ │
│  │                  │  │                                      │ │
│  │                  │  │ Intensité: ████████░░ 8/10          │ │
│  │                  │  │ Torréfaction: Medium                 │ │
│  │                  │  │                                      │ │
│  │                  │  │ Quantité: [−] 1 [+]                 │ │
│  │                  │  │                                      │ │
│  │                  │  │ [    Ajouter au panier    ]         │ │
│  └──────────────────┘  └─────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Description | Avis (24) | Vendeur                           ││
│  │─────────────────────────────────────────────────────────────││
│  │ Un café conçu pour les esprits HPI, avec des notes...      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  API Call: api.product.bySlug(slug)                             │
│  User Action: Click "Ajouter au panier"                         │
│  → cartStore.addItem() + toast.success()                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Cart & Checkout

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Cart (/cart)                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Votre Panier (3 articles)                                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ┌─────┐                                                     ││
│  │ │ IMG │ Focus Blend    [−] 2 [+]    25,98 €    [🗑️]        ││
│  │ └─────┘ HPI • Par CaféZen                                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ┌─────┐                                                     ││
│  │ │ IMG │ Calm Roast     [−] 1 [+]    14,99 €    [🗑️]        ││
│  │ └─────┘ Hypersensible • Par CaféZen                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │                              Sous-total:    40,97 €         ││
│  │                              Livraison:      4,99 €         ││
│  │                              ─────────────────────          ││
│  │                              Total:         45,96 €         ││
│  │                                                             ││
│  │            [   Passer la commande   ]                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  State: cartStore (Zustand + localStorage)                      │
│  Validation: Single vendor only (enforced by store)             │
│  User Action: Click "Passer la commande"                        │
│  → If not logged in → Redirect to /auth/login?redirect=/cart   │
│  → If logged in → Navigate to /checkout                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: Checkout (/checkout)                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐ ┌─────────────────────────────┐  │
│  │ Adresse de livraison     │ │ Récapitulatif               │  │
│  │                          │ │                             │  │
│  │ Nom: [______________]    │ │ Focus Blend x2    25,98 €  │  │
│  │ Adresse: [___________]   │ │ Calm Roast x1     14,99 €  │  │
│  │ Ville: [_____________]   │ │ ─────────────────────────   │  │
│  │ Code postal: [______]    │ │ Sous-total:       40,97 €  │  │
│  │ Pays: [France ▼]         │ │ Commission:        6,15 €  │  │
│  │                          │ │ ─────────────────────────   │  │
│  │                          │ │ Total:            45,96 €  │  │
│  └──────────────────────────┘ └─────────────────────────────┘  │
│                                                                  │
│  [          Payer avec Stripe          ]                         │
│                                                                  │
│  API Call: api.payment.createCheckoutSession(items, shipping)   │
│  → Creates Stripe session with application_fee (15%)            │
│  → Redirects to Stripe Checkout                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: Stripe Checkout (External)                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      STRIPE                                  ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │                                                     │   ││
│  │  │  Email: [_____________________]                    │   ││
│  │  │                                                     │   ││
│  │  │  Card: [____ ____ ____ ____]  [MM/YY]  [CVC]      │   ││
│  │  │                                                     │   ││
│  │  │  [            Pay €45.96            ]              │   ││
│  │  │                                                     │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  On Success: Redirect to /checkout/success?session_id=xxx       │
│  On Cancel: Redirect to /cart                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: Order Confirmation (/checkout/success)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     ✓                                        ││
│  │           Commande confirmée !                               ││
│  │                                                              ││
│  │  Numéro de commande: NB-1707123456789-ABC123                ││
│  │                                                              ││
│  │  Un email de confirmation a été envoyé à                    ││
│  │  vous@exemple.com                                           ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ Récapitulatif:                                      │   ││
│  │  │ - Focus Blend x2                                    │   ││
│  │  │ - Calm Roast x1                                     │   ││
│  │  │ Total: 45,96 €                                      │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  [Voir ma commande]  [Continuer mes achats]                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  API Call: api.payment.verifyCheckout(session_id)               │
│  → Verifies payment with Stripe                                 │
│  → Creates order in database                                    │
│  → Clears cart                                                  │
│  → Sends confirmation email (TODO)                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Flow: Vendor Journey

### 3.1 Vendor Registration

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Apply as Vendor (/vendor/register)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         Devenez torréfacteur sur NeuroBlend                 ││
│  │                                                              ││
│  │  Nom de l'entreprise: [_________________________]           ││
│  │  Description:         [_________________________]           ││
│  │                       [_________________________]           ││
│  │  Site web (optionnel): [________________________]           ││
│  │                                                              ││
│  │  ☑ J'accepte les conditions générales                       ││
│  │  ☑ J'accepte la commission de 15% sur les ventes           ││
│  │                                                              ││
│  │  [        Soumettre ma candidature        ]                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Prerequisite: User must be logged in                           │
│  API Call: api.vendor.register(businessName, description, ...)  │
│  → Creates vendor record with approved=false                    │
│  → User role unchanged (still 'customer')                       │
│  → Redirect to "Candidature en attente" page                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Waiting for Approval                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     ⏳                                       ││
│  │         Candidature en cours d'examen                       ││
│  │                                                              ││
│  │  Votre demande a été soumise le 4 février 2026.            ││
│  │  Notre équipe l'examine généralement sous 48h.             ││
│  │                                                              ││
│  │  Vous recevrez un email dès que votre compte               ││
│  │  sera approuvé.                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  State: vendor.approved = false                                 │
│  Check: api.vendor.me() → Shows pending status                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                      (Admin approves)
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Approved - Setup Stripe (/vendor/payouts)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         Configurez vos paiements                            ││
│  │                                                              ││
│  │  Pour recevoir vos paiements, vous devez configurer        ││
│  │  votre compte Stripe Connect.                              ││
│  │                                                              ││
│  │  Ce processus prend environ 5 minutes et nécessite:        ││
│  │  • Vos informations personnelles                           ││
│  │  • Vos coordonnées bancaires                               ││
│  │  • Une pièce d'identité                                    ││
│  │                                                              ││
│  │  [    Configurer Stripe Connect    ]                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  State: vendor.approved = true, stripeOnboardingComplete = false│
│  API Call: api.payment.createConnectAccount()                   │
│  → Creates/retrieves Stripe Express account                     │
│  → Returns onboarding URL                                       │
│  → Redirect to Stripe onboarding                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Stripe Onboarding (External)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   STRIPE CONNECT                            ││
│  │                                                              ││
│  │  Welcome to Stripe!                                         ││
│  │                                                              ││
│  │  Please provide your business details:                      ││
│  │  • Personal information                                     ││
│  │  • Business type                                            ││
│  │  • Bank account                                             ││
│  │  • Identity verification                                    ││
│  │                                                              ││
│  │  [Continue →]                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  On Complete: Redirect to /vendor/payouts?success=true          │
│  → Update vendor.stripeOnboardingComplete = true                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Vendor Operations

```
┌──────────────────────────────────────────────────────────────────┐
│ Vendor Dashboard (/vendor/dashboard)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Sidebar          │ Main Content                           │  │
│  │──────────────────│────────────────────────────────────────│  │
│  │ 📊 Dashboard     │                                        │  │
│  │ 📦 Mes produits  │  Bienvenue, CaféZen !                 │  │
│  │ 📋 Commandes     │                                        │  │
│  │ 💰 Paiements     │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │ ⚙️ Paramètres    │  │ Ventes  │ │Commandes│ │Produits │  │  │
│  │                  │  │  1.234€ │ │   12    │ │    8    │  │  │
│  │                  │  │ ce mois │ │ en cours│ │ actifs  │  │  │
│  │                  │  └─────────┘ └─────────┘ └─────────┘  │  │
│  │                  │                                        │  │
│  │                  │  Dernières commandes:                  │  │
│  │                  │  ┌────────────────────────────────┐   │  │
│  │                  │  │ #NB-123  │ En cours │  25,98€  │   │  │
│  │                  │  │ #NB-122  │ Expédié  │  14,99€  │   │  │
│  │                  │  └────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  API Calls:                                                      │
│  - api.vendor.me() → Vendor profile                             │
│  - api.order.vendorOrders() → Recent orders                     │
│  - api.product.myProducts() → Product count                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Product Management (/vendor/products)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mes produits                    [+ Nouveau produit]             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Nom           │ Catégorie │ Prix   │ Stock │ Actions      │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Focus Blend   │ HPI       │ 12,99€ │ 45    │ [✏️] [🗑️]   │ │
│  │ Calm Roast    │ Hyper...  │ 14,99€ │ 23    │ [✏️] [🗑️]   │ │
│  │ Energy Shot   │ ADHD      │ 11,99€ │ 0     │ [✏️] [🗑️]   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  API: api.product.myProducts()                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Create/Edit Product (/vendor/products/new)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐ ┌─────────────────────────────────┐  │
│  │                      │ │ Nom du produit:                 │  │
│  │   [Drop image]       │ │ [___________________________]   │  │
│  │                      │ │                                 │  │
│  │                      │ │ Description courte:             │  │
│  │                      │ │ [___________________________]   │  │
│  └──────────────────────┘ │                                 │  │
│                           │ Prix (€):     Catégorie:        │  │
│                           │ [12.99]       [HPI ▼]           │  │
│                           │                                 │  │
│                           │ Stock:        Nb capsules:      │  │
│                           │ [50]          [10]              │  │
│                           │                                 │  │
│                           │ Intensité: [━━━━━━━━░░] 8       │  │
│                           │ Torréfaction: [Medium ▼]        │  │
│                           │                                 │  │
│                           │ Notes aromatiques:              │  │
│                           │ [Chocolat] [Noisette] [+]       │  │
│                           └─────────────────────────────────┘  │
│                                                                  │
│  [Annuler]                              [Enregistrer le produit] │
│                                                                  │
│  API: api.product.create() or api.product.update()              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Order Management (/vendor/orders)                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Commandes reçues                                                │
│                                                                  │
│  Filter: [Tous ▼] [En attente] [Expédiées] [Livrées]           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ #NB-123456 │ 4 fév 2026 │ En cours │ 25,98€ │ [Voir]      │ │
│  │────────────────────────────────────────────────────────────│ │
│  │ Client: Jean Dupont                                        │ │
│  │ - Focus Blend x2                                           │ │
│  │                                                            │ │
│  │ Statut: [En préparation ▼]  Tracking: [__________]        │ │
│  │                                                            │ │
│  │ [Mettre à jour]                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  API:                                                            │
│  - api.order.vendorOrders() → List orders                       │
│  - api.order.updateStatus(orderId, status, tracking)            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Flow: Admin Operations

```
┌──────────────────────────────────────────────────────────────────┐
│ Admin Dashboard (/admin/dashboard)                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Statistiques globales                                       ││
│  │                                                              ││
│  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    ││
│  │ │ Revenus   │ │ Commandes │ │ Vendeurs  │ │ Produits  │    ││
│  │ │  3.456€   │ │    142    │ │    12     │ │    87     │    ││
│  │ │ +12% ↑    │ │ ce mois   │ │ approuvés │ │ actifs    │    ││
│  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘    ││
│  │                                                              ││
│  │ ┌─────────────────────────────┐ ┌─────────────────────────┐││
│  │ │   Graphique revenus        │ │  Top vendeurs           │││
│  │ │   [Chart Area]             │ │  1. CaféZen - 1.234€    │││
│  │ │                            │ │  2. TorréFact - 987€    │││
│  │ │                            │ │  3. BeanMaster - 654€   │││
│  │ └─────────────────────────────┘ └─────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  API: api.admin.getStats(), api.admin.getRevenueChart()         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Vendor Approval (/admin/vendors)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gestion des vendeurs                                            │
│                                                                  │
│  Tab: [En attente (3)] [Approuvés] [Tous]                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CaféZen                                                    │ │
│  │ Candidature soumise le 3 fév 2026                         │ │
│  │                                                            │ │
│  │ Description: Torréfacteur artisanal spécialisé dans les   │ │
│  │ cafés de spécialité, avec une attention particulière...   │ │
│  │                                                            │ │
│  │ Site web: https://cafezen.fr                              │ │
│  │                                                            │ │
│  │ [Approuver ✓]  [Rejeter ✗]                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  API:                                                            │
│  - api.vendor.pendingApplications() → List pending              │
│  - api.vendor.approve(vendorId) → Approve + update user role    │
│  - api.vendor.reject(vendorId) → Reject application             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. State Management Flow

### 5.1 Cart State (Zustand)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CART STATE FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User clicks "Add to cart"                                      │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ cartStore.addItem({                                      │   │
│  │   productId, name, price, quantity, vendorId, ...       │   │
│  │ })                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Check: Same vendor?                                      │   │
│  │ If different vendor → Show warning modal                 │   │
│  │ If same vendor → Add to cart                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Update localStorage ('neuroblend-cart')                  │   │
│  │ Trigger re-render of cart components                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ toast.success('Produit ajouté au panier')               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Authentication State

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION STATE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App Load                                                       │
│      │                                                          │
│      ▼                                                          │
│  useSession() hook                                              │
│      │                                                          │
│      ├──► Session exists → User logged in                       │
│      │         │                                                │
│      │         ▼                                                │
│      │    session.user.role                                     │
│      │         │                                                │
│      │         ├──► 'customer' → Show customer UI               │
│      │         ├──► 'vendor' → Show vendor sidebar              │
│      │         └──► 'admin' → Show admin sidebar                │
│      │                                                          │
│      └──► No session → Guest user                               │
│               │                                                 │
│               ▼                                                 │
│          Show login/register links                              │
│                                                                 │
│  Protected Routes:                                              │
│  /account/* → Requires session                                  │
│  /vendor/* → Requires session + vendor role                     │
│  /admin/* → Requires session + admin role                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    tRPC REQUEST FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client Component                                               │
│       │                                                         │
│       │ api.product.list.useQuery({ category: 'HPI' })         │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ React Query                                              │   │
│  │ - Check cache                                            │   │
│  │ - If stale → fetch                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       │ POST /api/trpc/product.list                            │
│       │ Body: { input: { category: 'HPI' } }                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ tRPC Router                                              │   │
│  │ 1. Parse input with Zod schema                          │   │
│  │ 2. Execute procedure                                     │   │
│  │ 3. Query database with Drizzle                          │   │
│  │ 4. Return serialized data (SuperJSON)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       │ Response: { products: [...], total: 42 }               │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ React Query                                              │   │
│  │ - Store in cache                                         │   │
│  │ - Trigger re-render                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  Component renders with data                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document créé le 4 février 2026*

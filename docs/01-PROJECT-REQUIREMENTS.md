# NeuroBlend Marketplace - Project Requirements Document

## 1. Project Overview

### 1.1 Vision
**NeuroBlend** est une marketplace spécialisée dans la vente de capsules de café adaptées aux personnes neuroatypiques (HPI, ADHD, hypersensibles). Elle connecte des torréfacteurs artisanaux avec des consommateurs à la recherche de cafés pensés pour leurs besoins spécifiques.

### 1.2 Business Model
- **Commission**: 15% sur chaque vente (10% pour les vendeurs premium)
- **Modèle**: Marketplace B2C avec multi-vendeurs
- **Paiements**: Stripe Connect (Express) pour splits automatiques

### 1.3 URL Production
`https://neuro-blend-marketplace.vercel.app`

---

## 2. Acteurs du Système

### 2.1 Visiteur (Non authentifié)
- Parcourir le catalogue de produits
- Filtrer par catégorie (HPI, ADHD, Hypersensible)
- Voir les détails des produits
- Consulter les profils des vendeurs
- Créer un compte

### 2.2 Client (Customer)
- Toutes les actions du visiteur
- Ajouter des produits au panier
- Passer des commandes
- Consulter l'historique de commandes
- Laisser des avis sur les produits achetés
- Gérer son profil
- S'abonner à des livraisons récurrentes (future)

### 2.3 Vendeur (Vendor)
- Toutes les actions du client
- Postuler pour devenir vendeur
- Créer/modifier/supprimer ses produits
- Gérer les commandes reçues
- Mettre à jour les statuts de commande
- Configurer son compte Stripe Connect
- Consulter ses statistiques de vente

### 2.4 Administrateur (Admin)
- Toutes les actions précédentes
- Approuver/rejeter les candidatures vendeurs
- Gérer tous les utilisateurs
- Modifier les taux de commission
- Mettre en avant des produits (featured)
- Consulter les statistiques globales
- Gérer les litiges et annulations

---

## 3. Fonctionnalités Détaillées

### 3.1 Authentification
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Inscription email/password | P1 | Backend ✅ |
| Connexion email/password | P1 | Backend ✅ |
| Déconnexion | P1 | Backend ✅ |
| Session persistante (7 jours) | P1 | Backend ✅ |
| Reset password | P2 | Non implémenté |
| OAuth (Google, GitHub) | P3 | Non implémenté |

### 3.2 Catalogue Produits
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Liste des produits avec pagination | P1 | Backend ✅ |
| Filtrage par catégorie | P1 | Backend ✅ |
| Recherche textuelle | P1 | Backend ✅ |
| Tri (prix, date, popularité) | P2 | Partiel |
| Détail produit | P1 | Backend ✅ |
| Produits mis en avant (featured) | P1 | Backend ✅ |
| Produits par vendeur | P1 | Backend ✅ |

### 3.3 Panier & Checkout
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Ajout/suppression panier | P1 | Store ✅ |
| Persistance localStorage | P1 | Store ✅ |
| Checkout Stripe | P1 | Backend ✅ |
| Split payment (commission) | P1 | Backend ✅ |
| Création commande après paiement | P1 | Backend ✅ |
| Limitation single-vendor | P1 | Store ✅ |
| Multi-vendor checkout | P3 | Non implémenté |

### 3.4 Gestion Commandes (Client)
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Historique commandes | P1 | Backend ✅ |
| Détail commande | P1 | Backend ✅ |
| Suivi de livraison | P2 | Backend ✅ |
| Téléchargement facture | P3 | Non implémenté |

### 3.5 Espace Vendeur
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Inscription vendeur | P1 | Backend ✅ |
| Dashboard vendeur | P1 | Backend ✅ |
| CRUD produits | P1 | Backend ✅ |
| Upload images produits | P1 | Non implémenté |
| Gestion commandes reçues | P1 | Backend ✅ |
| Mise à jour statut commande | P1 | Backend ✅ |
| Onboarding Stripe Connect | P1 | Backend ✅ |
| Statistiques ventes | P2 | Backend ✅ |

### 3.6 Administration
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Dashboard statistiques | P1 | Backend ✅ |
| Gestion utilisateurs | P1 | Backend ✅ |
| Approbation vendeurs | P1 | Backend ✅ |
| Gestion produits (feature) | P1 | Backend ✅ |
| Gestion commandes | P1 | Backend ✅ |
| Modification commission | P1 | Backend ✅ |

### 3.7 Avis & Notes
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Laisser un avis | P2 | Schema ✅ |
| Afficher avis produit | P2 | Non implémenté |
| Avis vérifié (achat) | P2 | Non implémenté |
| Moyenne des notes | P2 | Non implémenté |

### 3.8 Abonnements (Future)
| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Plans d'abonnement | P3 | Schema ✅ |
| Gestion abonnement | P3 | Non implémenté |
| Stripe Billing | P3 | Non implémenté |

---

## 4. Catégories de Produits

### 4.1 HPI (Haut Potentiel Intellectuel)
- **Cible**: Esprits analytiques et créatifs
- **Caractéristiques**: Cafés qui favorisent la concentration prolongée et la clarté mentale
- **Profil aromatique**: Complexe, notes subtiles, acidité équilibrée

### 4.2 ADHD
- **Cible**: Personnes avec trouble de l'attention
- **Caractéristiques**: Cafés qui améliorent le focus sans nervosité excessive
- **Profil aromatique**: Équilibré, libération progressive de caféine

### 4.3 Hypersensible
- **Cible**: Personnes avec sensibilité sensorielle accrue
- **Caractéristiques**: Cafés doux, sans amertume, digestion facile
- **Profil aromatique**: Doux, notes fruitées, faible acidité

---

## 5. Règles Métier

### 5.1 Commandes
- Une commande ne peut contenir que des produits d'un seul vendeur (MVP)
- Le numéro de commande suit le format: `NB-{timestamp}-{random}`
- Statuts possibles: `pending` → `paid` → `processing` → `shipped` → `delivered`
- Un statut `cancelled` est possible à tout moment par l'admin

### 5.2 Vendeurs
- Un utilisateur doit être approuvé par un admin pour devenir vendeur
- Le compte Stripe Connect doit être complété avant de recevoir des paiements
- Commission par défaut: 15% (premium: 10%)
- Les produits d'un vendeur non approuvé ne sont pas visibles

### 5.3 Produits
- Chaque produit a un slug unique généré automatiquement
- Un produit doit avoir un stock > 0 et active = true pour être visible
- L'intensité est notée de 1 à 10
- Les niveaux de torréfaction: light, medium, dark
- Nombre de capsules par défaut: 10

### 5.4 Paiements
- Devise: EUR uniquement
- Commission prélevée automatiquement via Stripe Connect
- Le vendeur reçoit: prix - commission
- La plateforme reçoit: commission (15% ou 10%)

---

## 6. Exigences Non-Fonctionnelles

### 6.1 Performance
- Temps de chargement initial < 3s
- Time to First Byte < 200ms
- Core Web Vitals dans le vert

### 6.2 Sécurité
- Authentification sécurisée (sessions côté serveur)
- Protection CSRF
- Validation côté serveur (Zod)
- Données sensibles non exposées au client

### 6.3 Accessibilité
- WCAG 2.1 niveau AA
- Navigation au clavier
- Support lecteurs d'écran

### 6.4 SEO
- Pages statiques pré-générées
- Meta tags Open Graph
- Sitemap XML
- URLs propres (slugs)

### 6.5 Responsive Design
- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 7. Pages à Implémenter

### Phase 1 - MVP
1. `/` - Homepage ✅
2. `/auth/login` - Connexion
3. `/auth/register` - Inscription
4. `/products` - Catalogue
5. `/products/[slug]` - Détail produit
6. `/cart` - Panier
7. `/checkout` - Checkout
8. `/checkout/success` - Confirmation

### Phase 2 - Espace Client
9. `/account` - Dashboard client
10. `/account/orders` - Historique
11. `/account/orders/[id]` - Détail commande
12. `/account/settings` - Paramètres

### Phase 3 - Espace Vendeur
13. `/vendor/register` - Candidature
14. `/vendor/dashboard` - Dashboard
15. `/vendor/products` - Mes produits
16. `/vendor/products/new` - Nouveau produit
17. `/vendor/products/[id]/edit` - Modifier produit
18. `/vendor/orders` - Commandes reçues
19. `/vendor/payouts` - Stripe Connect

### Phase 4 - Administration
20. `/admin/dashboard` - Dashboard admin
21. `/admin/users` - Gestion utilisateurs
22. `/admin/vendors` - Gestion vendeurs
23. `/admin/orders` - Toutes commandes
24. `/admin/products` - Tous produits

---

## 8. Intégrations Externes

| Service | Usage | Statut |
|---------|-------|--------|
| **Neon** | Base de données PostgreSQL | ✅ Configuré |
| **Stripe** | Paiements + Connect | ✅ Configuré |
| **Vercel** | Hosting | ✅ Déployé |
| **Resend** | Emails transactionnels | Installé |
| **UploadThing** | Upload images | Installé |
| **Anthropic** | AI recommendations | Installé |

---

## 9. Critères d'Acceptation MVP

Pour considérer le MVP comme terminé:

- [ ] Un visiteur peut parcourir et filtrer le catalogue
- [ ] Un visiteur peut s'inscrire et se connecter
- [ ] Un client peut ajouter au panier et payer
- [ ] Un client peut voir ses commandes
- [ ] Un vendeur peut s'inscrire et être approuvé
- [ ] Un vendeur peut créer des produits
- [ ] Un vendeur peut gérer ses commandes
- [ ] Un admin peut approuver les vendeurs
- [ ] Les paiements sont correctement splitté
- [ ] Le site est responsive et performant

---

*Document créé le 4 février 2026*
*Dernière mise à jour: 4 février 2026*

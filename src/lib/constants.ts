// App Configuration
export const APP_NAME = 'NeuroBlend';
export const APP_DESCRIPTION =
  'Marketplace de capsules de café pour les personnes neuroatypiques (HPI, ADHD, hypersensibles)';

// Commission rate
export const DEFAULT_COMMISSION_RATE = 15; // 15%

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: 'HPI', label: 'HPI (Haut Potentiel)', description: 'Pour les esprits analytiques et créatifs' },
  { value: 'ADHD', label: 'ADHD', description: 'Pour les esprits dynamiques' },
  { value: 'hypersensitive', label: 'Hypersensible', description: 'Saveurs douces et équilibrées' },
] as const;

// Roast levels
export const ROAST_LEVELS = [
  { value: 'light', label: 'Léger', description: 'Notes fruitées et acidité vive' },
  { value: 'medium', label: 'Moyen', description: 'Équilibré et polyvalent' },
  { value: 'dark', label: 'Foncé', description: 'Corps prononcé et notes de cacao' },
] as const;

// Order statuses
export const ORDER_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  paid: { label: 'Payée', color: 'green' },
  processing: { label: 'En préparation', color: 'blue' },
  shipped: { label: 'Expédiée', color: 'purple' },
  delivered: { label: 'Livrée', color: 'green' },
  cancelled: { label: 'Annulée', color: 'red' },
} as const;

// User roles
export const USER_ROLES = {
  customer: { label: 'Client', description: 'Peut acheter des produits' },
  vendor: { label: 'Vendeur', description: 'Peut vendre des produits' },
  admin: { label: 'Admin', description: 'Accès complet à la plateforme' },
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'decouverte',
    name: 'Découverte',
    price: 9.90,
    capsules: 5,
    features: [
      '5 capsules par mois',
      'Livraison offerte',
      'Sélection du mois',
    ],
    highlight: false,
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 14.90,
    capsules: 10,
    features: [
      '10 capsules par mois',
      'Livraison offerte',
      '-5% sur la boutique',
      'Accès aux nouveautés en avant-première',
    ],
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24.90,
    capsules: 20,
    features: [
      '20 capsules par mois',
      'Livraison offerte',
      '-10% sur la boutique',
      'Produits exclusifs',
      'Profil gustatif personnalisé',
    ],
    highlight: false,
  },
] as const;

// Navigation links
export const NAV_LINKS = [
  { href: '/products', label: 'Produits' },
  { href: '/subscriptions', label: 'Abonnements' },
  { href: '/products?category=HPI', label: 'HPI' },
  { href: '/products?category=ADHD', label: 'ADHD' },
  { href: '/products?category=hypersensitive', label: 'Hypersensible' },
] as const;

// Footer links
export const FOOTER_LINKS = {
  marketplace: [
    { href: '/products', label: 'Tous les produits' },
    { href: '/vendors', label: 'Nos torréfacteurs' },
    { href: '/about', label: 'À propos' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
    { href: '/shipping', label: 'Livraison' },
  ],
  legal: [
    { href: '/privacy', label: 'Politique de confidentialité' },
    { href: '/terms', label: 'Conditions générales' },
    { href: '/cookies', label: 'Cookies' },
  ],
  vendor: [
    { href: '/vendor/landing', label: 'Devenir vendeur' },
    { href: '/vendor/dashboard', label: 'Espace vendeur' },
  ],
} as const;

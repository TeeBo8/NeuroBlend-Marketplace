import type { NewProduct } from '@/server/db/schema';

/**
 * Décor de la démo : boutiques, produits, clients et avis fictifs.
 * Les identifiants sont fixes pour que les adresses des fiches produit ne
 * changent pas quand on recharge le décor.
 */

export type SeedVendor = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  description: string;
  commissionRate: string;
  /** Catégorie des produits de la boutique. */
  category: 'HPI' | 'ADHD' | 'hypersensitive';
};

// Les trois torréfacteurs présentés sur la page d'accueil.
export const SEED_VENDORS: SeedVendor[] = [
  {
    id: 'atelier-dubois',
    ownerId: 'seed-antoine',
    ownerName: 'Antoine Dubois',
    ownerEmail: 'antoine.dubois@neuroblend.example',
    businessName: 'Atelier Dubois',
    description:
      "Torréfacteur à Lyon. Des cafés d'altitude torréfiés lentement, pour les esprits qui aiment creuser un sujet jusqu'au bout.",
    commissionRate: '15.00',
    category: 'HPI',
  },
  {
    id: 'maison-chen',
    ownerId: 'seed-marie',
    ownerName: 'Marie Chen',
    ownerEmail: 'marie.chen@neuroblend.example',
    businessName: 'Maison Chen',
    description:
      'Torréfactrice à Bordeaux. Des blends francs et réguliers, pensés pour une tasse sans à-coups.',
    commissionRate: '15.00',
    category: 'ADHD',
  },
  {
    id: 'torrefaction-moreau',
    ownerId: 'seed-julien',
    ownerName: 'Julien Moreau',
    ownerEmail: 'julien.moreau@neuroblend.example',
    businessName: 'Torréfaction Moreau',
    description:
      'Torréfacteur à Nantes. Des cafés doux et ronds, sans amertume, pour les palais sensibles.',
    commissionRate: '10.00',
    category: 'hypersensitive',
  },
];

export type SeedCustomer = { id: string; name: string; email: string };

export const SEED_CUSTOMERS: SeedCustomer[] = [
  { id: 'seed-lea', name: 'Léa', email: 'lea@neuroblend.example' },
  { id: 'seed-thomas', name: 'Thomas', email: 'thomas@neuroblend.example' },
  { id: 'seed-camille', name: 'Camille', email: 'camille@neuroblend.example' },
  { id: 'seed-maxime', name: 'Maxime', email: 'maxime@neuroblend.example' },
];

/**
 * Commandes livrées du décor, avec l'avis laissé ensuite. `daysAgo` date la
 * commande par rapport au moment où le décor est chargé.
 */
export type SeedOrder = {
  customerId: string;
  daysAgo: number;
  items: { slug: string; quantity: number }[];
  review?: { slug: string; rating: number; title: string; comment: string };
};

export const SEED_ORDERS: SeedOrder[] = [
  {
    customerId: 'seed-lea',
    daysAgo: 27,
    items: [{ slug: 'synaptic-focus', quantity: 2 }],
    review: {
      slug: 'synaptic-focus',
      rating: 5,
      title: 'Parfait pour les longues sessions',
      comment: 'Des notes de myrtille très nettes, et aucune lourdeur. Je le garde pour mes matinées de travail au calme.',
    },
  },
  {
    customerId: 'seed-maxime',
    daysAgo: 23,
    items: [
      { slug: 'deep-thought', quantity: 1 },
      { slug: 'eureka-blend', quantity: 1 },
    ],
    review: {
      slug: 'deep-thought',
      rating: 4,
      title: 'Corsé, comme annoncé',
      comment: "Un café qui a du corps. Un peu intense pour l'après-midi, idéal le matin.",
    },
  },
  {
    customerId: 'seed-thomas',
    daysAgo: 19,
    items: [{ slug: 'hyper-focus', quantity: 3 }],
    review: {
      slug: 'hyper-focus',
      rating: 5,
      title: 'Mon café du lundi',
      comment: "Franc et régulier d'une capsule à l'autre. Livré rapidement.",
    },
  },
  {
    customerId: 'seed-camille',
    daysAgo: 16,
    items: [{ slug: 'velvet-calm', quantity: 2 }],
    review: {
      slug: 'velvet-calm',
      rating: 5,
      title: 'Enfin un café doux',
      comment: 'Aucune amertume, des notes de miel. Exactement ce que je cherchais.',
    },
  },
  {
    customerId: 'seed-thomas',
    daysAgo: 12,
    items: [
      { slug: 'flow-state', quantity: 2 },
      { slug: 'morning-anchor', quantity: 1 },
    ],
    review: {
      slug: 'flow-state',
      rating: 4,
      title: 'Bon rapport qualité-prix',
      comment: "Équilibré et facile à boire. J'aurais aimé un format de vingt capsules.",
    },
  },
  {
    customerId: 'seed-lea',
    daysAgo: 9,
    items: [{ slug: 'eureka-blend', quantity: 2 }],
    review: {
      slug: 'eureka-blend',
      rating: 5,
      title: 'Très bon blend',
      comment: 'Un caramel discret et une belle longueur en bouche.',
    },
  },
  {
    customerId: 'seed-camille',
    daysAgo: 6,
    items: [
      { slug: 'gentle-wave', quantity: 1 },
      { slug: 'inner-peace', quantity: 1 },
    ],
    review: {
      slug: 'gentle-wave',
      rating: 3,
      title: 'Agréable mais léger',
      comment: 'Très doux, presque trop pour moi. Je préfère le Velvet Calm.',
    },
  },
  {
    customerId: 'seed-maxime',
    daysAgo: 3,
    items: [{ slug: 'synaptic-focus', quantity: 1 }],
    review: {
      slug: 'synaptic-focus',
      rating: 4,
      title: 'Fin et fruité',
      comment: 'Une torréfaction légère bien maîtrisée.',
    },
  },
];

/** Les produits, trois par boutique. La boutique se déduit de la catégorie. */
export const SEED_PRODUCTS: Omit<NewProduct, 'vendorId'>[] = [
  // ═══════════════════════════════════════
  // HPI — Haut Potentiel Intellectuel
  // ═══════════════════════════════════════
  {
    name: "Synaptic Focus",
    slug: "synaptic-focus",
    description:
      "Conçu pour les esprits analytiques, Synaptic Focus associe un arabica éthiopien d'altitude à des notes de myrtille et de jasmin. Sa torréfaction légère préserve les arômes subtils et la complexité que les penseurs HPI apprécient. Chaque tasse est une invitation à la réflexion profonde et à la clarté mentale.",
    shortDescription:
      "Arabica éthiopien d'altitude aux notes florales et fruitées pour la clarté mentale.",
    price: "14.90",
    compareAtPrice: "17.90",
    capsuleCount: 10,
    category: "HPI",
    imageUrl: "/images/products/coffee-beans-close.jpg",
    images: [],
    stock: 150,
    active: true,
    featured: true,
    intensityLevel: 5,
    roastLevel: "light",
    flavorNotes: ["Myrtille", "Jasmin", "Bergamote"],
    origin: "Éthiopie — Yirgacheffe",
  },
  {
    name: "Eureka Blend",
    slug: "eureka-blend",
    description:
      "Un blend créatif pour les moments d'eureka. Ce mélange de grains colombiens et guatémaltèques offre un profil équilibré entre douceur caramélisée et acidité vive. Idéal pour accompagner vos sessions de brainstorming et vos projets les plus ambitieux.",
    shortDescription:
      "Blend colombo-guatémaltèque doux et vif, compagnon des grands projets.",
    price: "12.90",
    capsuleCount: 10,
    category: "HPI",
    imageUrl: "/images/products/coffee-cup-table.jpg",
    images: [],
    stock: 200,
    active: true,
    featured: false,
    intensityLevel: 6,
    roastLevel: "medium",
    flavorNotes: ["Caramel", "Agrumes", "Noisette"],
    origin: "Colombie / Guatemala",
  },
  {
    name: "Deep Thought",
    slug: "deep-thought",
    description:
      "Pour les pensées profondes et les analyses complexes. Ce single origin du Kenya livre des notes intenses de cassis et de tomate séchée, avec une finale chocolatée. Sa torréfaction moyenne-foncée en fait le compagnon idéal des longues soirées de réflexion.",
    shortDescription:
      "Single origin kenyan intense, pour les pensées profondes et complexes.",
    price: "16.90",
    capsuleCount: 10,
    category: "HPI",
    imageUrl: "/images/products/coffee-dark-roast.jpg",
    images: [],
    stock: 100,
    active: true,
    featured: false,
    intensityLevel: 8,
    roastLevel: "dark",
    flavorNotes: ["Cassis", "Chocolat noir", "Tomate séchée"],
    origin: "Kenya — Nyeri",
  },

  {
    name: "Hyper Focus",
    slug: "hyper-focus",
    description:
      "Hyper Focus est un assemblage brésilien à faible acidité, avec des notes de noix et de chocolat au lait. Une tasse ronde et régulière, pensée pour les longues sessions de travail.",
    shortDescription:
      "Assemblage brésilien doux, rond et régulier.",
    price: "13.90",
    compareAtPrice: "15.90",
    capsuleCount: 10,
    category: "ADHD",
    imageUrl: "/images/products/coffee-beans-bag.jpg",
    images: [],
    stock: 180,
    active: true,
    featured: true,
    intensityLevel: 4,
    roastLevel: "medium",
    flavorNotes: ["Noix", "Chocolat au lait", "Miel"],
    origin: "Brésil — Cerrado",
  },
  {
    name: "Flow State",
    slug: "flow-state",
    description:
      "Entrez dans votre zone de flow. Ce blend associe un robusta choisi pour son corps à un arabica péruvien doux et fruité. Le résultat : une tasse constante, qui accompagne votre rythme sans le bousculer.",
    shortDescription:
      "Blend arabica-robusta, corps affirmé et tasse constante.",
    price: "11.90",
    capsuleCount: 10,
    category: "ADHD",
    imageUrl: "/images/products/coffee-pour.jpg",
    images: [],
    stock: 220,
    active: true,
    featured: false,
    intensityLevel: 7,
    roastLevel: "medium",
    flavorNotes: ["Fruits rouges", "Amande", "Épices douces"],
    origin: "Pérou / Inde",
  },
  {
    name: "Morning Anchor",
    slug: "morning-anchor",
    description:
      "Votre ancre du matin. Ce café matinal à torréfaction foncée offre un corps puissant et réconfortant avec des notes de cacao et de pain grillé. Conçu pour ceux qui ont besoin d'un démarrage solide et structurant pour bien lancer leur journée.",
    shortDescription:
      "Torréfaction foncée réconfortante pour un démarrage structurant.",
    price: "12.50",
    capsuleCount: 10,
    category: "ADHD",
    imageUrl: "/images/products/espresso-art.jpg",
    images: [],
    stock: 160,
    active: true,
    featured: false,
    intensityLevel: 9,
    roastLevel: "dark",
    flavorNotes: ["Cacao", "Pain grillé", "Vanille bourbon"],
    origin: "Sumatra — Mandheling",
  },

  {
    name: "Velvet Calm",
    slug: "velvet-calm",
    description:
      "Une douceur enveloppante pour les âmes sensibles. Ce décaféiné naturel (Swiss Water Process) conserve toute la richesse aromatique d'un grand café sans la stimulation excessive. Notes de vanille et de fleur d'oranger pour un moment de pure sérénité.",
    shortDescription:
      "Décaféiné naturel aux notes de vanille, pour un moment de sérénité.",
    price: "15.90",
    compareAtPrice: "18.90",
    capsuleCount: 10,
    category: "hypersensitive",
    imageUrl: "/images/products/coffee-cup-latte.jpg",
    images: [],
    stock: 130,
    active: true,
    featured: true,
    intensityLevel: 2,
    roastLevel: "light",
    flavorNotes: ["Vanille", "Fleur d'oranger", "Amande douce"],
    origin: "Mexique — Chiapas (Swiss Water Decaf)",
  },
  {
    name: "Gentle Wave",
    slug: "gentle-wave",
    description:
      "Comme une vague douce qui vous berce. Ce blend costaricain à faible teneur en caféine offre des notes rondes de miel et de pêche. Parfait pour les après-midis tranquilles ou quand vous cherchez un réconfort sans surcharge sensorielle.",
    shortDescription:
      "Blend costaricain doux et rond, réconfort sans surcharge sensorielle.",
    price: "13.50",
    capsuleCount: 10,
    category: "hypersensitive",
    imageUrl: "/images/products/coffee-packaging.jpg",
    images: [],
    stock: 170,
    active: true,
    featured: false,
    intensityLevel: 3,
    roastLevel: "light",
    flavorNotes: ["Miel", "Pêche", "Beurre"],
    origin: "Costa Rica — Tarrazú",
  },
  {
    name: "Inner Peace",
    slug: "inner-peace",
    description:
      "Trouvez votre paix intérieure. Ce single origin rwandais à torréfaction moyenne délivre des notes délicates de cerise et de thé noir. Sa douceur naturelle et son faible taux d'amertume en font le compagnon idéal des personnes hypersensibles recherchant un café qui ne brusque pas.",
    shortDescription:
      "Single origin rwandais délicat, douceur naturelle sans amertume.",
    price: "14.50",
    capsuleCount: 10,
    category: "hypersensitive",
    imageUrl: "/images/products/coffee-grinder.jpg",
    images: [],
    stock: 140,
    active: true,
    featured: false,
    intensityLevel: 4,
    roastLevel: "medium",
    flavorNotes: ["Cerise", "Thé noir", "Rose"],
    origin: "Rwanda — Huye Mountain",
  },
];

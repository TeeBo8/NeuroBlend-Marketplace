/**
 * Seed script — Produits de démonstration NeuroBlend
 *
 * Usage: pnpm db:seed
 *
 * Creates:
 * - 1 demo vendor (user + vendor profile)
 * - 9 products (3 per category: HPI, ADHD, Hypersensible)
 *
 * Safe to re-run: checks for existing demo vendor before inserting.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

// Load .env.local for local development
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Make sure .env.local is loaded.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

const DEMO_VENDOR_EMAIL = "demo-vendor@neuroblend.fr";

const demoProducts: Omit<schema.NewProduct, "vendorId">[] = [
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
    imageUrl: null,
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
    imageUrl: null,
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
    imageUrl: null,
    images: [],
    stock: 100,
    active: true,
    featured: false,
    intensityLevel: 8,
    roastLevel: "dark",
    flavorNotes: ["Cassis", "Chocolat noir", "Tomate séchée"],
    origin: "Kenya — Nyeri",
  },

  // ═══════════════════════════════════════
  // ADHD — Concentration et Focus
  // ═══════════════════════════════════════
  {
    name: "Hyper Focus",
    slug: "hyper-focus",
    description:
      "Spécialement formulé pour soutenir la concentration, Hyper Focus est un assemblage brésilien à faible acidité avec des notes de noix et de chocolat au lait. Sa libération progressive de caféine aide à maintenir un focus stable sans les pics d'énergie suivis de crashes.",
    shortDescription:
      "Assemblage brésilien doux, libération progressive pour un focus stable.",
    price: "13.90",
    compareAtPrice: "15.90",
    capsuleCount: 10,
    category: "ADHD",
    imageUrl: null,
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
      "Entrez dans votre zone de flow. Ce blend associe un robusta sélectionné pour son apport énergétique maîtrisé à un arabica péruvien doux et fruité. Le résultat : une stimulation constante qui accompagne votre rythme sans le bousculer.",
    shortDescription:
      "Blend arabica-robusta pour une énergie maîtrisée et constante.",
    price: "11.90",
    capsuleCount: 10,
    category: "ADHD",
    imageUrl: null,
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
    imageUrl: null,
    images: [],
    stock: 160,
    active: true,
    featured: false,
    intensityLevel: 9,
    roastLevel: "dark",
    flavorNotes: ["Cacao", "Pain grillé", "Vanille bourbon"],
    origin: "Sumatra — Mandheling",
  },

  // ═══════════════════════════════════════
  // Hypersensible — Douceur et Équilibre
  // ═══════════════════════════════════════
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
    imageUrl: null,
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
    imageUrl: null,
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
    imageUrl: null,
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

async function seed() {
  console.log("🌱 Seeding NeuroBlend database...\n");

  // 1. Check if demo vendor already exists
  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_VENDOR_EMAIL));

  let userId: string;
  let vendorId: string;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
    console.log(`  User "${DEMO_VENDOR_EMAIL}" already exists (${userId})`);

    const existingVendors = await db
      .select()
      .from(schema.vendors)
      .where(eq(schema.vendors.userId, userId));

    if (existingVendors.length > 0) {
      vendorId = existingVendors[0].id;
      console.log(`  Vendor already exists (${vendorId})`);
    } else {
      const [vendor] = await db
        .insert(schema.vendors)
        .values({
          userId,
          businessName: "NeuroBlend Torréfaction",
          description:
            "Torréfacteur artisanal spécialisé dans les cafés adaptés aux profils neuroatypiques. Nos blends sont conçus avec soin pour accompagner chaque esprit unique.",
          approved: true,
          commissionRate: "10.00",
        })
        .returning();
      vendorId = vendor.id;
      console.log(`  Created vendor: NeuroBlend Torréfaction (${vendorId})`);
    }
  } else {
    // Create demo user
    const [user] = await db
      .insert(schema.users)
      .values({
        email: DEMO_VENDOR_EMAIL,
        name: "NeuroBlend Demo",
        emailVerified: true,
        role: "vendor",
      })
      .returning();
    userId = user.id;
    console.log(`  Created user: ${user.name} (${userId})`);

    // Create vendor profile
    const [vendor] = await db
      .insert(schema.vendors)
      .values({
        userId,
        businessName: "NeuroBlend Torréfaction",
        description:
          "Torréfacteur artisanal spécialisé dans les cafés adaptés aux profils neuroatypiques. Nos blends sont conçus avec soin pour accompagner chaque esprit unique.",
        approved: true,
        commissionRate: "10.00",
      })
      .returning();
    vendorId = vendor.id;
    console.log(`  Created vendor: NeuroBlend Torréfaction (${vendorId})`);
  }

  // 2. Upsert products (delete existing demo products, then re-insert)
  const existingProducts = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.vendorId, vendorId));

  if (existingProducts.length > 0) {
    await db
      .delete(schema.products)
      .where(eq(schema.products.vendorId, vendorId));
    console.log(`  Deleted ${existingProducts.length} existing demo products`);
  }

  // 3. Insert demo products
  const inserted = await db
    .insert(schema.products)
    .values(
      demoProducts.map((p) => ({
        ...p,
        vendorId,
      }))
    )
    .returning({ id: schema.products.id, name: schema.products.name });

  console.log(`\n  Inserted ${inserted.length} products:`);
  for (const p of inserted) {
    console.log(`    - ${p.name} (${p.id})`);
  }

  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

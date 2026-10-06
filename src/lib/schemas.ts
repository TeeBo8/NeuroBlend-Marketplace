import { APP_NAME, APP_DESCRIPTION } from './constants';
import { siteUrl } from '@/lib/site-url';

const BASE_URL = siteUrl;

// --- Organization ---
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: BASE_URL,
    description: APP_DESCRIPTION,
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@neuroblend.example',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
  };
}

// --- WebSite with SearchAction ---
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: BASE_URL,
    description: APP_DESCRIPTION,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// --- Product ---
export function productSchema(product: {
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: string;
  compareAtPrice?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  stock?: number | null;
  id: string;
  slug?: string | null;
  origin?: string | null;
  vendor?: { businessName: string } | null;
  reviews?: Array<{ rating: number; comment?: string | null; user?: { name: string | null } | null; createdAt: Date }>;
  // Calculés en base sur tous les avis : `reviews` ne contient que les derniers.
  reviewStats?: { count: number; average: number };
}) {
  const availability =
    product.stock !== null && product.stock !== undefined && product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 300),
    image: product.imageUrl || undefined,
    url: `${BASE_URL}/products/${product.id}`,
    brand: product.vendor
      ? { '@type': 'Brand', name: product.vendor.businessName }
      : undefined,
    category: product.category || undefined,
    countryOfOrigin: product.origin
      ? { '@type': 'Country', name: product.origin }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability,
      url: `${BASE_URL}/products/${product.id}`,
      seller: product.vendor
        ? { '@type': 'Organization', name: product.vendor.businessName }
        : undefined,
    },
    ...(product.reviewStats && product.reviewStats.count > 0 && product.reviews
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.reviewStats.average.toFixed(1),
            reviewCount: product.reviewStats.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: product.reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
            },
            author: {
              '@type': 'Person',
              name: r.user?.name || 'Anonyme',
            },
            datePublished: r.createdAt.toISOString().split('T')[0],
            ...(r.comment ? { reviewBody: r.comment } : {}),
          })),
        }
      : {}),
  };
}

// --- FAQPage ---
export function faqPageSchema(
  questions: Array<{ q: string; a: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

// --- BreadcrumbList ---
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// --- CollectionPage (for category pages) ---
export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: APP_NAME,
      url: BASE_URL,
    },
  };
}

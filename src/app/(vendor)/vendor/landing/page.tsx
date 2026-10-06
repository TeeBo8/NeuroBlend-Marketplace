import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { APP_NAME, DEFAULT_COMMISSION_RATE } from "@/lib/constants";
import {
  Store,
  TrendingUp,
  Users,
  UserPlus,
  PackagePlus,
  BadgeEuro,
  Quote,
  MapPin,
  ChevronDown,
  Check,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Devenir torréfacteur partenaire — 0€ d'inscription",
  description:
    "Vendez vos capsules de café artisanales sur NeuroBlend. 0€ d'inscription, commission de 15% seulement, accès à une communauté de passionnés neuroatypiques. Inscription gratuite.",
  keywords: [
    "vendre café en ligne",
    "torréfacteur marketplace",
    "devenir vendeur café",
    "commission café",
    "marketplace artisan café",
  ],
  openGraph: {
    title: "Devenir vendeur | NeuroBlend",
    description:
      "0€ d'inscription, 15% de commission. Vendez vos capsules à une communauté passionnée.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "/vendor/landing",
  },
};

const VALUE_PROPS = [
  {
    icon: BadgeEuro,
    title: "0€ d'inscription",
    description:
      "Aucun frais d'entrée, aucun abonnement. Vous ne payez que lorsque vous vendez.",
  },
  {
    icon: TrendingUp,
    title: `${DEFAULT_COMMISSION_RATE}% de commission`,
    description:
      "Une commission juste et transparente. Vous gardez 85% de chaque vente.",
  },
  {
    icon: Users,
    title: "Communauté ciblée",
    description:
      "Accédez directement à une audience passionnée de café et de neurodiversité.",
  },
] as const;

const STEPS = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous",
    description:
      "Créez votre espace vendeur gratuitement en quelques minutes. Aucune carte bancaire requise.",
  },
  {
    icon: PackagePlus,
    title: "Ajoutez vos produits",
    description:
      "Décrivez vos capsules, ajoutez des photos et définissez vos prix. Notre interface vous guide à chaque étape.",
  },
  {
    icon: BadgeEuro,
    title: "Vendez et encaissez",
    description:
      "Les commandes arrivent, vous expédiez. Les paiements sont versés directement sur votre compte via Stripe.",
  },
] as const;

const VENDOR_TESTIMONIALS = [
  {
    name: "Sophie R.",
    image: "/images/testimonials/sophie.jpg",
    location: "Toulouse",
    quote:
      "En 3 mois sur NeuroBlend, j'ai touché une clientèle que je n'aurais jamais atteinte seule. Les retours des clients neuroatypiques sont incroyablement précis et constructifs.",
  },
  {
    name: "Marc L.",
    image: "/images/testimonials/marc.jpg",
    location: "Strasbourg",
    quote:
      "La plateforme est simple et les paiements arrivent rapidement. Je peux me concentrer sur ce que je fais de mieux : torréfier du café d'exception.",
  },
  {
    name: "Emma B.",
    image: "/images/testimonials/emma.jpg",
    location: "Marseille",
    quote:
      "J'adore l'idée de créer des blends adaptés à chaque profil cognitif. C'est un vrai challenge créatif et mes ventes ont doublé depuis mon arrivée.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Combien coûte l'inscription ?",
    answer:
      "L'inscription est 100% gratuite. Pas de frais cachés, pas d'abonnement mensuel. Nous prélevons uniquement une commission de 15% sur chaque vente réalisée.",
  },
  {
    question: "Quels types de produits puis-je vendre ?",
    answer:
      "Vous pouvez vendre des capsules de café artisanales adaptées aux profils neuroatypiques : HPI (Haut Potentiel), ADHD, et Hypersensibles. Chaque produit doit être de qualité artisanale.",
  },
  {
    question: "Comment sont gérés les paiements ?",
    answer:
      "Les paiements sont sécurisés via Stripe Connect. Vos revenus sont versés directement sur votre compte bancaire selon un calendrier régulier. Vous suivez tout depuis votre tableau de bord.",
  },
  {
    question: "Qui sont les acheteurs sur NeuroBlend ?",
    answer:
      "Notre communauté est composée de personnes neuroatypiques (HPI, ADHD, hypersensibles) à la recherche de cafés adaptés à leurs besoins. C'est 15 à 20% de la population française.",
  },
  {
    question: "Puis-je modifier mes produits à tout moment ?",
    answer:
      "Absolument. Votre tableau de bord vendeur vous permet d'ajouter, modifier ou retirer vos produits à tout moment. Vous avez un contrôle total sur votre catalogue.",
  },
] as const;

export default function VendorLandingPage() {
  const vendorFaqs = FAQ_ITEMS.map((item) => ({
    q: item.question,
    a: item.answer,
  }));

  return (
    <>
      <JsonLd data={faqPageSchema(vendorFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Devenir vendeur', url: '/vendor/landing' },
        ])}
      />

      {/* Hero */}
      <section className="border-b bg-secondary/40">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Store className="h-4 w-4" />
              Espace torréfacteurs
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 leading-tight">
              Vendez votre café à 15-20% de la population française
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Rejoignez {APP_NAME} et touchez une communauté passionnée
              d&apos;esprits neuroatypiques. <strong className="text-foreground">0€ d&apos;inscription</strong>,{" "}
              <strong className="text-foreground">{DEFAULT_COMMISSION_RATE}% de commission</strong> seulement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="h-auto w-full sm:w-auto whitespace-normal text-center text-base px-6 sm:px-8 py-4 font-semibold"
                asChild
              >
                <Link href="/vendor/register">
                  Créer mon espace vendeur gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Pourquoi vendre sur {APP_NAME} ?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Une marketplace pensée pour les artisans du café, avec des conditions transparentes et une audience qualifiée.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-2xl border bg-card p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <prop.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{prop.title}</h3>
                <p className="text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {i + 1}
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Tableau de bord vendeur complet",
              "Gestion de catalogue intuitive",
              "Suivi des commandes en temps réel",
              "Paiements sécurisés via Stripe",
              "Statistiques de ventes détaillées",
              "Support dédié aux vendeurs",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Ils vendent déjà sur {APP_NAME}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Découvrez les retours de torréfacteurs qui ont rejoint notre plateforme.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {VENDOR_TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border bg-card p-6 flex flex-col gap-4 relative"
              >
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Questions fréquentes
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Tout ce que vous devez savoir avant de vous lancer.
          </p>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border bg-card"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 font-medium list-none">
                  {item.question}
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à rejoindre {APP_NAME} ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Créez votre espace vendeur en quelques minutes et commencez à vendre
            vos capsules à une communauté passionnée.
          </p>
          <Button size="lg" variant="secondary" className="h-auto max-w-full whitespace-normal text-center text-base px-6 sm:px-8 py-4 font-semibold" asChild>
            <Link href="/vendor/register">
              Créer mon espace vendeur gratuitement
            </Link>
          </Button>
          <p className="text-sm text-primary-foreground/60 mt-4">
            Inscription gratuite · Aucune carte bancaire requise
          </p>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import { APP_NAME, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Shield, Truck, RefreshCcw, Star, Quote, Brain, Coffee, Heart, Lock, Lightbulb, Zap, Feather, MapPin, type LucideIcon } from "lucide-react";
import { TrackedCta } from "@/components/home/tracked-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteSchema } from "@/lib/schemas";

const TESTIMONIALS = [
  {
    name: "Léa",
    profile: "HPI" as const,
    image: "/images/avatars/lea.svg",
    quote:
      "Depuis que j'ai trouvé mon blend HPI, mes sessions de deep work sont incomparables. Ce café comprend mon cerveau.",
  },
  {
    name: "Thomas",
    profile: "ADHD" as const,
    image: "/images/avatars/thomas.svg",
    quote:
      "Le blend ADHD est devenu mon café du matin : franc, régulier, sans amertume. Je ne reviendrai pas en arrière.",
  },
  {
    name: "Camille",
    profile: "Hypersensible" as const,
    image: "/images/avatars/camille.svg",
    quote:
      "Enfin un café doux qui ne m'agresse pas. Les notes florales sont subtiles et apaisantes. Je me sens comprise.",
  },
  {
    name: "Maxime",
    profile: "HPI" as const,
    image: "/images/avatars/maxime.svg",
    quote:
      "La qualité artisanale se sent dès la première gorgée. Mon rituel café du matin a complètement changé.",
  },
] as const;

const PROFILE_COLORS: Record<string, string> = {
  HPI: "bg-primary/10 text-primary",
  ADHD: "bg-secondary/80 text-secondary-foreground",
  Hypersensible: "bg-accent text-accent-foreground",
};

const CATEGORY_DETAILS: Record<string, { icon: LucideIcon; benefit: string; image: string }> = {
  HPI: {
    icon: Lightbulb,
    benefit: "Des arômes complexes pour accompagner les longues sessions de réflexion",
    image: "/images/categories/hpi-lifestyle.jpg",
  },
  ADHD: {
    icon: Zap,
    benefit: "Une intensité franche et régulière, pour un café sans à-coups",
    image: "/images/categories/adhd-lifestyle.jpg",
  },
  hypersensitive: {
    icon: Feather,
    benefit: "Des arômes doux qui respectent votre sensibilité sensorielle",
    image: "/images/categories/hypersensible-lifestyle.jpg",
  },
};

const ROASTERS = [
  {
    name: "Antoine Dubois",
    image: "/images/avatars/antoine.svg",
    location: "Lyon",
    specialty: "Blend HPI",
    quote:
      "Chaque grain est sélectionné pour sa complexité. La torréfaction lente révèle des arômes qui se découvrent gorgée après gorgée.",
  },
  {
    name: "Marie Chen",
    image: "/images/avatars/marie.svg",
    location: "Bordeaux",
    specialty: "Blend ADHD",
    quote:
      "Je torréfie des cafés francs et réguliers, sans amertume. L'équilibre est la clé.",
  },
  {
    name: "Julien Moreau",
    image: "/images/avatars/julien.svg",
    location: "Nantes",
    specialty: "Blend Hypersensible",
    quote:
      "La douceur est un art. Mes blends respectent chaque sensibilité avec des profils aromatiques subtils.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        {/* Video background with image fallback */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero/coffee-beans.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/images/hero/cappuccino-hero.mp4" type="video/mp4" />
          </video>
          {/* Voile sombre neutre, identique en clair et en sombre : le texte
              reste blanc et lisible sur la vidéo. */}
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Votre cerveau mérite un café à sa hauteur
            </h1>
            <p className="text-lg md:text-2xl text-white/85 mb-8 leading-relaxed">
              Des blends créés par des torréfacteurs artisanaux, adaptés aux
              profils <strong className="text-white">HPI</strong>,{" "}
              <strong className="text-white">ADHD</strong> et{" "}
              <strong className="text-white">Hypersensibles</strong>.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Shield, label: "100% artisanal" },
                { icon: Truck, label: "Livraison offerte" },
                { icon: RefreshCcw, label: "Retour sous 14 jours" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white"
                >
                  <badge.icon className="h-4 w-4" />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedCta
                href="/quiz"
                label="Faire le quiz"
                location="hero"
                variant="secondary"
                className="bg-white text-neutral-900 hover:bg-white/90 text-base px-8 py-6 font-semibold"
              >
                Faire le quiz
              </TrackedCta>
              <TrackedCta
                href="/products"
                label="Tous nos cafés"
                location="hero"
                variant="outline"
                className="bg-transparent border-white/70 text-white hover:bg-white/10 hover:text-white text-base px-8 py-6"
              >
                Tous nos cafés
              </TrackedCta>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Trouvez votre profil
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Chaque esprit est unique. Nos torréfacteurs créent des blends
            adaptés à votre façon de penser et de ressentir.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {PRODUCT_CATEGORIES.map((category) => {
              const details = CATEGORY_DETAILS[category.value];
              const Icon = details?.icon;
              return (
                <Link
                  key={category.value}
                  href={`/products?category=${category.value}`}
                  className="group"
                >
                  <div className="rounded-2xl border overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg bg-card">
                    {details?.image && (
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={details.image}
                          alt={category.label}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                        <div className="absolute bottom-3 left-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
                          {Icon && <Icon className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.label}
                      </h3>
                      <p className="text-muted-foreground">{category.description}</p>
                      {details?.benefit && (
                        <p className="text-sm text-primary/80 mt-3 font-medium">
                          {details.benefit}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Ils ont trouvé leur blend
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Des témoignages d&apos;illustration : NeuroBlend est une marque fictive.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial) => (
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
                    unoptimized
                    className="w-10 h-10 rounded-full bg-muted object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${PROFILE_COLORS[testimonial.profile]}`}
                    >
                      {testimonial.profile}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NeuroBlend Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Pourquoi NeuroBlend ?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Une marketplace pensée par et pour les esprits qui fonctionnent différemment.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "Adapté à votre profil cognitif",
                description:
                  "Des blends sélectionnés selon votre façon de penser : HPI, ADHD ou Hypersensible.",
              },
              {
                icon: Coffee,
                title: "Torréfacteurs artisanaux",
                description:
                  "Chaque café est créé par des artisans passionnés, en petits lots pour une qualité maximale.",
              },
              {
                icon: Heart,
                title: "Communauté neuroatypique",
                description:
                  "Rejoignez une communauté qui comprend votre singularité et partage vos sensibilités.",
              },
              {
                icon: Lock,
                title: "Paiement sécurisé",
                description:
                  "Vos paiements passent par Stripe. Nous ne stockons aucune donnée bancaire.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Identifiez votre profil",
                description:
                  "Faites notre quiz en 3 questions pour découvrir votre profil café : HPI, ADHD ou Hypersensible.",
              },
              {
                step: "2",
                title: "Choisissez vos capsules",
                description:
                  "Découvrez les créations de nos torréfacteurs artisanaux, avec des notes de dégustation détaillées.",
              },
              {
                step: "3",
                title: "Recevez chez vous",
                description:
                  "Livraison soignée, offerte en France métropolitaine.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roasters Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Les artisans derrière vos capsules
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Trois torréfacteurs fictifs, pour montrer à quoi ressemble une place de marché multi-vendeurs.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {ROASTERS.map((roaster) => (
              <div
                key={roaster.name}
                className="rounded-2xl border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={roaster.image}
                    alt={roaster.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full bg-muted object-cover"
                  />
                  <div>
                    <p className="font-semibold">{roaster.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {roaster.location}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                  &ldquo;{roaster.quote}&rdquo;
                </p>
                <span className="inline-flex self-start text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {roaster.specialty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes torréfacteur ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Rejoignez {APP_NAME} et vendez vos créations à une communauté
            passionnée. Commission de seulement 15% par vente.
          </p>
          <TrackedCta
            href="/vendor/landing"
            label="Créer mon espace vendeur"
            location="vendor-cta"
            variant="secondary"
          >
            Créer mon espace vendeur
          </TrackedCta>
        </div>
      </section>

    </>
  );
}

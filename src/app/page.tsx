import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, PRODUCT_CATEGORIES, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { Shield, Truck, RefreshCcw, Star, Quote, Users, Brain, Coffee, Heart, Lock, Lightbulb, Zap, Feather, Check, MapPin, type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/home/animated-counter";

const TESTIMONIALS = [
  {
    name: "Léa",
    profile: "HPI" as const,
    quote:
      "Depuis que j'ai trouvé mon blend HPI, mes sessions de deep work sont incomparables. Ce café comprend mon cerveau.",
  },
  {
    name: "Thomas",
    profile: "ADHD" as const,
    quote:
      "Le blend ADHD m'aide à canaliser mon énergie sans les tremblements du café classique. Un vrai game changer !",
  },
  {
    name: "Camille",
    profile: "Hypersensible" as const,
    quote:
      "Enfin un café doux qui ne m'agresse pas. Les notes florales sont subtiles et apaisantes. Je me sens comprise.",
  },
  {
    name: "Maxime",
    profile: "HPI" as const,
    quote:
      "La qualité artisanale se sent dès la première gorgée. Mon rituel café du matin a complètement changé.",
  },
] as const;

const PROFILE_COLORS: Record<string, string> = {
  HPI: "bg-primary/10 text-primary",
  ADHD: "bg-secondary/80 text-secondary-foreground",
  Hypersensible: "bg-accent text-accent-foreground",
};

const CATEGORY_DETAILS: Record<string, { icon: LucideIcon; benefit: string }> = {
  HPI: {
    icon: Lightbulb,
    benefit: "Stimule la pensée profonde et la créativité sans surexcitation",
  },
  ADHD: {
    icon: Zap,
    benefit: "Favorise la concentration et canalise l'énergie naturellement",
  },
  hypersensitive: {
    icon: Feather,
    benefit: "Des arômes doux qui respectent votre sensibilité sensorielle",
  },
};

const ROASTERS = [
  {
    name: "Antoine Dubois",
    location: "Lyon",
    specialty: "Blend HPI",
    quote:
      "Chaque grain est sélectionné pour stimuler la créativité sans surexcitation. La torréfaction lente révèle des arômes complexes.",
  },
  {
    name: "Marie Chen",
    location: "Bordeaux",
    specialty: "Blend ADHD",
    quote:
      "Je torréfie des cafés qui aident à canaliser l'énergie, pas à l'étouffer. L'équilibre est la clé.",
  },
  {
    name: "Julien Moreau",
    location: "Nantes",
    specialty: "Blend Hypersensible",
    quote:
      "La douceur est un art. Mes blends respectent chaque sensibilité avec des profils aromatiques subtils.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Votre cerveau mérite un café à sa hauteur
            </h1>
            <p className="text-lg md:text-2xl text-primary-foreground/80 mb-8 leading-relaxed">
              Des blends créés par des torréfacteurs artisanaux, adaptés aux
              profils <strong className="text-primary-foreground">HPI</strong>,{" "}
              <strong className="text-primary-foreground">ADHD</strong> et{" "}
              <strong className="text-primary-foreground">Hypersensibles</strong>.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Shield, label: "100% artisanal" },
                { icon: Truck, label: "Livraison offerte" },
                { icon: RefreshCcw, label: "Sans engagement" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <badge.icon className="h-4 w-4" />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 py-6 font-semibold"
                asChild
              >
                <Link href="/quiz">Faire le quiz</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 py-6"
                asChild
              >
                <Link href="/products">Tous nos cafés</Link>
              </Button>
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
                  <div className="rounded-2xl border p-8 transition-all hover:border-primary/50 hover:shadow-lg bg-card">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      {Icon ? (
                        <Icon className="h-8 w-8 text-primary" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {category.value.charAt(0)}
                        </span>
                      )}
                    </div>
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
            Découvrez les témoignages de ceux qui ont transformé leur rituel café.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border bg-card p-6 flex flex-col gap-4 relative"
              >
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {testimonial.name.charAt(0)}
                  </div>
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

          {/* Animated Counter */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-4xl md:text-5xl font-bold text-primary">
                <AnimatedCounter target={2847} />
              </span>
            </div>
            <p className="text-lg text-muted-foreground">
              esprits neuroatypiques nous font confiance
            </p>
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
                title: "Sans engagement",
                description:
                  "Commandez à la carte ou abonnez-vous. Annulez à tout moment, sans justification.",
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
                  "Livraison rapide et soignée. Abonnez-vous pour recevoir vos capsules préférées chaque mois.",
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

      {/* Subscriptions Teaser Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Recevez vos capsules chaque mois
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choisissez la formule qui correspond à votre consommation. Sans engagement, modifiable à tout moment.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-primary shadow-lg ring-2 ring-primary/20 relative"
                    : "bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Populaire
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price.toFixed(2).replace(".", ",")}€</span>
                  <span className="text-muted-foreground text-sm">/mois</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href="/subscriptions">Choisir {plan.name}</Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="link" asChild>
              <Link href="/subscriptions">Comparer tous les plans →</Link>
            </Button>
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
            Des torréfacteurs passionnés qui comprennent les besoins des esprits neuroatypiques.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {ROASTERS.map((roaster) => (
              <div
                key={roaster.name}
                className="rounded-2xl border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {roaster.name.charAt(0)}
                  </div>
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
          <Button size="lg" variant="secondary" asChild>
            <Link href="/vendor/landing">Créer mon espace vendeur</Link>
          </Button>
        </div>
      </section>

    </>
  );
}

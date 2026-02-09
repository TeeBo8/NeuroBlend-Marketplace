import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Shield, Truck, RefreshCcw } from "lucide-react";

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
                <Link href="/products">Trouver mon blend idéal</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 py-6"
                asChild
              >
                <Link href="/vendor/register">Devenir torréfacteur</Link>
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
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/products?category=${category.value}`}
                className="group"
              >
                <div className="rounded-2xl border p-8 transition-all hover:border-primary/50 hover:shadow-lg bg-card">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-primary">
                      {category.value.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </Link>
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
                  "Parcourez nos catégories HPI, ADHD ou Hypersensible pour trouver les capsules adaptées à vos besoins.",
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
            <Link href="/vendor/register">Créer mon espace vendeur</Link>
          </Button>
        </div>
      </section>

    </>
  );
}

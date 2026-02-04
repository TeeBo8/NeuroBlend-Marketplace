import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, PRODUCT_CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Le café qui comprend votre esprit
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              Des capsules de café créées spécialement pour les personnes
              neuroatypiques. HPI, ADHD, hypersensibles - trouvez le blend qui
              vous correspond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Découvrir nos produits</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/vendor/register">Devenir torréfacteur</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Trouvez votre profil
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
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
                <div className="rounded-2xl border border-gray-200 p-8 transition-all hover:border-purple-300 hover:shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-purple-600">
                      {category.value.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
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
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes torréfacteur ?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Rejoignez {APP_NAME} et vendez vos créations à une communauté
            passionnée. Commission de seulement 15% par vente.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/vendor/register">Créer mon espace vendeur</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">{APP_NAME}</h3>
              <p className="text-sm">
                La marketplace de café pour les esprits atypiques.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Tous les produits
                  </Link>
                </li>
                <li>
                  <Link href="/vendors" className="hover:text-white">
                    Nos torréfacteurs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Vendeurs</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/vendor/register" className="hover:text-white">
                    Devenir vendeur
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/dashboard" className="hover:text-white">
                    Espace vendeur
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

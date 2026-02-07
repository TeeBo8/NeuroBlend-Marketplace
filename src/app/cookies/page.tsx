import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Politique Cookies',
  description:
    'Politique d\u2019utilisation des cookies sur NeuroBlend. Types de cookies utilisés, finalités et gestion de vos préférences.',
};

const cookieTypes = [
  {
    name: 'Cookies essentiels',
    required: true,
    description:
      'Nécessaires au fonctionnement du site. Ils permettent la navigation, l\u2019authentification et la gestion du panier.',
    examples: 'Session utilisateur, panier, préférences de consentement',
    duration: 'Session ou 30 jours',
  },
  {
    name: 'Cookies fonctionnels',
    required: false,
    description:
      'Permettent de mémoriser vos préférences (langue, région) et d\u2019améliorer votre expérience utilisateur.',
    examples: 'Préférences d\u2019affichage, historique de navigation',
    duration: '1 an',
  },
  {
    name: 'Cookies analytiques',
    required: false,
    description:
      'Nous aident à comprendre comment vous utilisez le site afin d\u2019améliorer nos services. Les données sont anonymisées.',
    examples: 'Pages visitées, durée de session, taux de rebond',
    duration: '13 mois',
  },
];

export default function CookiesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Politique Cookies
          </h1>
          <p className="text-purple-100">
            Dernière mise à jour : 7 février 2026
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-gray prose-headings:text-gray-900 prose-a:text-purple-600 mb-12">
            <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil
              (ordinateur, tablette, smartphone) lors de votre visite sur notre
              site. Il permet de stocker des informations relatives à votre
              navigation.
            </p>

            <h2>Pourquoi utilisons-nous des cookies ?</h2>
            <p>
              {APP_NAME} utilise des cookies pour assurer le bon fonctionnement
              du site, améliorer votre expérience et analyser l&apos;utilisation de
              nos services. Nous respectons les recommandations de la CNIL en
              matière de consentement.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Types de cookies utilisés
          </h2>
          <div className="space-y-4 mb-12">
            {cookieTypes.map((cookie) => (
              <Card key={cookie.name}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {cookie.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        cookie.required
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cookie.required ? 'Obligatoire' : 'Optionnel'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {cookie.description}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      <strong>Exemples :</strong> {cookie.examples}
                    </p>
                    <p>
                      <strong>Durée :</strong> {cookie.duration}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="prose prose-gray prose-headings:text-gray-900 prose-a:text-purple-600">
            <h2>Comment gérer vos cookies ?</h2>
            <p>
              Vous pouvez à tout moment modifier vos préférences de cookies
              depuis les paramètres de votre navigateur :
            </p>
            <ul>
              <li>
                <strong>Chrome :</strong> Paramètres &gt; Confidentialité et
                sécurité &gt; Cookies
              </li>
              <li>
                <strong>Firefox :</strong> Préférences &gt; Vie privée et
                sécurité &gt; Cookies
              </li>
              <li>
                <strong>Safari :</strong> Préférences &gt; Confidentialité &gt;
                Cookies
              </li>
              <li>
                <strong>Edge :</strong> Paramètres &gt; Cookies et autorisations
                du site
              </li>
            </ul>
            <p>
              La désactivation des cookies essentiels peut affecter le
              fonctionnement du site (connexion, panier, etc.).
            </p>

            <h2>Contact</h2>
            <p>
              Pour toute question relative à notre utilisation des cookies,
              contactez-nous à{' '}
              <a href="mailto:contact@neuroblend.fr">contact@neuroblend.fr</a> ou
              consultez notre{' '}
              <a href="/privacy">Politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

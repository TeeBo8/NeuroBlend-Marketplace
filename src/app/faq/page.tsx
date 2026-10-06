import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { JsonLd } from '@/components/seo/json-ld';
import { faqPageSchema, breadcrumbSchema } from '@/lib/schemas';
import { PageHero } from '@/components/layout/page-hero';

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes sur le café neuroatypique',
  description:
    'Trouvez les réponses à vos questions sur NeuroBlend : commandes, livraison gratuite, abonnements sans engagement, profils HPI, ADHD et hypersensibles.',
  openGraph: {
    title: 'FAQ | NeuroBlend',
    description:
      'Commandes, abonnements, livraison, profils neuroatypiques : toutes les réponses à vos questions.',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: '/faq',
  },
};

const faqSections = [
  {
    title: 'Général',
    questions: [
      {
        q: `Qu'est-ce que ${APP_NAME} ?`,
        a: `${APP_NAME} est une marketplace de capsules de café artisanales dédiée aux personnes neuroatypiques (HPI, ADHD, hypersensibles). Nous connectons des torréfacteurs passionnés avec une communauté qui recherche un café d'exception.`,
      },
      {
        q: 'Qu\u2019est-ce qu\u2019un profil neuroatypique ?',
        a: 'La neurodiversité englobe les personnes HPI (Haut Potentiel Intellectuel), ADHD (Trouble du Déficit de l\u2019Attention avec ou sans Hyperactivité) et hypersensibles. Environ 15 à 20% de la population est concernée.',
      },
      {
        q: 'En quoi le café est-il adapté à mon profil ?',
        a: 'Nos torréfacteurs créent des blends en tenant compte des spécificités de chaque profil : intensité, notes aromatiques, taux de caféine. Par exemple, les blends Hypersensible privilégient des saveurs douces et équilibrées.',
      },
    ],
  },
  {
    title: 'Commandes & Livraison',
    questions: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Les commandes sont expédiées sous 2 à 3 jours ouvrés. La livraison prend ensuite 2 à 4 jours selon votre localisation en France métropolitaine.',
      },
      {
        q: 'La livraison est-elle gratuite ?',
        a: 'La livraison est offerte pour toute commande supérieure à 25\u20AC et pour tous les abonnements.',
      },
      {
        q: 'Puis-je retourner un produit ?',
        a: 'Vous disposez de 14 jours après réception pour retourner un produit non ouvert. Consultez notre page Livraison pour les détails.',
      },
    ],
  },
  {
    title: 'Abonnements',
    questions: [
      {
        q: 'Puis-je annuler à tout moment ?',
        a: 'Oui, sans engagement. Vous pouvez annuler depuis votre espace abonnement à tout moment. L\u2019annulation prend effet à la fin de la période en cours.',
      },
      {
        q: 'Quand vais-je recevoir mes capsules ?',
        a: 'Votre première livraison part sous 7 jours après la souscription. Ensuite, chaque mois à la même date.',
      },
      {
        q: 'Puis-je changer de formule ?',
        a: 'Absolument. Vous pouvez passer d\u2019une formule à une autre depuis le portail de gestion de votre abonnement.',
      },
    ],
  },
  {
    title: 'Torréfacteurs',
    questions: [
      {
        q: 'Comment devenir torréfacteur partenaire ?',
        a: `Créez un compte sur ${APP_NAME}, puis inscrivez-vous comme vendeur. L'inscription est gratuite — nous prélevons une commission de 15% sur chaque vente uniquement.`,
      },
      {
        q: 'Quels sont les frais pour les vendeurs ?',
        a: 'Aucun frais d\u2019inscription. La commission est de 15% par vente. Vous gardez le contrôle total de vos prix et de votre image.',
      },
      {
        q: 'Comment sont sélectionnés les torréfacteurs ?',
        a: 'Chaque demande est examinée par notre équipe. Nous privilégions les torréfacteurs artisanaux qui partagent notre engagement pour la qualité et la neurodiversité.',
      },
    ],
  },
];

export default function FaqPage() {
  const allQuestions = faqSections.flatMap((s) =>
    s.questions.map((faq) => ({ q: faq.q, a: faq.a }))
  );

  return (
    <>
      <JsonLd data={faqPageSchema(allQuestions)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ])}
      />

      {/* Hero */}
      <PageHero title="Questions fréquentes">
        Tout ce que vous devez savoir sur {APP_NAME}, nos produits et nos services.
      </PageHero>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {faqSections.map((section) => (
            <div key={section.title} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq) => (
                  <Card key={faq.q}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-2">
                        {faq.q}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="mt-16 text-center p-8 bg-primary/5 rounded-xl">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-muted-foreground mb-4">
              Notre équipe est là pour vous aider.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

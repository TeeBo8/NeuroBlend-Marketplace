import type { Metadata } from 'next';
import { Coffee, Heart, Brain, Users } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { PageHero } from '@/components/layout/page-hero';
import { DemoNotice } from '@/components/demo/demo-notice';

export const metadata: Metadata = {
  title: 'À propos — Notre histoire et nos valeurs',
  description:
    'Découvrez NeuroBlend, la première marketplace de capsules de café artisanales dédiée aux esprits neuroatypiques. HPI, ADHD, hypersensibles : chaque cerveau mérite un café à sa hauteur.',
  openGraph: {
    title: 'À propos de NeuroBlend',
    description:
      'La première marketplace de café artisanal dédiée aux esprits neuroatypiques.',
    type: 'website',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: '/about',
  },
};

const values = [
  {
    icon: Brain,
    title: 'Neurodiversité',
    description:
      'Nous croyons que chaque cerveau mérite une expérience café adaptée. HPI, ADHD, hypersensibles — chaque profil a ses besoins.',
  },
  {
    icon: Coffee,
    title: 'Artisanat',
    description:
      'Nos torréfacteurs partenaires sont des artisans passionnés qui créent des blends uniques, loin des capsules industrielles.',
  },
  {
    icon: Heart,
    title: 'Bienveillance',
    description:
      'Un espace sans jugement où la sensibilité est une force. Notre communauté accueille chaque esprit tel qu\u2019il est.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      'Plus qu\u2019une marketplace, un lieu de rencontre entre torréfacteurs engagés et esprits extraordinaires.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <PageHero title="Le café qui comprend votre esprit">
        {APP_NAME} est né d&apos;une conviction simple : les personnes neuroatypiques méritent un café pensé pour elles. Pas un café &laquo;&nbsp;adapté&nbsp;&raquo;, mais un café qui célèbre leur différence.
      </PageHero>
      <DemoNotice />

      {/* Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Notre histoire
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Tout a commencé avec une question : pourquoi le monde du café
                ignore-t-il 15 à 20% de la population ? Les personnes HPI,
                ADHD et hypersensibles ont un rapport unique à la caféine, aux
                saveurs et aux rituels. Leur sensibilité est un atout, pas un
                obstacle.
              </p>
              <p>
                {APP_NAME} connecte des torréfacteurs artisanaux avec une
                communauté qui partage une même exigence : un café d&apos;exception,
                créé avec soin, pour des esprits qui ne se contentent pas de
                l&apos;ordinaire.
              </p>
              <p>
                Chaque capsule référencée sur notre plateforme est le fruit
                du travail d&apos;un artisan passionné. Pas de production de masse,
                pas de compromis — juste du café pensé pour vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nos valeurs
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex gap-4 p-6 bg-card rounded-xl border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Notre mission</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Créer le premier espace où neurodiversité et café artisanal se
            rencontrent. Un grain à la fois.
          </p>
        </div>
      </section>
    </>
  );
}

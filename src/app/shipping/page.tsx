import type { Metadata } from 'next';
import { Truck, RotateCcw, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHero } from '@/components/layout/page-hero';
import { DemoNotice } from '@/components/demo/demo-notice';

export const metadata: Metadata = {
  title: 'Livraison & Retours — Délais et tarifs',
  description:
    'Informations sur la livraison NeuroBlend : livraison offerte dès 25€, délais de 2 à 5 jours, France métropolitaine. Politique de retour 14 jours.',
  alternates: {
    canonical: '/shipping',
  },
};

const deliveryOptions = [
  {
    icon: Truck,
    title: 'Livraison standard',
    delay: '3 à 5 jours ouvrés',
    price: '4,90\u20AC',
    detail: 'Gratuite dès 25\u20AC d\u2019achat',
  },
  {
    icon: Clock,
    title: 'Livraison express',
    delay: '1 à 2 jours ouvrés',
    price: '9,90\u20AC',
    detail: 'Commandez avant 14h',
  },
  {
    icon: MapPin,
    title: 'Point relais',
    delay: '3 à 5 jours ouvrés',
    price: '3,90\u20AC',
    detail: 'Gratuit dès 25\u20AC d\u2019achat',
  },
];

export default function ShippingPage() {
  return (
    <>
      {/* Hero */}
      <PageHero title="Livraison">
        Recevez vos capsules rapidement et en toute sécurité, partout en France.
      </PageHero>
      <DemoNotice />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Options */}
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Nos options de livraison
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {deliveryOptions.map((option) => (
              <Card key={option.title}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{option.delay}</p>
                  <p className="text-lg font-bold text-primary">
                    {option.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{option.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Zones */}
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Zones de livraison
          </h2>
          <div className="space-y-4 mb-16">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">
                  France métropolitaine
                </h3>
                <p className="text-sm text-muted-foreground">
                  Toutes nos options de livraison sont disponibles sur
                  l&apos;ensemble du territoire métropolitain.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">
                  DOM-TOM & International
                </h3>
                <p className="text-sm text-muted-foreground">
                  La livraison vers les DOM-TOM et l&apos;international n&apos;est pas
                  encore disponible. Nous y travaillons activement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Returns */}
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Retours & Remboursements
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Droit de rétractation :</strong>{' '}
                    Vous disposez de 14 jours après réception pour retourner un
                    produit non ouvert, conformément à la législation française.
                  </p>
                  <p>
                    <strong className="text-foreground">Produit endommagé :</strong>{' '}
                    Si votre commande arrive endommagée, contactez-nous sous 48h
                    avec des photos. Nous vous renvoyons le produit ou vous
                    remboursons intégralement.
                  </p>
                  <p>
                    <strong className="text-foreground">Remboursement :</strong>{' '}
                    Les remboursements sont effectués sous 7 jours ouvrés après
                    réception du retour, sur le moyen de paiement initial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

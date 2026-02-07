import type { Metadata } from 'next';
import { Truck, RotateCcw, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Livraison',
  description:
    'Informations sur la livraison NeuroBlend : délais, tarifs, zones de livraison et politique de retour.',
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
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Livraison</h1>
            <p className="text-xl text-purple-100">
              Recevez vos capsules rapidement et en toute sécurité, partout en
              France.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Options */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Nos options de livraison
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {deliveryOptions.map((option) => (
              <Card key={option.title}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <option.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{option.delay}</p>
                  <p className="text-lg font-bold text-purple-600">
                    {option.price}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{option.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Zones */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Zones de livraison
          </h2>
          <div className="space-y-4 mb-16">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">
                  France métropolitaine
                </h3>
                <p className="text-sm text-gray-600">
                  Toutes nos options de livraison sont disponibles sur
                  l&apos;ensemble du territoire métropolitain.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">
                  DOM-TOM & International
                </h3>
                <p className="text-sm text-gray-600">
                  La livraison vers les DOM-TOM et l&apos;international n&apos;est pas
                  encore disponible. Nous y travaillons activement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Returns */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Retours & Remboursements
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong className="text-gray-900">Droit de rétractation :</strong>{' '}
                    Vous disposez de 14 jours après réception pour retourner un
                    produit non ouvert, conformément à la législation française.
                  </p>
                  <p>
                    <strong className="text-gray-900">Produit endommagé :</strong>{' '}
                    Si votre commande arrive endommagée, contactez-nous sous 48h
                    avec des photos. Nous vous renvoyons le produit ou vous
                    remboursons intégralement.
                  </p>
                  <p>
                    <strong className="text-gray-900">Remboursement :</strong>{' '}
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

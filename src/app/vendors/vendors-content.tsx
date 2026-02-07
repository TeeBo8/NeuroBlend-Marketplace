'use client';

import { Coffee, ExternalLink, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import Link from 'next/link';
import Image from 'next/image';

export function VendorsContent() {
  const { data, isLoading } = api.vendor.list.useQuery({ limit: 50 });

  const vendors = data?.items ?? [];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos torréfacteurs
            </h1>
            <p className="text-xl text-purple-100">
              Des artisans passionnés qui créent des capsules d&apos;exception
              pour les esprits neuroatypiques.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Bientôt disponible
              </h2>
              <p className="text-gray-600 mb-6">
                Nos torréfacteurs partenaires préparent leurs créations.
                Revenez bientôt pour découvrir leurs profils et leurs capsules
                d&apos;exception.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/products">Voir les produits</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/vendor/register">Devenir torréfacteur</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {vendor.logo ? (
                          <Image
                            src={vendor.logo}
                            alt={vendor.businessName}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <Coffee className="w-7 h-7 text-purple-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {vendor.businessName}
                        </h3>
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-500 flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Site web
                          </a>
                        )}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {vendor.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Vendeur */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Vous êtes torréfacteur ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Rejoignez notre communauté de torréfacteurs artisanaux et vendez vos
            créations à des esprits extraordinaires. Inscription gratuite,
            commission de 15% uniquement.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/vendor/register">Devenir torréfacteur</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

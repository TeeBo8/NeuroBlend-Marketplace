'use client';

import { Coffee, ExternalLink, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/client';
import { LoadMore } from '@/components/load-more';
import Link from 'next/link';
import Image from 'next/image';

export function VendorsContent() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.vendor.list.useInfiniteQuery({ limit: 24 }, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const vendors = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/vendors/vendors-hero.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/images/hero/coffee-beans-hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-800 opacity-80" />
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos torréfacteurs
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Des artisans passionnés qui créent des capsules d&apos;exception
              pour les esprits neuroatypiques.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-64 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-primary/60" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Bientôt disponible
              </h2>
              <p className="text-muted-foreground mb-6">
                Nos torréfacteurs partenaires préparent leurs créations.
                Revenez bientôt pour découvrir leurs profils et leurs capsules
                d&apos;exception.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/products">Voir les produits</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/vendor/landing">Devenir torréfacteur</Link>
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
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {vendor.logo ? (
                          <Image
                            src={vendor.logo}
                            alt={vendor.businessName}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <Coffee className="w-7 h-7 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {vendor.businessName}
                        </h3>
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-primary flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Site web
                          </a>
                        )}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vendor.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-12">
              <LoadMore
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA Vendeur */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Vous êtes torréfacteur ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Rejoignez notre communauté de torréfacteurs artisanaux et vendez vos
            créations à des esprits extraordinaires. Inscription gratuite,
            commission de 15% uniquement.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/vendor/landing">Devenir torréfacteur</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

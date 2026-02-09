"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Coffee, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Marketplace error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Coffee className="w-12 h-12 text-primary/50" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Erreur de chargement
        </h1>
        <p className="text-muted-foreground mb-8">
          Impossible de charger cette page de la boutique. Le problème est
          probablement temporaire.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">
              <Home className="mr-2 h-4 w-4" />
              Tous les produits
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

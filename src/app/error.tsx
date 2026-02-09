"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        {/* Error icon */}
        <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Une erreur inattendue est survenue. Pas de panique, votre café est
          toujours en sécurité ! Essayez de recharger la page.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        {/* Error details for debugging */}
        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground">
            Code erreur : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

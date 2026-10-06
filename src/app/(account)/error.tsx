"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Account error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-red-500/15 flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-red-300" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Erreur dans votre espace
        </h1>
        <p className="text-muted-foreground mb-8">
          Impossible de charger votre espace client. Veuillez réessayer.
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
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

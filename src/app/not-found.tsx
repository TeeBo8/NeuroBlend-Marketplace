import Link from "next/link";
import { Coffee, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        {/* Animated coffee icon */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Coffee className="w-16 h-16 text-primary/60" />
          </div>
        </div>

        {/* 404 text */}
        <h1 className="text-8xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Page introuvable
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Oups ! Cette page semble s&apos;être évaporée comme un bon expresso.
          Peut-être cherchez-vous l&apos;une de ces pages ?
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">
              <Search className="mr-2 h-4 w-4" />
              Voir les produits
            </Link>
          </Button>
        </div>

        {/* Brand */}
        <p className="mt-12 text-sm text-muted-foreground">
          {APP_NAME} &mdash; Le café qui comprend votre esprit
        </p>
      </div>
    </div>
  );
}

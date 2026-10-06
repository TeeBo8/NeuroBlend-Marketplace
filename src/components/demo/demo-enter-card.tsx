'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DEMO_TEST_CARD, SANDBOX_TTL_HOURS } from '@/lib/demo';

const STEPS = [
  'Vous recevez trois comptes jetables : un client, un vendeur et un admin.',
  'Comme client, commandez un café et payez avec la carte de test.',
  'Passez vendeur pour expédier la commande, puis admin pour voir les chiffres et rembourser.',
];

// Remplace la page de connexion en mode démo.
export function DemoEnterCard() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const notice = params.get('limit')
    ? 'Vous avez ouvert plusieurs démos récemment. Réessayez un peu plus tard.'
    : params.get('full')
      ? 'La démo est complète pour le moment. Réessayez un peu plus tard.'
      : null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Essayer la démo</CardTitle>
        <CardDescription>
          Sans inscription et sans argent réel. Un clic et vous y êtes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {notice && (
          <p role="alert" className="text-sm text-destructive">
            {notice}
          </p>
        )}
        <form action="/api/demo/enter" method="post" onSubmit={() => setLoading(true)}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création de vos comptes...
              </>
            ) : (
              'Entrer dans la démo'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-center text-xs text-muted-foreground">
          Stripe en mode test · carte {DEMO_TEST_CARD} · vos comptes sont
          supprimés au bout de {SANDBOX_TTL_HOURS} heures
        </p>
      </CardFooter>
    </Card>
  );
}

import { isDemo } from '@/lib/demo';

// Encadré des pages légales et d'information en mode démo : ces textes
// décrivent une boutique qui n'existe pas, il faut le dire là où on les lit.
export function DemoNotice() {
  if (!isDemo) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 pt-8">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground/80">
        <strong className="text-foreground">Ce site est une démonstration technique.</strong>{' '}
        NeuroBlend est une marque fictive : aucune commande n&apos;est livrée,
        aucun paiement réel n&apos;est encaissé, et cette page est un exemple
        de contenu, sans valeur contractuelle.
      </p>
    </div>
  );
}

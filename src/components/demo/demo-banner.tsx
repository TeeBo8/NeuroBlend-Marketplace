'use client';

import { useSession } from '@/lib/auth-client';
import { DEMO_PERSONAS, DEMO_ROLES, DEMO_TEST_CARD } from '@/lib/demo';
import { cn } from '@/lib/utils';

const pill =
  'rounded-full border border-amber-500/40 px-3 py-1 text-xs font-semibold transition-colors';

// Bandeau affiché sur toutes les pages en mode démo : il rappelle que rien
// n'est réel, donne la carte de test et permet de changer de rôle.
export function DemoBanner() {
  const { data: session, isPending } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 text-sm">
      <div className="container mx-auto flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
        {session?.user ? (
          <>
            <form
              action="/api/demo/switch"
              method="post"
              className="flex flex-wrap items-center gap-2"
            >
              <span className="font-semibold text-foreground">Démo</span>
              <span className="hidden text-muted-foreground sm:inline">Vous êtes :</span>
              {DEMO_ROLES.map((option) => (
                <button
                  key={option}
                  type="submit"
                  name="role"
                  value={option}
                  disabled={option === role}
                  aria-pressed={option === role}
                  className={cn(
                    pill,
                    option === role
                      ? 'bg-amber-500/25 text-foreground'
                      : 'cursor-pointer bg-background text-muted-foreground hover:bg-amber-500/20 hover:text-foreground'
                  )}
                >
                  {DEMO_PERSONAS[option].label}
                </button>
              ))}
            </form>
            <p className="text-xs text-muted-foreground">
              Carte de test {DEMO_TEST_CARD}
              <span className="hidden sm:inline"> · date future · CVC au choix</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-foreground/80">
              <span className="font-semibold text-foreground">Démonstration technique</span>
              {' · '}marque fictive, aucune vraie commande
            </p>
            {!isPending && (
              <form action="/api/demo/enter" method="post">
                <button
                  type="submit"
                  className={cn(pill, 'cursor-pointer bg-background hover:bg-amber-500/20')}
                >
                  Entrer dans la démo
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

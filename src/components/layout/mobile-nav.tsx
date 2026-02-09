'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Coffee, LogOut, LayoutDashboard, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { useSession, signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Coffee className="h-4 w-4 text-primary-foreground" />
            </div>
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 mt-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '?');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  'px-4 py-3 text-base font-medium rounded-md transition-colors',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-6" />

        {session?.user ? (
          /* Logged in state */
          <div className="flex flex-col gap-1">
            <div className="px-4 py-2 mb-2">
              <p className="font-medium text-foreground">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
            <Link
              href="/account"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Mon tableau de bord
            </Link>
            {(session.user as { role?: string }).role === 'vendor' && (
              <Link
                href="/vendor/dashboard"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Store className="h-5 w-5" />
                Espace vendeur
              </Link>
            )}
            <Separator className="my-3" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </button>
          </div>
        ) : (
          /* Not logged in state */
          <>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/register" onClick={handleLinkClick}>
                  Inscription
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login" onClick={handleLinkClick}>
                  Connexion
                </Link>
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Vendor CTA */}
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Vous êtes torréfacteur ?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Rejoignez notre marketplace et vendez vos créations.
              </p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/vendor/register" onClick={handleLinkClick}>
                  Devenir vendeur
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

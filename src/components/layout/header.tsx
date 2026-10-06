'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Coffee, LogOut, LayoutDashboard, Store, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { useSession, signOut } from '@/lib/auth-client';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());

  // L'en-tête est sur toutes les pages : c'est lui qui relit le panier
  // enregistré dans le navigateur, une fois la page montée.
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '?');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart" aria-label="Panier">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Auth State */}
            {!isPending && (
              <>
                {session?.user ? (
                  /* User Menu - Logged in */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden md:flex">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {session.user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{session.user.name}</span>
                          <span className="text-xs text-muted-foreground">{session.user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Mon tableau de bord
                        </Link>
                      </DropdownMenuItem>
                      {((session.user as { role?: string }).role === 'vendor' || (session.user as { role?: string }).role === 'admin') && (
                        <DropdownMenuItem asChild>
                          <Link href="/vendor/dashboard">
                            <Store className="mr-2 h-4 w-4" />
                            Espace vendeur
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(session.user as { role?: string }).role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">
                            <Shield className="mr-2 h-4 w-4" />
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* Auth Buttons - Not logged in */
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register">Inscription</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Trigger */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

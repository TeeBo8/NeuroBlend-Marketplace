'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Coffee, LogOut, LayoutDashboard, Store } from 'lucide-react';
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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
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
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart" aria-label="Panier">
                <ShoppingCart className="h-5 w-5" />
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-sm font-medium text-purple-600">
                            {session.user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{session.user.name}</span>
                          <span className="text-xs text-gray-500">{session.user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Mon tableau de bord
                        </Link>
                      </DropdownMenuItem>
                      {(session.user as { role?: string }).role === 'vendor' && (
                        <DropdownMenuItem asChild>
                          <Link href="/vendor/dashboard">
                            <Store className="mr-2 h-4 w-4" />
                            Espace vendeur
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

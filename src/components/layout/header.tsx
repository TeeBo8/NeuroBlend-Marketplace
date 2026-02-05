'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

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
                {/* Cart count badge - will be dynamic later */}
              </Link>
            </Button>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Inscription</Link>
              </Button>
            </div>

            {/* User Menu (when logged in) - placeholder for now */}
            {/* <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard" aria-label="Mon compte">
                <User className="h-5 w-5" />
              </Link>
            </Button> */}

            {/* Mobile Menu Trigger */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

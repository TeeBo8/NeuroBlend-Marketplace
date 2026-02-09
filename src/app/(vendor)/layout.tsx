'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Store,
  LogOut,
  Lock,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const VENDOR_NAV = [
  { href: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Mes produits', icon: Package },
  { href: '/vendor/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/vendor/payouts', label: 'Paiements', icon: CreditCard },
] as const;

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isRegisterPage = pathname === '/vendor/register';

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-primary/50" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Connexion requise
          </h1>
          <p className="text-muted-foreground mb-8">
            Connectez-vous pour accéder à l&apos;espace vendeur.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Register page: centered layout, no sidebar, any logged-in user
  if (isRegisterPage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">{children}</div>
      </div>
    );
  }

  // For other vendor pages, check vendor role
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== 'vendor' && userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Store className="w-12 h-12 text-primary/50" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Espace vendeur
          </h1>
          <p className="text-muted-foreground mb-8">
            Vous devez être vendeur pour accéder à cet espace. Inscrivez-vous pour commencer à vendre vos produits.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/vendor/register">Devenir vendeur</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'V';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/vendor/dashboard') return pathname === '/vendor/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="md:sticky md:top-24 space-y-6">
            {/* Vendor info */}
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={user.image || undefined} alt={user.name || 'Avatar'} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {user.name || 'Vendeur'}
                </p>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  Vendeur
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex overflow-x-auto md:flex-col gap-1 -mx-1 px-1 pb-2 md:pb-0">
              {VENDOR_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 md:gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                      active
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Separator className="hidden md:block" />

            {/* Quick action */}
            <Button
              asChild
              size="sm"
              className="hidden md:flex w-full bg-primary hover:bg-primary/90"
            >
              <Link href="/vendor/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau produit
              </Link>
            </Button>

            <Separator className="hidden md:block" />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

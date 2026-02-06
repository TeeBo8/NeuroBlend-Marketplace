'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  Shield,
  LogOut,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/vendors', label: 'Vendeurs', icon: Store },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/products', label: 'Produits', icon: Package },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-purple-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-500 mb-8">
            Connectez-vous pour accéder au panneau d&apos;administration.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-red-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-500 mb-8">
            Vous devez être administrateur pour accéder à cette section.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/">Retour à l&apos;accueil</Link>
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
    : user.email?.[0]?.toUpperCase() || 'A';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="md:sticky md:top-24 space-y-6">
            {/* Admin info */}
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-12 w-12 border-2 border-red-100">
                <AvatarImage src={user.image || undefined} alt={user.name || 'Avatar'} />
                <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.name || 'Admin'}
                </p>
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  Administrateur
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex md:flex-col gap-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Separator className="hidden md:block" />

            {/* Back to site */}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden md:flex w-full"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au site
              </Link>
            </Button>

            <Separator className="hidden md:block" />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
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

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Auth Logo */}
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Coffee className="h-7 w-7 text-white" />
            </div>
          </Link>
          <Link href="/" className="text-2xl font-bold text-foreground">
            {APP_NAME}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

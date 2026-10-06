import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  title: ReactNode;
  /** Texte d'introduction sous le titre. */
  children?: ReactNode;
  centered?: boolean;
};

/**
 * Bandeau de titre des pages : un aplat discret aux couleurs du thème, le
 * même partout, en clair comme en sombre.
 */
export function PageHero({ title, children, centered = false }: PageHeroProps) {
  return (
    <section className="border-b bg-secondary/40">
      <div
        className={cn(
          'container mx-auto px-4 py-14 md:py-20',
          centered && 'text-center'
        )}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {children && (
          <p
            className={cn(
              'mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground',
              centered && 'mx-auto'
            )}
          >
            {children}
          </p>
        )}
      </div>
    </section>
  );
}

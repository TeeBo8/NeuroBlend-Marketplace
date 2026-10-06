'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LoadMoreProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

/** Bouton « Charger plus » d'une liste paginée. Disparaît à la dernière page. */
export function LoadMore({ hasNextPage, isFetchingNextPage, onLoadMore }: LoadMoreProps) {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center">
      <Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          'Charger plus'
        )}
      </Button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/client';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import Link from 'next/link';

function InteractiveStarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRate(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'w-7 h-7 transition-colors',
                starValue <= (hovered || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
      )}
    </div>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const utils = api.useUtils();

  const createReview = api.review.create.useMutation({
    onSuccess: () => {
      toast.success('Merci pour votre avis !');
      setRating(0);
      setTitle('');
      setComment('');
      utils.product.byId.invalidate({ id: productId });
      utils.review.byProduct.invalidate({ productId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    createReview.mutate({
      productId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
    });
  };

  if (!session?.user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Star className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-muted-foreground mb-3">
            Connectez-vous pour laisser un avis
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Laisser un avis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Votre note <span className="text-destructive">*</span>
            </label>
            <InteractiveStarRating rating={rating} onRate={setRating} />
          </div>

          <div className="space-y-2">
            <label htmlFor="review-title" className="text-sm font-medium text-foreground">
              Titre
            </label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumez votre expérience"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
              Commentaire
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre avis sur ce produit..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={createReview.isPending || rating === 0}
          >
            {createReview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publier mon avis
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

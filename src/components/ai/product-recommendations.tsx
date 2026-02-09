'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ProductRecommendationsProps = {
  category?: string | null;
  currentProductName: string;
};

export function ProductRecommendations({
  category,
  currentProductName,
}: ProductRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Je regarde le produit "${currentProductName}" dans la catégorie ${category || 'générale'}. Donne-moi un court conseil personnalisé (2-3 phrases max) sur comment ce type de capsule peut m'aider selon mon profil neuroatypique, et suggère quel moment de la journée serait idéal pour la déguster.`,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setRecommendation(text);
      }
    } catch {
      setRecommendation(
        'Impossible de charger la recommandation pour le moment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (recommendation) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Conseil NeuroBlend AI
            </span>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Gemini
            </Badge>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {recommendation}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={getRecommendation}
      disabled={isLoading}
      className="border-primary/30 text-primary hover:bg-primary/5"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyse en cours...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Conseil personnalisé AI
        </>
      )}
    </Button>
  );
}

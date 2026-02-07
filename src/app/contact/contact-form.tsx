'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending (replace with Resend integration later)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSent(true);
    setIsLoading(false);
    toast.success('Message envoyé ! Nous vous répondrons sous 24-48h.');
  };

  if (isSent) {
    return (
      <div className="text-center py-12 px-4 bg-purple-50 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Message envoyé !
        </h3>
        <p className="text-gray-600 mb-4">
          Merci pour votre message. Nous vous répondrons sous 24 à 48 heures.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSent(false)}
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            placeholder="Votre nom"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Sujet</Label>
        <Input
          id="subject"
          placeholder="De quoi souhaitez-vous parler ?"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Votre message..."
          rows={5}
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </>
        )}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-sm text-primary font-medium">
        Merci pour votre inscription !
      </p>
    );
  }

  return (
    <form
      className="flex gap-2 w-full md:w-auto"
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
      }}
    >
      <Input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="md:w-64"
      />
      <Button type="submit" size="sm" className="shrink-0">
        <Send className="h-4 w-4 mr-2" />
        S&apos;inscrire
      </Button>
    </form>
  );
}

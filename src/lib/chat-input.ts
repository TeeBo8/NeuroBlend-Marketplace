import { z } from 'zod';
import type { UIMessage } from 'ai';

export const MAX_CHAT_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 1000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.string(),
        parts: z.array(z.looseObject({ type: z.string() })).max(20),
      })
    )
    .min(1)
    .max(MAX_CHAT_MESSAGES),
});

export type ChatMessage = Omit<UIMessage, 'id'>;

/**
 * Valide et nettoie l'historique envoyé par le navigateur avant de le passer
 * au modèle. Renvoie null si la requête est à refuser.
 *
 * On ne garde que le texte des messages "user" et "assistant" : le client ne
 * peut ni glisser un message "system" pour remplacer les consignes, ni envoyer
 * des pièces jointes ou des résultats d'outils.
 */
export function parseChatMessages(body: unknown): ChatMessage[] | null {
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return null;

  const messages: ChatMessage[] = [];

  for (const message of parsed.data.messages) {
    if (message.role !== 'user' && message.role !== 'assistant') return null;

    const text = message.parts
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text as string)
      .join('\n')
      .trim();

    if (text.length > MAX_MESSAGE_LENGTH) return null;
    if (text.length === 0) continue;

    messages.push({ role: message.role, parts: [{ type: 'text', text }] });
  }

  if (messages.at(-1)?.role !== 'user') return null;

  return messages;
}

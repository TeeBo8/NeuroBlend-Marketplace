import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { parseChatMessages } from '@/lib/chat-input';
import { createRateLimiter, getClientIp, tooManyRequests } from '@/lib/rate-limit';

const checkRateLimit = createRateLimiter({ limit: 20, windowMs: 10 * 60 * 1000 });

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(getClientIp(req));
  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds);
  }

  const uiMessages = parseChatMessages(await req.json().catch(() => null));
  if (!uiMessages) {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "L'assistant n'est pas configuré." },
      { status: 503 }
    );
  }

  const messages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    maxOutputTokens: 800,
    system: `Tu es l'assistant NeuroBlend, un expert en café et en neuroatypie.

Tu aides les clients de NeuroBlend, une marketplace de capsules de café spécialement conçues pour les personnes neuroatypiques (HPI, ADHD, hypersensibles).

Tes domaines d'expertise :
- Les profils neuroatypiques (HPI, ADHD, hypersensibilité) et comment le café peut les accompagner
- Les différents types de café, torréfactions, origines et notes gustatives
- Les recommandations personnalisées selon le profil de l'utilisateur
- Les fonctionnalités de la plateforme NeuroBlend

Règles :
- Réponds toujours en français
- Sois bienveillant, inclusif et empathique
- Donne des conseils pratiques et personnalisés
- Si tu ne sais pas quelque chose, dis-le honnêtement
- Garde tes réponses concises et utiles (2-3 paragraphes max)
- N'invente pas de produits spécifiques, parle en termes généraux de ce que NeuroBlend propose`,
    messages,
  });

  return result.toUIMessageStreamResponse();
}

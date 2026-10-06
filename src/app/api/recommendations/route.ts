import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { products } from '@/server/db/schema';
import { createRateLimiter, getClientIp, tooManyRequests } from '@/lib/rate-limit';

const checkRateLimit = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

const bodySchema = z.object({ productId: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(getClientIp(req));
  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds);
  }

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  // Le prompt est construit ici, à partir du produit en base : le navigateur
  // n'envoie qu'un identifiant et ne peut pas faire dire autre chose au modèle.
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, body.data.productId), eq(products.active, true)),
    columns: { name: true, category: true },
  });
  if (!product) {
    return Response.json({ error: 'Produit introuvable.' }, { status: 404 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "L'assistant n'est pas configuré." },
      { status: 503 }
    );
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    maxOutputTokens: 400,
    system: `Tu es l'assistant NeuroBlend, un expert en café et en neuroatypie.
Tu donnes des conseils courts et personnalisés sur les capsules de café pour les personnes neuroatypiques.
Réponds toujours en français, en 2-3 phrases maximum.`,
    prompt: `Je regarde le produit "${product.name}" dans la catégorie ${product.category ?? 'générale'}. Donne-moi un court conseil personnalisé (2-3 phrases max) sur comment ce type de capsule peut m'aider selon mon profil neuroatypique, et suggère quel moment de la journée serait idéal pour la déguster.`,
  });

  return result.toTextStreamResponse();
}

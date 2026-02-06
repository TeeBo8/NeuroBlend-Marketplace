import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `Tu es l'assistant NeuroBlend, un expert en café et en neuroatypie.
Tu donnes des conseils courts et personnalisés sur les capsules de café pour les personnes neuroatypiques.
Réponds toujours en français, en 2-3 phrases maximum.`,
    prompt,
  });

  return result.toTextStreamResponse();
}

import { NextResponse } from 'next/server';
import { isDemo } from '@/lib/demo';
import { deleteExpiredSandboxes, resetSeedStock } from '@/server/demo/sandbox';

// Nettoyage nocturne de la démo, appelé par la tâche planifiée de Vercel
// (vercel.json), qui envoie CRON_SECRET dans l'en-tête Authorization.
export async function GET(request: Request) {
  if (!isDemo) return new NextResponse(null, { status: 404 });

  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }

  const deletedAccounts = await deleteExpiredSandboxes();
  await resetSeedStock();
  return NextResponse.json({ deletedAccounts });
}

import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import { DEMO_PERSONAS, isDemo } from '@/lib/demo';
import { isSameOrigin, redirectTo } from '@/server/demo/http';
import {
  createSandbox,
  deleteExpiredSandboxes,
  getSandboxId,
  isDemoFull,
  isIpOverLimit,
  resetSeedStock,
  signInSandboxRole,
} from '@/server/demo/sandbox';

// Entrée dans la démo : crée les trois comptes du visiteur et le connecte
// comme client.
export async function POST(request: Request) {
  if (!isDemo) return new NextResponse(null, { status: 404 });
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });

  // Le visiteur a déjà un bac à sable ouvert : on le garde.
  const session = await auth.api.getSession({ headers: request.headers });
  if (session && (await getSandboxId(session.user.id))) {
    return redirectTo(request, DEMO_PERSONAS.customer.home);
  }

  if (await isIpOverLimit(request.headers)) return redirectTo(request, '/login?limit=1');

  // Les bacs à sable expirés sont retirés à chaque entrée, sans attendre la
  // tâche nocturne : le plafond ne compte ainsi que des comptes encore valides.
  await deleteExpiredSandboxes();
  if (await isDemoFull()) return redirectTo(request, '/login?full=1');

  // Chaque visiteur trouve un décor en stock, même si le précédent a tout acheté.
  await resetSeedStock();

  const sandboxId = await createSandbox(request.headers);
  const cookies = await signInSandboxRole(sandboxId, 'customer', request.headers);
  if (!cookies) return redirectTo(request, '/login');
  return redirectTo(request, DEMO_PERSONAS.customer.home, cookies);
}

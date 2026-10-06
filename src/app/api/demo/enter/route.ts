import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import { DEMO_PERSONAS, isDemo } from '@/lib/demo';
import { isSameOrigin, redirectTo } from '@/server/demo/http';
import { createSandbox, getSandboxId, signInSandboxRole } from '@/server/demo/sandbox';

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

  const sandboxId = await createSandbox();
  const cookies = await signInSandboxRole(sandboxId, 'customer', request.headers);
  if (!cookies) return redirectTo(request, '/login');
  return redirectTo(request, DEMO_PERSONAS.customer.home, cookies);
}

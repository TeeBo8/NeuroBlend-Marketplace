import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import { DEMO_PERSONAS, isDemo, isDemoRole } from '@/lib/demo';
import { isSameOrigin, redirectTo } from '@/server/demo/http';
import { getSandboxId, revokeSessions, signInSandboxRole } from '@/server/demo/sandbox';

// Changement de rôle : connecte le visiteur sur un autre compte de son bac à
// sable. Le rôle demandé arrive par le formulaire du bandeau.
export async function POST(request: Request) {
  if (!isDemo) return new NextResponse(null, { status: 404 });
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });

  const role = (await request.formData()).get('role');
  if (!isDemoRole(role)) return new NextResponse(null, { status: 400 });

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return redirectTo(request, '/login');

  const sandboxId = await getSandboxId(session.user.id);
  if (!sandboxId) return redirectTo(request, '/');

  // Déjà dans ce rôle : fermer les sessions du compte fermerait aussi la nouvelle.
  if ((session.user as { role?: string }).role === role) {
    return redirectTo(request, DEMO_PERSONAS[role].home);
  }

  const cookies = await signInSandboxRole(sandboxId, role, request.headers);
  if (!cookies) return redirectTo(request, '/login');

  await revokeSessions(session.user.id);
  return redirectTo(request, DEMO_PERSONAS[role].home, cookies);
}

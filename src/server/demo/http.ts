import { NextResponse } from 'next/server';

/** Refuse les POST venant d'un autre site (formulaire piégé). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

/** Redirection après un POST de formulaire (303), avec les cookies de session éventuels. */
export function redirectTo(request: Request, path: string, cookies: string[] = []): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  for (const cookie of cookies) response.headers.append('set-cookie', cookie);
  return response;
}

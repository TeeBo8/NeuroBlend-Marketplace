import { auth } from '@/server/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';
import { isDemo, isDemoAuthRouteAllowed } from '@/lib/demo';

const handlers = toNextJsHandler(auth);

// En démo, l'inscription et la connexion publiques sont fermées ici, côté
// serveur : cacher les formulaires ne suffirait pas.
function guarded(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    if (isDemo && !isDemoAuthRouteAllowed(request.method, new URL(request.url).pathname)) {
      return Response.json(
        { message: 'Indisponible dans la démonstration.' },
        { status: 403 }
      );
    }
    return handler(request);
  };
}

export const GET = guarded(handlers.GET);
export const POST = guarded(handlers.POST);

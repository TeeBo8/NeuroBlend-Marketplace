type Bucket = { count: number; resetAt: number };

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const MAX_TRACKED_KEYS = 10_000;

/**
 * Limite de débit en mémoire, par fenêtre fixe.
 *
 * Le compteur vit dans l'instance du serveur : sur Vercel, chaque instance a
 * le sien. C'est un premier filet contre un script qui boucle sur une route
 * coûteuse, pas une garantie stricte. Pour une limite partagée entre
 * instances, il faudrait un stockage externe (Redis) ou le pare-feu Vercel.
 */
export function createRateLimiter(options: { limit: number; windowMs: number }) {
  const { limit, windowMs } = options;
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(k);
      }
      // Toujours plein : uniquement des fenêtres en cours, on repart de zéro
      // plutôt que de laisser la mémoire grossir sans fin.
      if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    }

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

/** Adresse du visiteur, telle que la transmet le proxy de l'hébergeur. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: 'Trop de requêtes. Réessayez dans quelques minutes.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}

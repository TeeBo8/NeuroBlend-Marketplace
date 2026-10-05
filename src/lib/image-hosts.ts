/**
 * Hôtes dont next/image accepte d'optimiser les images : ceux d'UploadThing,
 * où arrivent les photos envoyées par les vendeurs. Sert à la fois à
 * next.config.ts et à la validation des URL enregistrées en base.
 */
export const IMAGE_HOSTS = ['utfs.io', '*.ufs.sh'] as const;

export function isAllowedImageUrl(value: string): boolean {
  // Images statiques du dossier public/, utilisées par les produits de démo.
  if (value.startsWith('/images/')) return true;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  return IMAGE_HOSTS.some((host) =>
    host.startsWith('*.')
      ? url.hostname.endsWith(host.slice(1))
      : url.hostname === host
  );
}

import { z } from 'zod';

/**
 * Adresse de livraison d'une commande. Le même schéma sert au formulaire de
 * paiement et au serveur : le client voit l'erreur avant l'envoi, et le
 * serveur revérifie quand même, puisqu'on peut l'appeler sans le formulaire.
 */
const field = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} doit contenir au moins ${min} caractères`)
    .max(max, `${label} ne peut pas dépasser ${max} caractères`);

export const shippingAddressSchema = z.object({
  name: field('Le nom', 2, 100),
  address: field("L'adresse", 5, 200),
  city: field('La ville', 2, 100),
  postalCode: field('Le code postal', 2, 20),
  country: field('Le pays', 2, 60),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/** Premier message d'erreur de l'adresse, ou null si elle est valide. */
export function firstAddressError(address: unknown): string | null {
  const result = shippingAddressSchema.safeParse(address);
  return result.success ? null : result.error.issues[0].message;
}

/**
 * Montants d'une commande, calculés en centimes entiers.
 *
 * Les prix sont stockés en base comme des décimaux ("12.90"). Les additionner
 * en nombres flottants donne des erreurs d'arrondi (0.1 + 0.2 !== 0.3) : on
 * convertit donc tout en centimes avant le moindre calcul.
 */

export type OrderLine = { unitPrice: string; quantity: number };

export type OrderTotals = {
  subtotalCents: number;
  commissionCents: number;
  lineTotalsCents: number[];
};

export function toCents(price: string): number {
  const cents = Math.round(Number(price) * 100);
  if (!Number.isFinite(cents) || cents < 0) {
    throw new Error(`Prix invalide : ${price}`);
  }
  return cents;
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function computeOrderTotals(
  lines: OrderLine[],
  commissionRatePercent: string | null
): OrderTotals {
  const lineTotalsCents = lines.map(
    (line) => toCents(line.unitPrice) * line.quantity
  );
  const subtotalCents = lineTotalsCents.reduce((sum, cents) => sum + cents, 0);

  const rate = Number(commissionRatePercent ?? '15');
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error(`Taux de commission invalide : ${commissionRatePercent}`);
  }
  const commissionCents = Math.round((subtotalCents * rate) / 100);

  return { subtotalCents, commissionCents, lineTotalsCents };
}

/** Regroupe les lignes d'un panier qui portent sur le même produit. */
export function mergeCartItems<T extends { productId: string; quantity: number }>(
  items: T[]
): { productId: string; quantity: number }[] {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
}

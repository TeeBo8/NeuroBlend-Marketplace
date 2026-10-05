import { describe, it, expect } from "vitest";
import {
  computeOrderTotals,
  fromCents,
  mergeCartItems,
  toCents,
} from "@/lib/order-totals";

describe("toCents / fromCents", () => {
  it("convertit sans erreur d'arrondi", () => {
    expect(toCents("12.90")).toBe(1290);
    expect(toCents("0.10")).toBe(10);
    expect(toCents("19.99")).toBe(1999);
    expect(fromCents(1290)).toBe("12.90");
    expect(fromCents(5)).toBe("0.05");
  });

  it("refuse un prix invalide ou négatif", () => {
    expect(() => toCents("abc")).toThrow();
    expect(() => toCents("-1.00")).toThrow();
  });
});

describe("computeOrderTotals", () => {
  it("additionne les lignes en centimes", () => {
    const totals = computeOrderTotals(
      [
        { unitPrice: "12.90", quantity: 3 },
        { unitPrice: "0.10", quantity: 3 },
      ],
      "15.00"
    );

    expect(totals.lineTotalsCents).toEqual([3870, 30]);
    expect(totals.subtotalCents).toBe(3900);
    expect(totals.commissionCents).toBe(585);
  });

  it("ne dérive pas là où les flottants dérivent", () => {
    // 0.1 + 0.2 vaut 0.30000000000000004 en flottant
    const totals = computeOrderTotals(
      [
        { unitPrice: "0.10", quantity: 1 },
        { unitPrice: "0.20", quantity: 1 },
      ],
      "0"
    );

    expect(totals.subtotalCents).toBe(30);
  });

  it("arrondit la commission au centime", () => {
    // 15 % de 9,99 € = 1,4985 €
    expect(computeOrderTotals([{ unitPrice: "9.99", quantity: 1 }], "15.00").commissionCents).toBe(150);
    // 10 % de 0,05 € = 0,005 €
    expect(computeOrderTotals([{ unitPrice: "0.05", quantity: 1 }], "10.00").commissionCents).toBe(1);
  });

  it("applique 15 % quand le vendeur n'a pas de taux", () => {
    expect(computeOrderTotals([{ unitPrice: "100.00", quantity: 1 }], null).commissionCents).toBe(1500);
  });

  it("refuse un taux de commission aberrant", () => {
    const lines = [{ unitPrice: "10.00", quantity: 1 }];

    expect(() => computeOrderTotals(lines, "150")).toThrow();
    expect(() => computeOrderTotals(lines, "-5")).toThrow();
    expect(() => computeOrderTotals(lines, "abc")).toThrow();
  });
});

describe("mergeCartItems", () => {
  it("regroupe les lignes du même produit", () => {
    expect(
      mergeCartItems([
        { productId: "a", quantity: 1 },
        { productId: "b", quantity: 2 },
        { productId: "a", quantity: 3 },
      ])
    ).toEqual([
      { productId: "a", quantity: 4 },
      { productId: "b", quantity: 2 },
    ]);
  });
});

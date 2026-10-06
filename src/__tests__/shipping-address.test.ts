import { describe, it, expect } from "vitest";
import { shippingAddressSchema, firstAddressError } from "@/lib/shipping-address";

const valid = {
  name: "Léa Client",
  address: "12 rue des Cafés",
  city: "Bordeaux",
  postalCode: "33000",
  country: "France",
};

describe("shippingAddressSchema", () => {
  it("accepte une adresse complète et retire les espaces autour", () => {
    const result = shippingAddressSchema.parse({ ...valid, name: "  Léa Client  " });

    expect(result).toEqual(valid);
  });

  it.each([
    ["name", "L", "Le nom doit contenir au moins 2 caractères"],
    ["address", "test", "L'adresse doit contenir au moins 5 caractères"],
    ["city", "B", "La ville doit contenir au moins 2 caractères"],
    ["postalCode", "3", "Le code postal doit contenir au moins 2 caractères"],
    ["country", " ", "Le pays doit contenir au moins 2 caractères"],
    ["address", "a".repeat(201), "L'adresse ne peut pas dépasser 200 caractères"],
  ])("explique en français ce qui ne va pas dans %s", (field, value, message) => {
    expect(firstAddressError({ ...valid, [field]: value })).toBe(message);
  });

  it("ne signale rien pour une adresse valide", () => {
    expect(firstAddressError(valid)).toBeNull();
  });
});

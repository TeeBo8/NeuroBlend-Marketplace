import { describe, it, expect } from "vitest";
import { resolveSiteUrl, resolveTrustedOrigins } from "@/lib/site-url";

describe("resolveSiteUrl", () => {
  it("prend NEXT_PUBLIC_APP_URL, sans barre finale", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_APP_URL: "https://exemple.fr/" })).toBe("https://exemple.fr");
  });

  it("retombe sur localhost sans aucune variable", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("prend l'adresse de la branche sur un aperçu Vercel, même si NEXT_PUBLIC_APP_URL est définie", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_APP_URL: "https://exemple.fr",
        VERCEL_ENV: "preview",
        VERCEL_BRANCH_URL: "site-git-ma-branche.vercel.app",
        VERCEL_URL: "site-abc123.vercel.app",
      })
    ).toBe("https://site-git-ma-branche.vercel.app");
  });

  it("garde NEXT_PUBLIC_APP_URL en production sur Vercel", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_APP_URL: "https://exemple.fr",
        VERCEL_ENV: "production",
        VERCEL_URL: "site-abc123.vercel.app",
      })
    ).toBe("https://exemple.fr");
  });
});

describe("resolveTrustedOrigins", () => {
  it("accepte les deux adresses d'un aperçu, sans doublon", () => {
    expect(
      resolveTrustedOrigins({
        VERCEL_ENV: "preview",
        VERCEL_BRANCH_URL: "site-git-ma-branche.vercel.app",
        VERCEL_URL: "site-abc123.vercel.app",
      })
    ).toEqual(["https://site-git-ma-branche.vercel.app", "https://site-abc123.vercel.app"]);
  });

  it("n'accepte que l'adresse du site hors aperçu", () => {
    expect(resolveTrustedOrigins({ NEXT_PUBLIC_APP_URL: "https://exemple.fr" })).toEqual([
      "https://exemple.fr",
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { createRateLimiter, getClientIp, tooManyRequests } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("laisse passer jusqu'à la limite puis bloque", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });

    expect(check("a", 0).allowed).toBe(true);
    expect(check("a", 1).allowed).toBe(true);
    expect(check("a", 2).allowed).toBe(true);
    expect(check("a", 3).allowed).toBe(false);
  });

  it("indique dans combien de secondes réessayer", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check("a", 0);

    expect(check("a", 15_000).retryAfterSeconds).toBe(45);
  });

  it("compte chaque clé séparément", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check("a", 0);

    expect(check("b", 0).allowed).toBe(true);
    expect(check("a", 0).allowed).toBe(false);
  });

  it("repart de zéro quand la fenêtre est écoulée", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check("a", 0);

    expect(check("a", 59_999).allowed).toBe(false);
    expect(check("a", 60_000).allowed).toBe(true);
  });

  it("ne compte pas les requêtes refusées", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check("a", 0);
    for (let i = 0; i < 50; i++) check("a", 1_000);

    expect(check("a", 60_000).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  const request = (headers: Record<string, string>) =>
    new Request("http://localhost/api", { headers });

  it("prend la première adresse de x-forwarded-for", () => {
    expect(getClientIp(request({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("se rabat sur x-real-ip puis sur une clé commune", () => {
    expect(getClientIp(request({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(request({}))).toBe("unknown");
  });
});

describe("tooManyRequests", () => {
  it("répond 429 avec l'en-tête Retry-After", () => {
    const response = tooManyRequests(42);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
  });
});

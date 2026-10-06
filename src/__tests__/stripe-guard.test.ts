// @vitest-environment node
import { describe, it, expect, afterEach, vi } from "vitest";

const demo = vi.hoisted(() => ({ isDemo: true }));
vi.mock("@/lib/demo", () => ({
  get isDemo() {
    return demo.isDemo;
  },
}));

const { getStripe } = await import("@/server/stripe");

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  demo.isDemo = true;
});

describe("clé Stripe en mode démo", () => {
  it("refuse une clé qui n'est pas de test", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_exemple";

    expect(() => getStripe()).toThrow(/clé de test/);
  });

  it("accepte une clé de test", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_exemple";

    expect(() => getStripe()).not.toThrow();
  });

  it("ne restreint rien hors démo", () => {
    demo.isDemo = false;
    process.env.STRIPE_SECRET_KEY = "sk_live_exemple";

    expect(() => getStripe()).not.toThrow();
  });
});

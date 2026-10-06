// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/server/db";
import { sessions, users } from "@/server/db/schema";
import { isDemoAuthRouteAllowed } from "@/lib/demo";
import { createTestDb } from "./helpers/test-db";

// Better Auth et les routes lisent la base par le module `@/server/db` : on
// le fait pointer sur la base en mémoire du test en cours.
const holder = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("@/server/db", () => ({
  db: new Proxy(
    {},
    {
      get(_target, prop) {
        const db = holder.db as Record<string | symbol, unknown>;
        const value = db[prop];
        return typeof value === "function" ? value.bind(db) : value;
      },
    }
  ),
}));
vi.mock("@/lib/demo", async (original) => ({
  ...(await original<typeof import("@/lib/demo")>()),
  isDemo: true,
}));

const { POST: enter } = await import("@/app/api/demo/enter/route");
const { POST: switchRole } = await import("@/app/api/demo/switch/route");
const { auth } = await import("@/server/auth/config");
const { createSandbox, signInSandboxRole } = await import("@/server/demo/sandbox");

const ORIGIN = "http://localhost:3000";
let db: Database;

/** Requête de formulaire venant du site lui-même. */
function post(path: string, options: { cookie?: string; role?: string; origin?: string | null } = {}) {
  const headers = new Headers({ host: "localhost:3000" });
  const origin = options.origin === undefined ? ORIGIN : options.origin;
  if (origin) headers.set("origin", origin);
  if (options.cookie) headers.set("cookie", options.cookie);
  const body = new FormData();
  if (options.role) body.set("role", options.role);
  return new Request(`${ORIGIN}${path}`, { method: "POST", headers, body });
}

/** Les cookies posés par une réponse, tels que le navigateur les renverrait. */
const cookieOf = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

const whoIs = (cookie: string) => auth.api.getSession({ headers: new Headers({ cookie }) });

beforeEach(async () => {
  process.env.BETTER_AUTH_SECRET = "secret-de-test-pour-la-demo-0123456789";
  db = await createTestDb();
  holder.db = db;
});

describe("entrée dans la démo", () => {
  it("crée trois comptes reliés et connecte le visiteur comme client", async () => {
    const response = await enter(post("/api/demo/enter"));

    expect(response.status).toBe(303);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/products");

    const accounts = await db.select().from(users);
    expect(accounts.map((account) => account.role).sort()).toEqual(["admin", "customer", "vendor"]);
    expect(new Set(accounts.map((account) => account.demoSandboxId)).size).toBe(1);
    expect(accounts.every((account) => account.demoSandboxId !== null)).toBe(true);
    expect(accounts.every((account) => !account.isSeed)).toBe(true);
    expect(accounts.every((account) => account.email.endsWith("@demo.invalid"))).toBe(true);

    const session = await whoIs(cookieOf(response));
    expect((session!.user as { role?: string }).role).toBe("customer");
    // Une seule session ouverte : celles de l'inscription sont refermées.
    expect(await db.select().from(sessions)).toHaveLength(1);
  });

  it("note l'adresse IP du visiteur sur ses trois comptes", async () => {
    const request = post("/api/demo/enter");
    request.headers.set("x-forwarded-for", "203.0.113.7");

    await enter(request);

    const accounts = await db.select().from(users);
    expect(accounts.map((account) => account.demoIp)).toEqual([
      "203.0.113.7",
      "203.0.113.7",
      "203.0.113.7",
    ]);
  });

  it("garde le bac à sable d'un visiteur déjà entré", async () => {
    const first = await enter(post("/api/demo/enter"));
    const second = await enter(post("/api/demo/enter", { cookie: cookieOf(first) }));

    expect(second.status).toBe(303);
    expect(await db.select().from(users)).toHaveLength(3);
  });

  it("donne un bac à sable distinct à chaque visiteur", async () => {
    await enter(post("/api/demo/enter"));
    await enter(post("/api/demo/enter"));

    const accounts = await db.select().from(users);
    expect(accounts).toHaveLength(6);
    expect(new Set(accounts.map((account) => account.demoSandboxId)).size).toBe(2);
  });

  it("refuse un formulaire envoyé depuis un autre site", async () => {
    const foreign = await enter(post("/api/demo/enter", { origin: "https://pirate.example" }));
    const missing = await enter(post("/api/demo/enter", { origin: null }));

    expect(foreign.status).toBe(403);
    expect(missing.status).toBe(403);
    expect(await db.select().from(users)).toHaveLength(0);
  });
});

describe("changement de rôle", () => {
  it("connecte sur le compte du rôle demandé, dans le même bac à sable", async () => {
    const entered = await enter(post("/api/demo/enter"));
    const before = await whoIs(cookieOf(entered));

    const response = await switchRole(
      post("/api/demo/switch", { cookie: cookieOf(entered), role: "admin" })
    );

    expect(response.status).toBe(303);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/admin/dashboard");
    const after = await whoIs(cookieOf(response));
    expect((after!.user as { role?: string }).role).toBe("admin");

    const [customer] = await db.select().from(users).where(eq(users.id, before!.user.id));
    const [admin] = await db.select().from(users).where(eq(users.id, after!.user.id));
    expect(admin.demoSandboxId).toBe(customer.demoSandboxId);
    // L'ancienne session est fermée : l'ancien cookie ne vaut plus rien.
    expect(await whoIs(cookieOf(entered))).toBeNull();
    expect(await db.select().from(sessions)).toHaveLength(1);
  });

  it("ne déconnecte pas un visiteur qui redemande son rôle actuel", async () => {
    const entered = await enter(post("/api/demo/enter"));

    const response = await switchRole(
      post("/api/demo/switch", { cookie: cookieOf(entered), role: "customer" })
    );

    expect(new URL(response.headers.get("location")!).pathname).toBe("/products");
    expect(await whoIs(cookieOf(entered))).not.toBeNull();
  });

  it("refuse un rôle inconnu", async () => {
    const entered = await enter(post("/api/demo/enter"));

    const response = await switchRole(
      post("/api/demo/switch", { cookie: cookieOf(entered), role: "superadmin" })
    );

    expect(response.status).toBe(400);
  });

  it("renvoie vers l'entrée un visiteur sans session", async () => {
    const response = await switchRole(post("/api/demo/switch", { role: "admin" }));

    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });

  it("reste dans son bac à sable quand un autre visiteur est présent", async () => {
    const other = await createSandbox(new Headers());
    const entered = await enter(post("/api/demo/enter"));

    const response = await switchRole(
      post("/api/demo/switch", { cookie: cookieOf(entered), role: "vendor" })
    );

    const session = await whoIs(cookieOf(response));
    const [vendor] = await db.select().from(users).where(eq(users.id, session!.user.id));
    expect(vendor.role).toBe("vendor");
    expect(vendor.demoSandboxId).not.toBe(other);
  });

  it("renvoie null pour un bac à sable qui n'existe pas", async () => {
    expect(await signInSandboxRole("inconnu", "admin", new Headers())).toBeNull();
  });

  it("ne change pas le rôle d'un compte hors démo", async () => {
    const { user } = await auth.api.signUpEmail({
      body: { email: "vrai@exemple.fr", password: "motdepasse-123", name: "Vrai Compte" },
    });
    const signedIn = await auth.api.signInEmail({
      body: { email: "vrai@exemple.fr", password: "motdepasse-123" },
      asResponse: true,
    });

    const response = await switchRole(
      post("/api/demo/switch", { cookie: cookieOf(signedIn), role: "admin" })
    );

    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    expect(response.headers.getSetCookie()).toHaveLength(0);
    const [account] = await db.select().from(users).where(eq(users.id, user.id));
    expect(account.role).toBe("customer");
  });
});

describe("routes d'authentification ouvertes en démo", () => {
  it("laisse passer la lecture de session et la déconnexion", () => {
    expect(isDemoAuthRouteAllowed("GET", "/api/auth/get-session")).toBe(true);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/sign-out")).toBe(true);
    expect(isDemoAuthRouteAllowed("post", "/api/auth/sign-out/")).toBe(true);
  });

  it("refuse l'inscription et la connexion par mot de passe", () => {
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/sign-up/email")).toBe(false);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/sign-in/email")).toBe(false);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/sign-in/social")).toBe(false);
  });

  it("refuse la modification du compte", () => {
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/update-user")).toBe(false);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/change-password")).toBe(false);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/change-email")).toBe(false);
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/delete-user")).toBe(false);
  });

  it("refuse une route autorisée appelée avec une autre méthode", () => {
    expect(isDemoAuthRouteAllowed("POST", "/api/auth/get-session")).toBe(false);
    expect(isDemoAuthRouteAllowed("GET", "/api/auth/sign-out")).toBe(false);
  });
});

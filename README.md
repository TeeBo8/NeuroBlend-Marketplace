# NeuroBlend Marketplace

Place de marché de capsules de café où plusieurs torréfacteurs vendent leurs produits, classés par profil (HPI, ADHD, hypersensible). Le client paie en une fois, l'argent va au vendeur et la plateforme garde sa commission.

Projet d'entraînement : la marque et les produits sont fictifs, les paiements passent par Stripe en mode test.

## Ce que fait le site

| Pour qui | Ce qu'il peut faire |
|---|---|
| Visiteur | Parcourir le catalogue et les catégories, faire le quiz de profil, discuter avec l'assistant IA, lire les avis |
| Client | Remplir un panier, payer par carte, suivre ses commandes, laisser un avis (badge « achat vérifié » après livraison) |
| Vendeur | Demander l'ouverture d'une boutique, relier son compte Stripe, gérer ses produits, traiter ses commandes jusqu'à la livraison |
| Admin | Approuver les vendeurs et fixer leur commission, suivre le volume d'affaires, activer ou désactiver des produits, annuler une commande (remboursement compris) |

## Stack

| Rôle | Outil |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Interface | Tailwind CSS 4, shadcn/ui |
| API | tRPC 11, React Query |
| Base de données | PostgreSQL (Neon), Drizzle ORM |
| Comptes | Better Auth (e-mail et mot de passe, rôles client, vendeur, admin) |
| Paiement | Stripe Checkout et Stripe Connect |
| Panier | Zustand, enregistré dans le navigateur |
| IA | Vercel AI SDK avec Gemini |
| Images | UploadThing |
| E-mails | Resend |
| Tests | Vitest, PGlite (PostgreSQL en mémoire) |
| Hébergement | Vercel |

## Organisation du code

```
src/
├── app/                    Pages et routes
│   ├── (marketplace)/      Catalogue, fiche produit, panier, paiement
│   ├── (account)/          Espace client
│   ├── (vendor)/           Espace vendeur
│   ├── (admin)/            Espace admin
│   ├── (auth)/             Connexion, inscription
│   └── api/                tRPC, webhook Stripe, chat IA, contact, upload
├── components/             Composants partagés (ui/ = shadcn)
├── lib/                    Constantes, validation, e-mails, utilitaires
├── server/
│   ├── api/routers/        Une procédure tRPC par action, rangées par domaine
│   ├── orders/             Validation, annulation et statuts des commandes
│   ├── db/                 Schéma Drizzle et données de démonstration
│   └── auth/               Configuration Better Auth
├── stores/                 Panier
├── proxy.ts                Protège /account, /vendor et /admin selon le rôle
└── __tests__/              Tests
drizzle/                    Migrations SQL
scripts/                    Commandes d'administration
```

## Pour changer…

| Quoi | Où |
|---|---|
| Une table ou une colonne | `src/server/db/schema.ts`, puis `pnpm db:generate` et `pnpm db:migrate` |
| Les produits de démonstration | `src/server/db/seed.ts` |
| Les catégories, les formules d'abonnement, les liens du menu | `src/lib/constants.ts` |
| Les règles du paiement (stock, commission, session Stripe) | `src/server/api/routers/payment.ts` |
| Ce qui se passe quand une commande est payée | `src/server/orders/fulfillment.ts` |
| L'annulation et le remboursement | `src/server/orders/cancellation.ts` |
| Les statuts d'une commande et leur ordre | `src/server/orders/status.ts` |
| Les pages protégées et les rôles exigés | `src/proxy.ts` |
| Les e-mails | `src/lib/email.ts` |
| Les consignes de l'assistant IA | `src/app/api/chat/route.ts` |
| Les couleurs | `src/app/globals.css` |

## Démarrage local

Il faut Node 22, pnpm 10 et une base PostgreSQL Neon.

```bash
pnpm install
cp .env.example .env.local   # puis remplir les valeurs
pnpm db:migrate              # crée les tables
pnpm db:seed                 # un vendeur de démonstration et neuf produits
pnpm dev                     # http://localhost:3000
```

Pour créer le premier admin, s'inscrire sur le site puis lancer `pnpm db:promote-admin <email>`.

Pour tester un paiement, le vendeur doit avoir relié son compte Stripe depuis `/vendor/payouts`. La carte de test est `4242 4242 4242 4242`, avec une date future et un code quelconque. Pour recevoir les webhooks en local :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Variables d'environnement

Le site se construit sans base de données ni clés d'API : chaque variable n'est exigée qu'au moment où la fonction correspondante sert. Seule `BETTER_AUTH_SECRET` doit avoir une valeur dès la construction de production.

| Variable | Sert à |
|---|---|
| `DATABASE_URL` | Connexion à la base |
| `BETTER_AUTH_SECRET` | Signature des sessions |
| `NEXT_PUBLIC_APP_URL` | Adresse du site (`http://localhost:3000` en local) |
| `STRIPE_SECRET_KEY` | Paiements et comptes vendeurs |
| `STRIPE_WEBHOOK_SECRET` | Vérification des webhooks Stripe |
| `RESEND_API_KEY` | Envoi des e-mails |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Assistant et recommandations IA |
| `UPLOADTHING_TOKEN` | Envoi des images produits |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Mesure d'audience, après accord du visiteur |

## Commandes

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Construction de production |
| `pnpm lint` | ESLint, échoue au premier avertissement |
| `pnpm test` | Tous les tests |
| `pnpm db:generate` | Écrit une migration à partir du schéma |
| `pnpm db:migrate` | Applique les migrations |
| `pnpm db:seed` | Charge les données de démonstration |
| `pnpm db:promote-admin <email>` | Donne le rôle admin à un compte |

## Comment le paiement tient debout

1. La commande est enregistrée « en attente » avant que le client parte payer, avec les prix lus en base. Stripe ne transporte que son identifiant.
2. Le webhook Stripe et la page de retour appellent la même validation. Une seule requête SQL passe la commande à « payée » et retire le stock : le premier arrivé fait le travail, le second ne change rien.
3. Une session abandonnée expire au bout de 30 minutes et sa commande est supprimée.
4. À l'annulation, le client est remboursé chez Stripe avant toute écriture en base, puis une seule requête annule la commande et remet le stock.

## Règles du projet

- Une branche et une demande de fusion par lot, jamais de push direct sur `main`.
- Avant chaque push : `pnpm lint` sans avertissement, `pnpm test` et `pnpm build` au vert. La CI rejoue les trois.
- Un bug se corrige en écrivant d'abord le test qui le reproduit.
- Les montants se calculent en centimes entiers, jamais en nombres à virgule.
- Le serveur ne fait confiance à rien de ce que le navigateur envoie, au-delà des identifiants et des quantités.

## Limites connues

- Un panier ne peut contenir que les produits d'un seul vendeur.
- Le stock est vérifié à la création du paiement et retiré à l'encaissement : deux clients peuvent payer le dernier exemplaire dans la même demi-heure.
- Aucun e-mail n'est envoyé au changement de statut d'une commande, à son annulation ni au refus d'une boutique.
- La limite de débit des routes IA et du formulaire de contact est tenue en mémoire, donc par instance de serveur.

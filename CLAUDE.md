# ODIN Platform — Claude Context

This file gives Claude context to work effectively across sessions on this project.
Read this first. Then check `status.md` for current state and `tasks.md` for what's next.

---

## What this project is

An internal project management platform for DeepSea Developments (6 people) running Project ODIN.
Two parallel tracks, two surfaces:

| | |
|-|-|
| **Track A** | Claude Mastery — 8 modules · Erika, Rodrigo, Alba, Jesus |
| **Track B** | DeepClients AI Prep — 5 phases · Wladimir, Nick |
| **Web** | Next.js dashboard for visibility and reporting |
| **Bot** | Discord bot (primary daily interface), AI-powered via Claude Sonnet |

Full plan: see `planning.md`

---

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 14 App Router (`apps/web`) |
| Bot | Discord.js 14, runs via `tsx` (`apps/bot`) |
| Database | PostgreSQL via Prisma 5 (`packages/db`) |
| Env validation | Zod (`packages/config`) |
| Shared types | TypeScript (`packages/types`) |
| Web hosting | Vercel (deploys from `deploy` branch) |
| Bot hosting | Railway worker (deploys from `deploy` branch) |
| DB hosting | Railway Managed PostgreSQL |

---

## Key files

| File | What it is |
|------|-----------|
| `packages/db/prisma/schema.prisma` | Ground truth for all data models |
| `packages/db/prisma/seed.ts` | Seeds 8 Track A modules + 5 Track B phases |
| `packages/db/src/index.ts` | PrismaClient singleton (globalThis pattern) |
| `packages/config/src/env.ts` | Zod env validation — exits on missing vars |
| `packages/config/src/constants.ts` | TRACKS, TASK_STATUSES, PRIORITIES, team members |
| `apps/bot/src/index.ts` | Bot entry point |
| `apps/bot/src/load-env.ts` | Must be first import — loads .env before @odin/config runs |
| `apps/web/app/page.tsx` | Home page (force-dynamic, live DB query) |
| `railway.toml` | Railway build + start commands for the bot |
| `.npmrc` | `production=false` so pnpm always installs devDeps |
| `planning.md` | Full 10-session plan |
| `status.md` | What's been built, what's pending, known quirks |
| `tasks.md` | Granular task checklist per session |

---

## Running locally

```bash
# Prerequisites: copy .env.example to .env and fill in values
cp .env.example .env

# Install
pnpm install

# Push schema (first time or after schema changes)
pnpm db:push

# Seed modules
pnpm db:seed

# Run web + bot in parallel
pnpm dev

# Or run individually
pnpm --filter @odin/web dev    # web on :3000
pnpm --filter @odin/bot dev    # bot with tsx watch
```

---

## Deploying to production

```bash
git checkout deploy
git merge main
git push origin deploy   # triggers Vercel (web) + Railway (bot) auto-redeploy
git checkout main
```

---

## Important conventions

### Workspace packages use TypeScript source directly
`packages/config`, `packages/types`, and `packages/db` all have `"main": "./src/index.ts"`.
- Next.js uses `transpilePackages` in `next.config.mjs` to compile them
- The bot uses `tsx` which handles `.ts` imports natively
- Do NOT add a build step for packages unless there's a specific reason

### Bot env loading
`apps/bot/src/load-env.ts` MUST be the first import in `index.ts`.
It loads `.env` via dotenv before `@odin/config` runs its zod validation at module load time.
In production, Railway injects env vars directly — dotenv silently no-ops.

### Database queries in Next.js pages
Always add `export const dynamic = "force-dynamic"` to any page or layout that queries the DB.
Without it, Next.js tries to statically render the page at build time — which fails if the DB
isn't reachable from CI.

### Prisma `DATABASE_URL`
- **Vercel**: use the public Railway URL (find it in Railway dashboard → PostgreSQL service → Connect)
- **Railway bot service**: use the internal URL (`postgres.railway.internal:5432`)
- **Local dev**: use the public URL in `.env` and `packages/db/.env`

### Branch strategy
- `main` — active development, test locally here
- `deploy` — production, only merge from main when ready to ship

---

## Adding new API routes (Session 4+)

Create route handlers in `apps/web/app/api/[resource]/route.ts`.
Import `prisma` from `@odin/db` directly — no separate API server.
Auth check: import `auth` from NextAuth session (Session 3+).

## Adding new bot commands (Session 6+)

Register slash commands in `apps/bot/src/commands/`.
Use `prisma` from `@odin/db` directly — no HTTP calls to the web API.
AI calls: use `@anthropic-ai/sdk` with model `claude-sonnet-4-6`.

# ODIN Platform — Project Status

_Last updated: Session 6_

---

## Infrastructure

| Service | Status | URL / Notes |
|---------|--------|-------------|
| GitHub repo | ✅ Live | `electronick-co/OdinPlatform` |
| Railway PostgreSQL | ✅ Live | Internal + public URLs in Railway dashboard (not stored in repo) |
| Railway bot service | ✅ Live | Connected to Discord as **DeepSeaBot#9710**, guild: DeepSea Developments |
| Vercel web app | ✅ Live | Deployed from `deploy` branch, auto-redeploys on push |
| Database schema | ✅ Pushed | 11 tables (+ objectives + votes) |
| Database seed | ✅ Done | 13 modules (Track A: 8, Track B: 5) |

---

## Sessions

### Session 1 — Hello World + CI/CD ✅
**Completed.** Full monorepo deployed end-to-end.

**Delivered:**
- pnpm workspaces + Turborepo monorepo
- `@odin/config` — zod env validation, track/status constants
- `@odin/types` — shared TypeScript types
- `@odin/db` — full Prisma schema, PrismaClient singleton, seed script
- `apps/web` — Next.js 14 App Router, Hello World page showing live DB module count
- `apps/bot` — Discord.js bot, connects on startup, logs guild + DB stats
- CI/CD: `git push origin deploy` triggers Vercel (web) + Railway (bot) auto-redeploy

**Known quirks resolved during this session:**
- `next.config.ts` → `next.config.mjs` (Next.js 14 doesn't support TS config)
- `.npmrc` with `production=false` (pnpm skips devDeps when NODE_ENV=production)
- `prisma` CLI moved to `dependencies` in `@odin/db` (needed for postinstall generate)
- Bot uses `tsx` directly via `pnpm --filter @odin/bot start` (avoids bundler/native binary issues)
- `dotenv` loaded via side-effect `load-env.ts` as first import (must precede `@odin/config`)
- `export const dynamic = "force-dynamic"` on home page (don't render DB queries at build time)

---

### Session 2 — Design & Mockups ✅
**Completed.** Integrated interactive mockup built as a live Next.js client component.

**Delivered:**
- `apps/web/app/mockup/page.tsx` — single `"use client"` component, ~1200 lines, accessible at `/mockup`
- 6 switchable views via sidebar nav: Dashboard, Sprint Board, Member Profile, Learning Track, Admin, **Project Summary**
- Design language locked in: bg `#f1f4f8`, surface `#fff`, Track A blue `#2563eb`, Track B teal `#0d9488`
- Fonts loaded in `apps/web/app/layout.tsx`: Syne (display), DM Sans (body), Space Mono (mono)
- Shared component primitives: `Panel`, `TrackHeader`, `Avatar`, `StatusBadge`, `PriBadge`, `MemberCard`, SVG icons
- Progress rings (SVG `strokeDasharray`), Kanban columns, module grid, log table
- **Project Summary view**: bot PM card, alignment score, per-objective/task 4-star voting (interactive `useState`), consensus status badges (ALIGNED / REVIEWING / CONTESTED)
- All mockup data is local constants — no DB calls (pure UI exploration)

**Design reference files** (HTML mockups in `design/mockups/`, read-only):
- `dashboard-home.html`, `sprint-board.html`, `member-card.html`, `learning-track.html`, `admin-view.html`

**TypeScript:** passes `tsc --noEmit --skipLibCheck` cleanly.

---

### Session 3 — Auth ✅
**Completed.** NextAuth v5 integrated with Google OAuth, full route protection.

**Delivered:**
- `apps/web/auth.ts` — NextAuth config (Google provider, `signIn`/`jwt`/`session` callbacks)
- `apps/web/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `apps/web/middleware.ts` — protects all routes, redirects unauthenticated to `/login`
- `apps/web/app/login/page.tsx` — polished login page (matches design tokens: Syne font, `#f1f4f8` bg)
- `apps/web/types/next-auth.d.ts` — type extension adding `id`, `track`, `role` to session
- User upsert on sign-in: new users default to `track=A, role=MEMBER` (update via DB for Track B)
- JWT strategy: `userId`, `track`, `role` stored in token after first sign-in (no DB hit per request)

**Auth env vars (all configured):**
- `AUTH_SECRET` — in Vercel + `apps/web/.env.local` (gitignored)
- `NEXTAUTH_URL` — in Vercel + `apps/web/.env.local`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — in Vercel + `apps/web/.env.local`
- Root `.env` holds bot + DB vars; Next.js loads from `apps/web/.env.local` (not root)

**Known quirks resolved:**
- NextAuth v5 reads `AUTH_SECRET` (not `NEXTAUTH_SECRET`) — removed explicit `secret:` from config
- Next.js doesn't auto-load root monorepo `.env` — must use `apps/web/.env.local` for web vars
- Prisma DLL locked on Windows while dev server runs — stop all Node processes before `prisma generate`
- `pnpm` not on Git Bash PATH — use `npx pnpm` for all commands

**Deployed:** commit `7a379a5` on `deploy` branch ✓

---

### Session 4 — Core API ✅
**Completed.** Prisma schema extended, all core API route handlers built and type-checked.

**Schema additions:**
- `ObjectiveStatus` enum (PROPOSED / ALIGNED / REVIEWING / CONTESTED)
- `Objective` model — title, source (LogSource), status, createdAt
- `Vote` model — objectiveId + userId unique pair, stars 1–4

**API routes (all auth-protected, force-dynamic):**
- `GET/POST /api/sprints` — list all (with task/member counts), create new
- `GET/PATCH /api/sprints/[id]` — get detail with tasks + members; activating a sprint deactivates all others
- `GET/POST /api/tasks` — list (filterable by sprint_id / assignee_id / status), create
- `PATCH /api/tasks/[id]` — update status/priority; auto-creates `StatusLog` on status change
- `GET /api/modules` — list by track (optional `?track=A|B`)
- `GET /api/users` — team summary (tasks_total/done, modules_completed, last_activity)
- `GET /api/users/[id]` — full member detail (tasks, module progress, last 20 status logs)

**TypeScript:** passes `tsc --noEmit` cleanly.

---

### Session 5 — Web Dashboard ✅
**Completed.** Live dashboard pages built from the Session 2 mockup design, wired to real DB data.

**Delivered:**
- `apps/web/app/dashboard/_components/tokens.ts` — shared design tokens (exact match to mockup)
- `apps/web/app/dashboard/_components/utils.ts` — `timeAgo`, `deriveStatus`, `statusStyle`, `priStyle`, `sourceColors`
- `apps/web/app/dashboard/_components/sidebar.tsx` — "use client", `usePathname` for active state, member nav items with blocked indicator
- `apps/web/app/dashboard/_components/member-card.tsx` — "use client", hover lift effect, links to member profile
- `apps/web/app/dashboard/layout.tsx` — Server Component, queries members for sidebar, wraps all dashboard routes
- `apps/web/app/dashboard/page.tsx` — Dashboard home: active sprint card + progress bar, 4-stat chips, Track A/B member grids, activity feed
- `apps/web/app/dashboard/sprint/page.tsx` — Sprint Board: 4-column Kanban (TODO / IN_PROGRESS / DONE / BLOCKED), task cards with assignee avatar + priority badge
- `apps/web/app/dashboard/members/[id]/page.tsx` — Member profile: SVG progress ring, module checklist, task list, activity log
- `apps/web/app/page.tsx` — Root redirect to `/dashboard`

**Architecture:**
- All pages are Server Components with `force-dynamic` — direct Prisma queries, no HTTP round-trips
- Sidebar is Client Component (needs `usePathname`); member cards are Client Component (hover effects)
- Graceful empty states: no active sprint, no tasks, no activity

**TypeScript:** passes `tsc --noEmit --skipLibCheck` cleanly.

---

### Session 6 — Discord Bot + AI ✅
**Completed.** Slash commands live, Claude AI layer wired up, deployed to Railway.

**Delivered:**
- `apps/bot/src/lib/claude.ts` — `askClaude(system, user)` wrapper, model `claude-sonnet-4-6`, max 1024 tokens
- `apps/bot/src/lib/context-builder.ts` — builds markdown context from active sprint + user tasks + last 10 status logs
- `apps/bot/src/commands/` — 7 slash commands registered as guild commands (instant propagation):
  - `/link [name]` — case-insensitive DB lookup, connects Discord ID to User record
  - `/status` — Discord embed with user's tasks grouped by status + sprint % complete
  - `/done [task]` — autocomplete on TODO/IN_PROGRESS tasks → marks DONE, creates StatusLog (source=BOT)
  - `/blocked [task] [reason]` — autocomplete → marks BLOCKED with note
  - `/submit-cap [module] [url]` — autocomplete on incomplete modules → upserts ModuleProgress
  - `/summary` — deferred reply with Claude-generated sprint summary
  - `/ask [question]` — ephemeral Claude answer with full team context
- `apps/bot/src/index.ts` — guild command registration via REST on ready, `interactionCreate` handler for commands + autocomplete
- `packages/config/src/env.ts` — added `ANTHROPIC_API_KEY` + `DISCORD_CLIENT_ID` (both optional)

**Env vars added:**
- `DISCORD_CLIENT_ID` — Railway + root `.env`
- `ANTHROPIC_API_KEY` — Railway + root `.env`

**TypeScript:** passes `tsc --noEmit` cleanly.

**Deployed:** commits `5d86a5d` (Session 5) + `10c4181` (Session 6) on `deploy` branch ✓

---

### Session 7 — Learning Track ⏳ Not started
### Session 8 — Email notifications ⏳ Not started
### Session 9 — Nagger cron ⏳ Not started
### Session 10 — Testing ⏳ Not started

# ODIN Platform — Project Status

_Last updated: Session 2_

---

## Infrastructure

| Service | Status | URL / Notes |
|---------|--------|-------------|
| GitHub repo | ✅ Live | `electronick-co/OdinPlatform` |
| Railway PostgreSQL | ✅ Live | Internal + public URLs in Railway dashboard (not stored in repo) |
| Railway bot service | ✅ Live | Connected to Discord as **DeepSeaBot#9710**, guild: DeepSea Developments |
| Vercel web app | ✅ Live | Deployed from `deploy` branch, auto-redeploys on push |
| Database schema | ✅ Pushed | All 9 tables created |
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

**Pending (manual setup):**
- Create Google OAuth app in Google Cloud Console → copy `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Add all four env vars to Vercel: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- End-to-end test login flow creates User in DB
### Session 4 — Core API ⏳ Not started
### Session 5 — Web Dashboard ⏳ Not started
### Session 6 — Discord Bot + AI ⏳ Not started
### Session 7 — Learning Track ⏳ Not started
### Session 8 — Email notifications ⏳ Not started
### Session 9 — Nagger cron ⏳ Not started
### Session 10 — Testing ⏳ Not started

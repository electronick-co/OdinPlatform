# ODIN Platform — Tasks

_Pending work by session. Update this file as tasks are completed._

---

## Session 2 — Design & Mockups ✅

- [x] Generate mockup: **Dashboard home** (sprint overview, team status cards, track A/B split)
- [x] Generate mockup: **Sprint board** (Kanban, tasks grouped by status + member)
- [x] Generate mockup: **Member card** (individual progress, modules, tasks, last activity)
- [x] Generate mockup: **Learning track** (module grid, Cap.so video feed, show-and-tell wall)
- [x] Generate mockup: **Admin view** (full team visibility across both tracks)
- [x] Generate mockup: **Project Summary** (bot PM card, 4-star voting per objective/task, alignment scores)
- [x] Combine all views into integrated Next.js client component at `apps/web/app/mockup/page.tsx`
- [x] Review + iterate mockups before Session 3

---

## Session 3 — Auth ✅

- [x] Install NextAuth v5 + Google OAuth provider (`next-auth@5.0.0-beta.30`)
- [x] Create `app/api/auth/[...nextauth]/route.ts`
- [x] Add `User` creation/update on OAuth sign-in (upsert by email, default track=A)
- [x] Protect all dashboard routes via `middleware.ts` (redirect to /login)
- [x] Session management — expose user in Server Components via `auth()`, JWT stores id/track/role
- [x] Create `/login` page (Google OAuth sign-in button, matches design tokens)
- [x] Type extension at `apps/web/types/next-auth.d.ts`
- [ ] Add `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to Vercel env vars (manual step — requires Google Cloud Console + Vercel dashboard)
- [ ] End-to-end test: login flow creates user in DB with correct `track` and `role`

---

## Session 4 — Core API ✅

**Schema additions for Project Summary view:**
- [x] Add `Objective` model (id, title, source, status, createdAt)
- [x] Add `Vote` model (id, objectiveId, userId, stars 1–4, createdAt) — unique(objectiveId, userId)
- [x] Run `pnpm db:push` + update seed if needed

Route handlers in `apps/web/app/api/`:

- [x] `GET/POST /api/sprints` — list all, create new
- [x] `GET/PATCH /api/sprints/[id]` — get one, update (activate/deactivate)
- [x] `GET/POST /api/tasks` — list (filterable by sprint/assignee/status), create
- [x] `PATCH /api/tasks/[id]` — update status/priority (creates StatusLog entry)
- [x] `GET /api/modules` — list all modules by track
- [x] `GET /api/users` — list team members with progress summary
- [x] `GET /api/users/[id]` — individual member detail

---

## Session 5 — Web Dashboard

- [ ] Sprint board page (`/dashboard`) — Kanban columns by TaskStatus
- [ ] Member cards — progress ring, task count, last activity
- [ ] Track A/B split view
- [ ] Navigation layout (sidebar or topbar)
- [ ] Follow approved mockups from Session 2

---

## Session 6 — Discord Bot + AI

Slash commands:
- [ ] `/status` — show your open tasks + sprint progress
- [ ] `/done [task]` — mark a task as DONE (creates StatusLog with source=BOT)
- [ ] `/blocked [task] [reason]` — mark as BLOCKED
- [ ] `/submit-cap [module] [url]` — save Cap.so URL, mark module progress
- [ ] `/summary` — AI-generated sprint summary via Claude Sonnet
- [ ] `/ask [question]` — free-form question to Claude with team context

AI layer:
- [ ] Install `@anthropic-ai/sdk`
- [ ] Add `ANTHROPIC_API_KEY` to Railway env vars
- [ ] Build context builder (pulls active sprint, user tasks, recent status logs)
- [ ] Wire Claude Sonnet to `/summary` and `/ask` commands

---

## Session 7 — Learning Track

- [ ] Module grid page (`/learn`) — all modules for the user's track, with completion status
- [ ] Module detail page — description, challenges, Cap.so embed
- [ ] Show-and-tell wall — grid of submitted Cap.so videos (iframe embed)
- [ ] Progress bar per member per track

---

## Session 8 — Email Notifications

- [ ] Install Resend SDK
- [ ] Add `RESEND_API_KEY` to Vercel env vars
- [ ] Weekly digest email — sprint progress, completed tasks, module updates
- [ ] Daily nudge — tasks due today or overdue
- [ ] Email templates (React Email components)
- [ ] Cron trigger via Vercel Cron or Railway cron job

---

## Session 9 — Nagger Cron

- [ ] Detect tasks with no `updated_at` change in 3+ days
- [ ] Send Discord DM to assignee via bot
- [ ] Scheduled weekly summary message to team channel
- [ ] Create StatusLog entries with `source=CRON` for automated updates
- [ ] Configure Railway cron or Vercel Cron schedule

---

## Session 10 — Testing

Unit tests (Vitest):
- [ ] API route handlers
- [ ] Service/utility functions
- [ ] Bot command handlers

Integration tests (Vitest + test DB):
- [ ] Prisma queries against a test PostgreSQL instance
- [ ] Seed → query → assert flow

E2E tests (Playwright):
- [ ] Login flow creates/updates user in DB
- [ ] Sprint board task status update
- [ ] `/done` bot command updates task + creates StatusLog

Infrastructure:
- [ ] `.env.test` pointing to test DB
- [ ] `pnpm test` runs Vitest across all packages
- [ ] `pnpm test:e2e` runs Playwright
- [ ] GitHub Actions: run `pnpm test` on every PR to `main`

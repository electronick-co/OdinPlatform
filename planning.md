# ODIN Platform — Project Plan

## Overview
DeepSea Developments (6-person team) internal PM platform for Project ODIN.

**Two parallel tracks:**
- **Track A** — Claude Mastery curriculum (8 modules) · Members: Erika, Rodrigo, Alba, Jesus
- **Track B** — DeepClients AI Prep (5 phases) · Members: Wladimir, Nick

**Two surfaces:**
- Next.js web dashboard (visibility, reporting)
- Discord bot (primary daily interface, AI-powered via Claude Sonnet)

---

## Architectural Decisions

| Decision | Choice |
|----------|--------|
| Backend API | Next.js Route Handlers only — no separate Express server |
| Bot data access | Direct Prisma — no HTTP calls to the web API |
| Package manager | pnpm workspaces |
| Monorepo orchestration | Turborepo |
| Branch strategy | `main` = development, `deploy` = production |
| Web hosting | Vercel |
| Bot hosting | Railway (worker service) |
| Database | Railway Managed PostgreSQL |

---

## Project Structure

```
OdinPlatform/
├── apps/
│   ├── web/          # Next.js 14 App Router (@odin/web)
│   └── bot/          # Discord bot process (@odin/bot)
├── packages/
│   ├── db/           # Prisma schema + client (@odin/db)
│   ├── types/        # Shared TypeScript types (@odin/types)
│   └── config/       # Env validation via zod (@odin/config)
├── .npmrc            # production=false so devDeps always install
├── pnpm-workspace.yaml
├── railway.toml      # Bot build + start commands
├── turbo.json
└── tsconfig.base.json
```

---

## Session Plan

| # | Focus | Goal |
|---|-------|------|
| **1** | **Hello World + CI/CD** ✅ | Monorepo scaffold, DB schema, Hello World page + bot running in production |
| **2** | **Design & Mockups** | Generate UI mockups for all views before coding |
| **3** | **Auth** | NextAuth + Google OAuth, user creation, session management |
| **4** | **Core API** | REST route handlers for sprints, tasks, modules, users |
| **5** | **Web Dashboard** | Sprint board, member cards, progress overview |
| **6** | **Discord Bot + AI** | Slash commands + Claude Sonnet integration |
| **7** | **Learning Track** | Module progress UI, Cap.so submissions, show-and-tell wall |
| **8** | **Email notifications** | Resend integration, weekly digest, daily nudge |
| **9** | **Nagger cron** | Stale task detection, DM logic, scheduled summaries |
| **10** | **Testing** | Vitest unit tests, Playwright E2E, full coverage of critical paths |

---

## Database Schema (Ground Truth: `packages/db/prisma/schema.prisma`)

### Tables
- `users` — team members (discord_id, email, track A/B, role)
- `modules` — Track A modules + Track B phases (unified, ordered by track)
- `module_challenges` — sub-challenges within each module
- `sprints` — time-boxed work periods
- `sprint_members` — join table (sprint ↔ user)
- `tasks` — work items (status, priority, assignee, due date)
- `module_progresses` — per-user module completion + cap.so URL
- `status_logs` — audit trail of task status changes (source: web/bot/cron)
- `discord_conversations` — AI context store (message_count, participants JSONB)

### Enums
- `Track`: A | B
- `Role`: MEMBER | ADMIN
- `TaskStatus`: TODO | IN_PROGRESS | DONE | BLOCKED
- `Priority`: LOW | MEDIUM | HIGH
- `LogSource`: WEB | BOT | CRON

---

## Deployment Workflow

```bash
# Daily development (work on main)
git checkout main
# ... make changes ...
pnpm dev                    # web on :3000, bot running locally

# Deploy to production
git checkout deploy
git merge main
git push origin deploy      # triggers Vercel + Railway auto-redeploy
git checkout main
```

---

## Key Env Vars (set in Vercel + Railway dashboards, never committed)

| Var | Used by |
|-----|---------|
| `DATABASE_URL` | Both (public URL for Vercel, internal URL for Railway bot) |
| `DISCORD_TOKEN` | Bot only |
| `DISCORD_GUILD_ID` | Bot only |
| `NEXTAUTH_URL` | Web (Session 3) |
| `NEXTAUTH_SECRET` | Web (Session 3) |
| `GOOGLE_CLIENT_ID` | Web (Session 3) |
| `GOOGLE_CLIENT_SECRET` | Web (Session 3) |

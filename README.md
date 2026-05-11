# Dinkedin

Mobile-first pickleball platform for tournaments, rankings, rewards, and referrals.
Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**,
**Supabase Postgres + Auth**, and deployed on **Vercel**.

> **Phase 1 ships the foundation.** Profile editing, tournament registration,
> match results, ranking math, referral codes, and Shopify redemption arrive
> in later phases.

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the Supabase values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | e.g. `https://YOUR-REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Publishable (anon) key. Safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | optional in Phase 1 | **Never** expose with `NEXT_PUBLIC_*`. Server-only. |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` locally, your Vercel URL in prod. |

### 3. Run the dev server

```bash
npm run dev
```

App is at <http://localhost:3000>. Routes:

- `/` – Landing
- `/signup`, `/login` – Auth
- `/home`, `/tournaments`, `/rankings`, `/rewards`, `/profile` – Player (mobile bottom nav)
- `/organizer/*` – Organizer dashboard (sidebar)
- `/admin/*` – Admin dashboard (sidebar, role-restricted)

---

## Supabase setup

The schema lives in `supabase/migrations/`:

- `20260511180000_initial_schema.sql` – 10 tables + enums + signup trigger
- `20260511180100_rls_policies.sql` – Row-level security for every table
- `20260511180200_harden_security_definer_functions.sql` – Lockdown for helper functions

On signup, a Postgres trigger creates a `profiles` row, a `player_profiles`
row, and a `reward_events` row with the 100-point welcome bonus.

### Apply migrations to a fresh project

Either use the Supabase MCP / dashboard SQL editor, or the Supabase CLI:

```bash
supabase link --project-ref YOUR-REF
supabase db push
```

### Generate types after a schema change

```bash
supabase gen types typescript --project-id YOUR-REF > src/types/database.ts
```

### Auth configuration

- **Email + password** is enabled by default.
- Add your Vercel preview / prod URLs to **Authentication → URL Configuration → Redirect URLs**.

---

## Vercel deployment

The repo is wired to Vercel project `dinkedin`. Set these environment variables
in Vercel (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Build command: `next build`. Output: standard Next.js.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/                  # /login, /signup, shared auth layout
│   ├── (player)/                # Player area (bottom nav)
│   │   ├── home/
│   │   ├── tournaments/
│   │   ├── rankings/
│   │   ├── rewards/
│   │   ├── profile/
│   │   └── layout.tsx           # requires user
│   ├── organizer/               # Organizer dashboard (sidebar)
│   ├── admin/                   # Admin dashboard (sidebar, admin-only)
│   ├── auth/callback/route.ts   # OAuth/magic-link callback
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing
├── components/
│   ├── ui/                      # Button, Card, Field, EmptyState, …
│   └── layout/                  # BottomNav, PlayerShell, DashboardShell
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client (await cookies())
│   │   └── proxy.ts             # Session refresh for proxy.ts
│   ├── auth/actions.ts          # Server actions: signup, login, logout
│   ├── dal.ts                   # getSessionUser, requireUser, requireRole
│   ├── utils.ts                 # cn(), formatNumber(), getInitials()
│   └── validation.ts            # Zod schemas
├── types/database.ts            # Supabase-generated types
└── supabase/migrations/         # SQL migrations (run via CLI / dashboard)

proxy.ts                         # Next 16 proxy (was middleware.ts in <=15)
```

---

## Phases

- **Phase 1 (this branch)** – Schema, RLS, auth, layouts, route guards, placeholder pages, Vercel deploy.
- **Phase 2** – Profile editing, tournament list/detail, registration, organizer creation flow.
- **Phase 3** – Match results, ranking events, leaderboard, reward events, referral codes.
- **Phase 4** – Shopify discount code redemption.

---

## Security notes

- Every public table has RLS enabled.
- Role checks live in `current_user_role()` / `is_admin()` / `is_organizer_or_admin()`
  helper functions (SECURITY DEFINER, `EXECUTE` revoked from `anon`/`authenticated`).
- Server actions validate input with Zod before calling Supabase.
- Service-role key is never embedded in client code or `NEXT_PUBLIC_*`.

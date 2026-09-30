# VeriForge company frontend

React + TypeScript + Vite app for signup, trial onboarding, RBAC-aware navigation, and module launchers. Talks to `@vera/veriforge-saas-service` (SaaS API).

Workspace modules (VeriCore / VeriPM / VeriHub) open through the **same origin** at `/vera/*`, which Vite proxies to the Nest/Next workspace app. That path name is intentional dual-stack glue — not a leftover rename target for the 30-day production path.

## Ports (local vs production)

| Port | Process | Browser should use? |
|------|---------|---------------------|
| **5175** | VeriForge Vite SPA | **Yes** for local SPA + module links (`/vera/...`) |
| **3020** | VeriForge SaaS API | Via `/api` proxy only (not typed in the address bar) |
| **3000** | Workspace Next (`NEXT_PUBLIC_BASE_PATH=/vera`) | **No** — internal; reach via `http://localhost:5175/vera/...` |
| **3001** | Nest API | Used by workspace UI; not the VeriForge SPA origin |
| **8080** | Compose nginx gateway | Unified local URL when using Docker Compose |
| **443 / ingress** | Production | Static SPA + `/api` behind gateway — **not** port 5175 |

**5175 is correct for local Vite only.** Production serves the built SPA behind the VeriForge gateway/ingress.

## Route map

| Path | Access | Purpose |
|---|---|---|
| `/` | Public | Landing |
| `/hub` | Public | Limited VeriHub preview (no auth) |
| `/signup` | Public | Multi-step signup wizard |
| `/login` | Public | Login |
| `/dashboard` | Auth | Trial onboarding dashboard |
| `/modules/vericore` | Auth + module | Launcher → workspace `/core/dashboard` |
| `/modules/veripm` | Auth + module | Launcher → workspace `/pm/dashboard` |
| `/modules/verihub` | Auth + module | Launcher → workspace `/hub` |
| `/settings` | Auth + RBAC | Org profile, invites, billing entry |
| `/billing/activate` | Auth + billing perm | Activate Stripe subscription |

## Run (recommended)

From repo root (starts SaaS API, Nest, workspace Next with `/vera` base path, and this SPA):

```bash
# Infra (once): Postgres + Redis for SaaS — host ports 5433 / 6379 with dev-ports overlay
docker compose -f infra/veriforge/docker-compose.yml \
  -f infra/veriforge/docker-compose.dev-ports.yml \
  --env-file infra/veriforge/.env up -d postgres redis

# Nest Postgres must also be available (backend DATABASE_URL, often :5432)

npm run dev:veriforge
```

Open **http://localhost:5175/** — never depend on typing `:3000` in the browser for module pages.

### Manual terminals (equivalent)

```bash
# 1 — SaaS API :3020
cd services/veriforge-saas-service && npm run dev

# 2 — Nest :3001
cd backend && npm run start:dev

# 3 — Workspace UI :3000 with /vera base path
cd vera-frontend && npm run dev:veriforge

# 4 — VeriForge SPA :5175
cd apps/veriforge-frontend && npm run dev
```

Vite proxies ([`vite.config.ts`](./vite.config.ts)):

- `/api/*` → `http://127.0.0.1:3020/*`
- `/vera/*` → `http://127.0.0.1:3000/vera/*`

Do not set `VITE_VERA_APP_URL` in local `.env` (keeps same-origin `/vera` links on :5175).

## Admin console

Route namespace under `/admin/*` (platform admins only).

Set the same founder email in:

- `services/veriforge-saas-service` → `PLATFORM_ADMIN_EMAILS`
- `apps/veriforge-frontend` → `VITE_PLATFORM_ADMIN_EMAILS`

## Docker Compose (full stack)

See [`infra/veriforge/README.md`](../../infra/veriforge/README.md). Gateway is typically **http://localhost:8080** (not 5175).

# VeriForge / workspace local ports

## Canonical browser port: **5175**

Use **only** `http://localhost:5175` in the browser. All module UI, auth, and API calls from the browser go through this origin.

| Port | Service | Role |
|------|---------|------|
| **5175** | `apps/veriforge-frontend` (Vite) | **Browser entry** — SPA, `/vera` → Next, `/api` → SaaS, `/nest` → Nest |
| 3020 | `services/veriforge-saas-service` | Internal — orgs, auth, billing |
| 3000 | `vera-frontend` (Next) | **Internal only** — proxied at `/vera`; direct `:3000` redirects to `:5175` in dev |
| 3001 | `backend` (Nest) | **Internal only** — proxied at `/nest` from browser |
| 5433 | Compose Postgres (dev-ports) | SaaS DB |
| 6379 | Compose Redis | SaaS cache |

## Proxies on :5175

| Path | Target |
|------|--------|
| `/api/*` | `http://127.0.0.1:3020` (SaaS) |
| `/vera/*` | `http://127.0.0.1:3000` (Next workspace) |
| `/nest/*` | `http://127.0.0.1:3001` (Nest REST/WS) |

## Boot

```bash
npm run dev:veriforge
```

Open **http://localhost:5175** — never type `:3000` in the browser.

## Auth

- `NEXTAUTH_URL=http://localhost:5175/vera`
- `NEXT_PUBLIC_SITE_URL=http://localhost:5175/vera`
- Leave `NEXT_PUBLIC_API_URL` unset for smart routing (SSR uses `:3001`, browser uses `/nest`)

See [apps/veriforge-frontend/README.md](../apps/veriforge-frontend/README.md).

# Unified dev repair — naming + ports

**Date:** 2026-08-30  
**Goal:** One browser identity (`http://localhost:5175`) and clear VERA vs VERI naming rules.

## A. Scan summary

| Pattern | Approx. files | Action |
|---------|---------------|--------|
| `vera` / `VERA` / `VERI` / `Veri` | ~3,698 | Documented 3-layer model; fixed inconsistent constants/labels only |
| `localhost:3000` (browser-facing) | ~15 | Updated to `:5175/vera` or `resolvePublicBaseUrl()` |
| `localhost:5175` | Canonical browser port | Unified entry + proxies |

## B. Canonical naming

| Layer | Prefix | Examples |
|-------|--------|----------|
| **Platform** | `vera-*`, `VERA_*`, `@vera/*`, `/vera` | `vera-frontend`, `VERA_PM_DEV_OPEN` |
| **Products** | `vericore`, `veripm`, `verihub` + UI **VeriCore/VeriPM/VeriHub** | SaaS entitlements, RBAC |
| **Commercial** | `veriforge-*`, `VERIFORGE_*` | SaaS API, signup SPA |

**Not renamed (preserved):** DB enums, audit entity types (`VERI_AGENT`), migrations, npm scopes, directory names.

## C. Canonical port

| Role | Port | Browser? |
|------|------|----------|
| **Vite SPA (entry)** | **5175** | **Yes — only this** |
| Next workspace | 3000 | No — `/vera` proxy; redirect to :5175 |
| Nest API | 3001 | No — `/nest` proxy |
| SaaS API | 3020 | No — `/api` proxy |

## D. Files changed

### Naming
| File | Change |
|------|--------|
| `docs/NAMING-CONVENTION.md` | Authoritative 3-layer policy |
| `vera-frontend/lib/platform/naming.ts` | Nav ID ↔ SaaS code map |
| `vera-frontend/lib/vericore-dashboard/formulas.ts` | `VERA_CORE_FORMULAS` (+ deprecated `VERI_CORE_FORMULAS` alias) |
| `vera-frontend/lib/navigation/vera-nav-config.ts` | UI labels: VeriCore, VeriPM, Worker Hub, VeriHub Console |
| `apps/veriforge-frontend/src/lib/module-links.ts` | Hub route docs |
| `backend/src/audit/audit-actions.ts` | Comment: persisted `VERI_AGENT` |

### Ports
| File | Change |
|------|--------|
| `vera-frontend/lib/dev-ports.ts` | **New** — public URL + API routing |
| `vera-frontend/lib/api-fetch.ts` | Per-request API base (`/nest` on :5175) |
| `vera-frontend/lib/hub/feed-api.ts` | WS via same-origin `/nest` |
| `vera-frontend/lib/job-board/seo.ts` | Default site URL → `:5175/vera` |
| `vera-frontend/lib/safety-blog/seo.ts` | Same |
| `vera-frontend/lib/expert-qa/seo.ts` | Same |
| `vera-frontend/proxy.ts` | Redirect `:3000` → `:5175/vera` |
| `vera-frontend/.env.local` | Auth on `:5175/vera`; no pinned API URL |
| `vera-frontend/.env.example` | Same |
| `apps/veriforge-frontend/vite.config.ts` | `/nest` → `:3001` proxy |
| `backend/src/config/public-base-url.ts` | **New** — `DEFAULT_PUBLIC_BASE_URL` |
| `backend/src/common/wallet-routes.ts` | Uses `resolvePublicBaseUrl()` |
| `backend/src/auth/auth.service.ts` | Password reset links |
| `backend/src/worker-wallet/worker-wallet.service.ts` | Download URLs |
| `backend/src/modules/orientation/veriforge/orientation-delivery.service.ts` | Deep links |
| `backend/src/modules/vera-seo-engine/seo.utils.ts` | Site URL |
| `backend/src/modules/vera-core/training-wallet.mapper.ts` | QR URLs |
| `backend/src/modules/training-provider-core/training-provider-certificate.service.ts` | Cert URLs |
| `backend/.env` | `PUBLIC_BASE_URL`, `CORS_ORIGIN` |
| `.env.example` | Same |
| `scripts/dev-veriforge.mjs` | Boot messaging |
| `docs/VERIFORGE-LOCAL-PORTS.md` | Single browser port doc |
| `docs/DEVELOPER.md` | Unified boot instructions |
| `vera-frontend/playwright.config.ts` | Default `:5175/vera` |
| `vera-frontend/playwright/.env.e2e*` | Same |
| `vera-frontend/app/jobs/[slug]/page.tsx` | JSON-LD site URL |

## E. Verification checklist

- [ ] `npm run dev:veriforge` starts without errors
- [ ] Docker Postgres healthy on `:5433`
- [ ] **http://localhost:5175** — VeriForge SPA loads
- [ ] **http://localhost:5175/vera/hub** — VeriHub worker hub (not 404)
- [ ] **http://localhost:5175/vera/core/dashboard** — VeriCore (login redirect OK)
- [ ] **http://localhost:5175/vera/pm/dashboard** — VeriPM (login redirect OK)
- [ ] **http://localhost:5175/vera/verihub** — Org console
- [ ] **http://localhost:3000/vera/hub** — redirects to `:5175`
- [ ] VeriForge login at `/login` works; tokens in localStorage
- [ ] Vera org login at `/vera/auth/login` works; session cookie set
- [ ] DevTools: Nest calls use `/nest/...` on `:5175` (not `:3001` from browser)
- [ ] `GET http://localhost:3020/health` returns OK

## F. Rollback

```powershell
cd C:\Projects\veri-temp

# Remove new helpers
Remove-Item vera-frontend\lib\dev-ports.ts, backend\src\config\public-base-url.ts -ErrorAction SilentlyContinue

# If tracked in git:
git checkout -- vera-frontend/lib/api-fetch.ts vera-frontend/proxy.ts `
  apps/veriforge-frontend/vite.config.ts vera-frontend/.env.local backend/.env `
  docs/VERIFORGE-LOCAL-PORTS.md docs/DEVELOPER.md

# Restore manual values:
# vera-frontend/.env.local → NEXTAUTH_URL=http://localhost:3000, NEXT_PUBLIC_API_URL=http://localhost:3001
# backend/.env → PUBLIC_BASE_URL=http://localhost:3000
# vite.config.ts → remove /nest proxy block
# proxy.ts → remove :3000 redirect block
```

See also `docs/port-unification-rollback.md`.

## G. Safety confirmation

- No database migrations or data changes
- No audit log entity renames
- No auth secret changes (`NEXTAUTH_SECRET` unchanged)
- No business logic removed
- Deprecated aliases preserved (`VERI_CORE_FORMULAS`)

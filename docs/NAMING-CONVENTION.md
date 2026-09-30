# VERA vs VERI — Canonical Naming Convention

**Status:** authoritative for this monorepo  
**Scan date:** 2026-08-27 — **3,698 files** contain `VERA`, `Vera`, `vera`, `VERI`, `Veri`, or `veri` (excluding `node_modules`).

| Directory        | Files with matches |
|------------------|--------------------|
| `vera-frontend/` | 1,745              |
| `backend/`       | 980                |
| `services/`      | 680                |
| `packages/`      | 428                |
| `docs/`          | 167                |
| `apps/`          | 66                 |
| `infra/`         | 36                 |
| `scripts/`       | 14                 |

## Canonical rule (three layers — do not collapse)

| Layer | Prefix / pattern | Use for |
|-------|------------------|---------|
| **Platform** | `vera-*`, `VERA_*`, `@vera/*`, `/vera` URL base | Monorepo shell, workspace UI, shared infra, navigation, LLM/upload env |
| **Product modules** | `vericore`, `veripm`, `verihub` (lowercase SaaS codes) | Entitlements, RBAC keys, Prisma/SaaS enums |
| **Commercial SaaS** | `veriforge-*`, `VERIFORGE_*` | Signup SPA, SaaS API, deploy, tenancy |

**Product display names** (UI strings): **VeriCore**, **VeriPM**, **VeriHub**, **VeriAgent**, **VeriForge**, **VeriWallet**.

## Identifier mapping (nav ↔ SaaS)

Navigation module IDs are **camelCase platform IDs** (stable in React). SaaS module codes are **lowercase** (stable in DB/API).

| Nav module ID | SaaS `ModuleCode` | Route | UI label |
|---------------|-------------------|-------|----------|
| `veraHub` | `verihub` | `/hub` | Worker Hub (social feed, jobs, public safety) |
| `veriHubOrg` | `verihub` | `/verihub` | VeriHub Console (org admin, billing, compliance) |
| `veraCore` | `vericore` | `/core` | VeriCore |
| `veraPm` | `veripm` | `/pm` | VeriPM |
| `veriAgent` | — | `/veri-agent` | VeriAgent |
| `veriForge` | — | `/veriforge` | VeriForge |

> **Note:** SaaS code `verihub` entitles both surfaces; routes distinguish worker hub vs org console.

## Environment variables

| Prefix | Owner | Examples |
|--------|-------|----------|
| `VERA_*` | Platform / Nest workspace | `VERA_PM_DEV_OPEN`, `VERA_AGENT_*`, `VERA_CORE_UPLOAD_*` |
| `VERIFORGE_*` | Commercial SaaS | `VERIFORGE_SAAS_URL`, `VERIFORGE_LEDGER_HMAC_KEY` |
| `NEXT_PUBLIC_*` | Browser (no VERA/VERI rule) | `NEXT_PUBLIC_BASE_PATH=/vera` |
| `VITE_*` | Vite signup SPA | `VITE_VERA_APP_URL` → workspace `/vera` proxy |

**Do not rename persisted audit entity types** (`VERI_AGENT`, `VERA_ASSESSMENT_RUN`) — they appear in audit logs.

## Constants

| Domain | Canonical prefix | Example |
|--------|------------------|---------|
| Feed / API enums | `VERA_CORE_*` | `VERA_CORE_TRAINING` (Prisma, API contract) |
| Dashboard formulas | `VERA_CORE_*` | `VERA_CORE_FORMULAS` (in-memory; was `VERI_CORE_FORMULAS`) |

## What we intentionally did NOT rename

- Directory names (`vera-frontend`, `veriforge-saas-service`)
- npm scope `@vera/*` and product `@veriforge/platform`
- Database enums, migration SQL, audit log entity types
- User-facing historical log messages
- Product trademarks in marketing copy

## Code reference

- Naming mappings: `vera-frontend/lib/platform/naming.ts`
- Port + public URL helpers: `vera-frontend/lib/dev-ports.ts`, `backend/src/config/public-base-url.ts`

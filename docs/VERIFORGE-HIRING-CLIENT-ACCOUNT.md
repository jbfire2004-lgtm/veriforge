# VeriForge Hiring Client Account System

Dedicated account type for **EPCs, owners, municipalities, and general contractors** who review contractor compliance and scorecards before awarding work.

Lives in `services/veriforge-saas-service` (Postgres). Auth is a **separate JWT namespace** from org/VeriHub tokens (`audience: veriforge-hiring-client`, claim `ns: hiring_client`).

## Models

| Model | Purpose |
|-------|---------|
| `HiringClient` | Company: name, contact, status (`active` \| `suspended`) |
| `HiringClientUser` | Users with `ClientAdmin` \| `Reviewer`, permissions JSON |
| `HiringClientRefreshToken` | Refresh tokens for hiring-client sessions |
| `ContractAward` | Award records linking hiring client → contractor org |

Contractors listed for review are active SaaS `Organization` rows (read-only).

## Permissions

| Key | ClientAdmin | Reviewer |
|-----|-------------|----------|
| `contractor.scorecards.view` | ✓ | ✓ |
| `contractor.compliance.view` | ✓ | ✓ |
| `contractor.documents.view` | ✓ | ✓ |
| `contractor.projects.view` | ✓ | ✓ |
| `contractor.award.manage` | ✓ | — |

## API (`/client/*`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/client/auth/signup` | Public (rate-limited) |
| POST | `/client/auth/login` | Public (rate-limited) |
| GET | `/client/auth/me` | Hiring-client JWT |
| GET | `/client/contractors` | JWT + view permission |
| GET | `/client/contractor/:id/scorecard` | JWT + `contractor.scorecards.view` |
| GET | `/client/contractor/:id/compliance` | JWT + compliance/documents view |
| POST | `/client/contractor/:id/award` | JWT + `contractor.award.manage` |

Scorecard/compliance payloads are **read-only** scaffolds until live score APIs are wired.

## Bridges

- Next: `vera-frontend/app/api/client/[...path]` → SaaS `/client/*`
- Nest tRPC: `hiringClient` router (`backend/src/server/api/routers/hiring-client.ts`)

Env: `VERIFORGE_SAAS_URL` (default `http://127.0.0.1:3020`).

## UI

| Route | Purpose |
|-------|---------|
| `/client/review` | Contractor review dashboard + award |
| `/client/signup` | Provision hiring client + ClientAdmin |
| `/client/login` | Sign in |

Navigate Vera module: **Hiring Client**.

## Migrate / seed

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma db seed
```

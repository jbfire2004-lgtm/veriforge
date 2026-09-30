# API Documentation

VeriForge REST API — NestJS module: `backend/src/modules/veriforge-api`

## Envelope

All success responses use:

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "tenantId": "tenant-alloy",
    "userId": 42,
    "timestamp": "2026-07-10T05:00:00.000Z",
    "forgeStatus": "verified"
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `meta.tenantId` | yes (tenant routes) | Must match JWT / header |
| `meta.userId` | when authenticated | Actor id |
| `meta.timestamp` | yes | ISO-8601 |
| `meta.forgeStatus` | optional | e.g. `verified`, `forged` |

Helper: `buildSuccess(data, meta)` in `veriforge-response`.

## Auth

| Method | Path | Body | Notes |
|--------|------|------|-------|
| `POST` | `/veriforge/auth/login` | `{ email, password, tenantId?, tenantSlug? }` | Public |
| `POST` | `/veriforge/auth/register` | register payload | Public |
| `POST` | `/veriforge/tenants/auth/login` | tenant-aware login | Multi-tenant |

JWT claims include `tenantId` where applicable. RBAC via `VeriForgeRbacGuard` + `@VeriForgePermissions`.

## Core engines

| Method | Path | Permission (typical) |
|--------|------|----------------------|
| `GET` | `/veriforge/training/modules` | `TRAINING_VIEW` |
| `GET` | `/veriforge/training/modules/:id` | `TRAINING_VIEW` |
| `POST` | `/veriforge/training/modules/create` | `TRAINING_UPDATE` |
| `POST` | `/veriforge/training/modules/assign` | `TRAINING_ASSIGN` |
| `GET` | `/veriforge/verification` | `VERIFICATION_VIEW` |
| `GET` | `/veriforge/compliance` | `COMPLIANCE_VIEW` |
| `GET` | `/veriforge/incidents` | incident view |
| `GET` | `/veriforge/risk` | risk view |
| `GET` | `/veriforge/audit` | `AUDIT_VIEW` |
| `GET` | `/veriforge/field-operations` | field ops |
| `GET` | `/veriforge/inspections` | equipment |
| `GET` | `/veriforge/culture` | culture |
| `GET` | `/veriforge/users` | `USER_READ` |
| `GET` | `/veriforge/notifications` | notifications |
| `GET/PATCH` | `/veriforge/settings` | `SETTINGS_UPDATE` |

Exact verbs vary by controller — see `backend/src/modules/veriforge-api/controllers/*.controller.ts`.

## Advanced surfaces

| Prefix | Capabilities |
|--------|----------------|
| `/veriforge/predictive` | models, zones, analytics, type filters |
| `/veriforge/digital-twin` | hazards refresh, equipment toggle, simulate, controls |
| `/veriforge/command-center` | sites, alerts, incidents, ack, escalate, emergency |
| `/veriforge/ledger` | chain entries, verify, commit, contracts |
| `/veriforge/reports` | generate, export, analytics |
| `/veriforge/deployment` | rollout, localization, infrastructure, monitoring |
| `/veriforge/sounds` | catalog, play |
| `/veriforge/animations` | catalog, play |
| `/veriforge/motion` | motion catalog |
| `/veriforge/iconography` | icon catalog |

## Tenant-aware metadata

Every request should resolve tenant via:

1. JWT `tenantId`
2. Route param (`/tenants/:tenantId/...`)
3. Body / header helpers (`resolveTenantId`)

Guards reject JWT/route tenant mismatch. Storage buckets: `veriforge-tenant-{slug}`.

## Error shape

Handled by `VeriForgeExceptionFilter` — clients should read `status` ≠ success and surface forge-red alerts with **text**, not color alone.

## Local base URL

Default Nest port (see backend env). Frontend calls typically proxy or absolute API URL via env (`NEXT_PUBLIC_*` / server routes).

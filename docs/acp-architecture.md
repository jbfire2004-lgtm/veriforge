# Vera Admin Control Panel (ACP)

## Overview

ACP is the platform governance layer for Vera: **tenants**, **RBAC**, **subscription tiers**, and **feature flags**. It gates what users see in Vera Hub and PM workspaces.

## Data model (`acp_*` tables)

| Table | Purpose |
|-------|---------|
| `acp_tenants` | Organizations (optional link to `Company`) |
| `acp_roles` | Named roles (platform or tenant-scoped) |
| `acp_user_roles` | User ↔ role assignments |
| `acp_permissions` | Atomic capability keys (`module.action`) |
| `acp_role_permissions` | Role ↔ permission matrix |
| `acp_subscription_tiers` | free / professional / enterprise |
| `acp_tenant_subscriptions` | Active tier per tenant |
| `acp_feature_flags` | Global feature definitions |
| `acp_tenant_feature_flags` | Per-tenant overrides |
| `acp_audit_logs` | Configuration audit trail |

`User.acpTenantId` links platform users to a tenant.

## Access engine

Combined check order (see `AcpAccessService`):

1. Legacy `SUPER_ADMIN` / `ADMIN` JWT role → full access
2. Role permissions (union of all assigned ACP roles)
3. Feature flags (tenant override + tier `featuresJson` + defaults)
4. Subscription tier minimum for gated features

Hub module gates: `HUB_MODULE_GATES` in `backend/src/acp/acp.constants.ts`

## API

Base path: `/api/v1/acp`

- `GET /access/me` — current user access context
- `GET /access/hub-modules` — allowed PM/hub modules
- `POST /access/check` — ad-hoc check
- CRUD: `/tenants`, `/users`, `/roles`, `/permissions`, `/subscriptions/tiers`, `/features`, `/audit-logs`

Protected by `JwtAuthGuard` + `RolesGuard` (ADMIN/SUPER_ADMIN) + `AcpAccessGuard` (permission keys).

## Frontend

| Route | Page |
|-------|------|
| `/admin` | Dashboard (includes ACP shortcuts) |
| `/admin/tenants` | Tenant CRUD |
| `/admin/users` | User tenant + role assignment |
| `/admin/roles` | Role CRUD |
| `/admin/permissions` | Permission matrix |
| `/admin/subscriptions` | Tier assignment |
| `/admin/features` | Feature flag toggles |
| `/admin/logs` | Audit log viewer |

Client: `vera-frontend/lib/acp-api.ts`  
Hub filter: `useAcpHubModules()` → `PmModuleNav` hides disallowed modules.

## Vera Hub homepage (`/hub`)

- `GET /api/v1/hub/modules` — module cards with ACP allow/deny
- `GET /api/v1/hub/widgets/summary` — daily widgets bundle
- Individual widget routes under `/api/v1/hub/widgets/*`

Frontend: `HubWorkspaceShell`, `useHubAccess()`, `lib/hub/hub-dashboard-api.ts`

## Setup

```bash
cd backend
npx prisma migrate deploy
# Seeds permissions, tiers, flags, and platform_admin role on API start
```

Assign `platform_admin` ACP role to users, or use legacy SUPER_ADMIN.

# Vera Access, Subscription & Control System

Production architecture for governance across **Vera Hub**, **Vera Core**, and **Vera PM**.

## Data model (`acp_*` + `User`)

| Table | Purpose |
|-------|---------|
| `acp_tenants` | Organizations (`companyId` optional) |
| `acp_roles` | Platform or tenant-scoped roles |
| `acp_user_roles` | User ↔ role |
| `acp_permissions` | Atomic keys (`module.action`) |
| `acp_role_permissions` | Role ↔ permission matrix |
| `acp_subscription_tiers` | Commercial tiers + `featuresJson` |
| `acp_tenant_subscriptions` | Active tier per tenant |
| `acp_feature_flags` | Global flag definitions |
| `acp_tenant_feature_flags` | Per-tenant overrides |
| `acp_audit_logs` | Admin audit trail |
| `User.acpTenantId`, `User.active` | User ↔ tenant, activate/deactivate |

**Access formula:** `roles → permissions` + `tier features` + `tenant feature overrides` (+ legacy `SUPER_ADMIN` bypass).

## API surface

### Access engine (any authenticated user)

Base: `/api/v1/access`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | Full access context |
| POST | `/check` | Combined permission/feature/module/tier check |
| GET | `/hub-modules` | PM/hub route gates |
| GET | `/modules` | Hub module cards (Hub/Core/PM/add-ons) |

### Admin Control Panel

Base: `/api/v1/acp` — requires `ADMIN` / `SUPER_ADMIN` JWT + ACP permissions.

Tenants, users, roles, permissions matrix, subscriptions, feature flags, audit logs.

Extended tenant APIs:

- `PUT /tenants/:id/subscription` — tier assignment
- `PUT /tenants/:id/addons` — enable add-on feature keys
- `PUT /tenants/:id/modules` — enable module feature set

User APIs:

- `GET/PUT /users/:id`, `PUT /users/:id/active`

### Subscriptions (customer)

Base: `/api/v1/subscriptions` — catalog, purchase, add-ons → updates `tenant_subscriptions` + `tenant_feature_flags`.

### Hub widgets

Base: `/api/v1/hub/widgets/*` — daily pulse widgets.

### Worker Wallet

Base: `/api/v1/worker-wallet`

| Method | Path | Auth |
|--------|------|------|
| GET | `/download` | Public — app / PWA links |
| GET | `/me` | JWT — own wallet + QR + sync |
| GET | `/qr/:workerId` | JWT |
| POST | `/sync/:workerId` | JWT — profile + training sync |

## Middleware

| Guard | Use |
|-------|-----|
| `JwtAuthGuard` | Authentication |
| `RolesGuard` | Legacy JWT roles (`checkRole` via `@Roles()`) |
| `AcpAccessGuard` | ACP admin permission keys (`@RequireAcpPermission`) |
| `VeraAccessGuard` | Combined check on one handler |
| `VeraPermissionGuard` | `checkPermission` — `@RequirePermission('pm.access')` |
| `VeraFeatureGuard` | `checkFeatureFlag` — `@RequireFeature('pm.sms')` |
| `VeraTierGuard` | `checkSubscriptionTier` — `@RequireMinTier('enterprise')` |
| `VeraModuleGuard` | Module gate — `@RequireModule('core')` |

**Example (Core API):** `CoreDailyLogController` uses `@UseGuards(JwtAuthGuard, VeraModuleGuard)` + `@RequireModule('core')`.

**Example (PM):** `PmSafetyHubController` uses `@RequireModule('pm.safety-hub')`.

**Frontend boundaries:** `VeraModuleBoundary` on `/core` and `/pm` layouts; Hub uses `HubModuleGrid` + `useModuleAccess`.

## Frontend

| Area | Routes / libs |
|------|----------------|
| ACP | `/admin/acp`, `/admin/tenants`, … `/admin/logs` |
| Subscriptions | `/subscriptions`, `/subscriptions/checkout` |
| Hub | `/hub` — `HubWorkspaceShell`, widgets, module grid |
| Client | `lib/vera-access/index.ts`, `lib/acp-api.ts`, `components/vera-access/VeraAccessGate.tsx` |

## Module gating

Defined in `backend/src/acp/acp.constants.ts` (`HUB_MODULE_GATES`) and `acp-module-catalog.ts`.

Frontend: `useAcpHubModules()`, `PmModuleNav`, `HubModuleGrid`.

## Setup

```bash
cd backend
npx prisma migrate deploy
npm run start:dev
```

Seed runs on boot (`AcpSeedService`): permissions, tiers, flags, `platform_admin` role.

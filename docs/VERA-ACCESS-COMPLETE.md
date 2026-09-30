# Vera Access, Subscription & Control — Complete System

Production-ready governance for **Vera Hub**, **Vera Core**, and **Vera PM**.

## Access formula

```
effective_access = role_permissions
                 ∪ tier.featuresJson
                 ∪ tenant_feature_flag_overrides
                 (SUPER_ADMIN / ADMIN JWT bypass)
```

---

## 1. Database (`acp_*` + `User`)

| Prisma model | Table | Purpose |
|--------------|-------|---------|
| `AcpTenant` | `acp_tenants` | Organizations |
| `AcpRole` | `acp_roles` | RBAC roles |
| `AcpUserRole` | `acp_user_roles` | User ↔ role |
| `AcpPermission` | `acp_permissions` | Capability keys |
| `AcpRolePermission` | `acp_role_permissions` | Role ↔ permission |
| `AcpSubscriptionTier` | `acp_subscription_tiers` | Commercial tiers |
| `AcpTenantSubscription` | `acp_tenant_subscriptions` | Active tier |
| `AcpFeatureFlag` | `acp_feature_flags` | Feature definitions |
| `AcpTenantFeatureFlag` | `acp_tenant_feature_flags` | Per-tenant overrides |
| `AcpAuditLog` | `acp_audit_logs` | Admin audit trail |
| `User.acpTenantId`, `User.active` | `User` | Tenant link + activate/deactivate |

Migrations: `20260529140000_acp_control_panel`, `20260530120000_user_active_flag`

---

## 2. Backend API routes

### Access engine — `/api/v1/access` (any authenticated user)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | Full access context |
| POST | `/check` | Combined permission/feature/module/tier check |
| GET | `/hub-modules` | PM route gates |
| GET | `/modules` | Hub/Core/PM module cards |

### Admin Control Panel — `/api/v1/acp` (ADMIN / SUPER_ADMIN + ACP permissions)

**Tenants:** GET/POST/PUT/DELETE `/tenants`, `/tenants/:id`  
**Tenant subscription:** PUT `/tenants/:id/subscription`  
**Tenant add-ons:** PUT `/tenants/:id/addons`  
**Tenant modules:** PUT `/tenants/:id/modules`  
**Users:** GET/POST/PUT/DELETE `/users`, PUT `/users/:id/active`, PUT `/users/:id/tenant`  
**Roles:** GET/POST/PUT/DELETE `/roles`, POST/DELETE `/users/:id/roles`  
**Permissions:** GET `/permissions`, GET `/permissions/matrix`, PUT `/roles/:id/permissions`  
**Features:** GET `/features`, PUT `/tenants/:id/features/:flagId`, PUT `/features/:id/default`  
**Audit:** GET `/audit-logs`  
**Tiers:** GET `/subscriptions/tiers`

### Customer subscriptions — `/api/v1/subscriptions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catalog` | Module cards, comparison, pricing |
| GET | `/tiers` | Tier list |
| GET | `/features` | Feature list |
| GET | `/me` | Current tenant subscription |
| POST | `/purchase` | Assign tier + enable features |
| POST | `/addons` | Enable add-on feature keys |

### Hub widgets — `/api/v1/hub`

| Method | Path |
|--------|------|
| GET | `/widgets/summary` |
| GET | `/widgets/worker-readiness` |
| GET | `/widgets/equipment-readiness` |
| GET | `/widgets/training-expiring` |
| GET | `/widgets/safety-alerts` |
| GET | `/widgets/project-activity` |
| GET | `/modules` |

### Worker Wallet — `/api/v1/worker-wallet`

| Method | Path | Auth |
|--------|------|------|
| GET | `/download` | Public |
| GET | `/me` | JWT |
| GET | `/qr/:workerId` | JWT |
| POST | `/sync/:workerId` | JWT |

---

## 3. Middleware (access-control)

| Guard | Decorator | Purpose |
|-------|-----------|---------|
| `RolesGuard` | `@Roles()` | Legacy JWT role (`checkRole`) |
| `VeraRoleGuard` | `@RequireRoles()` | Explicit role check |
| `VeraPermissionGuard` | `@RequirePermission()` | Permission key |
| `VeraFeatureGuard` | `@RequireFeature()` | Feature flag |
| `VeraTierGuard` | `@RequireMinTier()` | Subscription tier |
| `VeraModuleGuard` | `@RequireModule()` | Hub/Core/PM module gate |
| `VeraAccessGuard` | Combined decorators | All checks on one handler |
| `AcpAccessGuard` | `@RequireAcpPermission()` | ACP admin API |

**API examples:** `CoreDailyLogController` → `@RequireModule('core')`; `PmSafetyHubController` → `@RequireModule('pm.safety-hub')`

---

## 4. Frontend pages

| Route | Features |
|-------|----------|
| `/admin/acp` | ACP overview |
| `/admin/tenants` | CRUD, tier/modules panel |
| `/admin/users` | CRUD, active toggle, role assignment |
| `/admin/roles` | CRUD, permission count |
| `/admin/permissions` | Permission matrix grid |
| `/admin/subscriptions` | Tier assignment table |
| `/admin/features` | Per-tenant toggles |
| `/admin/logs` | Audit log viewer |
| `/subscriptions` | Module cards, comparison, pricing |
| `/subscriptions/checkout` | Plan + add-ons + purchase |
| `/hub` | Banner, module grid, daily widgets, wallet link |

---

## 5. Module gating

Defined in `backend/src/acp/acp.constants.ts` (`HUB_MODULE_GATES`) and `acp-module-catalog.ts`.

| Surface | Implementation |
|---------|----------------|
| Hub module grid | `HubModuleGrid` + `/access/modules` |
| PM nav | `useAcpHubModules()` |
| Core layout | `VeraModuleBoundary moduleId="core"` |
| PM layout | `PmAccessWrapper` → `VeraModuleBoundary moduleId="pm"` |
| API | `VeraModuleGuard` on Core/PM controllers |

Add-ons (OCR, Predictive, Autonomous, Command Center, Marketplace) map to `addon.*` and `pm.predictive` feature flags.

---

## 6. Seeded roles

| Role | Permissions |
|------|-------------|
| `platform_admin` | All permissions |
| `company_admin` | Hub + Core + PM + admin modules |

Auto-assigned: `platform_admin` → JWT SUPER_ADMIN/ADMIN users on API start.

---

## 7. Setup

```bash
cd backend
npx prisma migrate deploy
npm run start:dev
```

```bash
cd vera-frontend
npm run dev
```

**Verify:** Sign in as admin → `/admin/acp`, `/hub`, `/subscriptions/checkout?plan=pm`

---

## 8. Folder structure

See [vera-access-folder-structure.md](./vera-access-folder-structure.md)

Client entry point: `vera-frontend/lib/vera-access/index.ts`

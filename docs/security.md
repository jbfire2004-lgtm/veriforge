# Vera Platform Security Model

This document describes the backend authorization, tenant isolation, and hardening layers introduced under `backend/src/security/`.

## Threat model (summary)

| Surface | Risk | Mitigation |
|---------|------|------------|
| Authenticated API (`/api/v1/*`, PM, Core, Admin) | Privilege escalation, cross-tenant reads | JWT + role hierarchy + permission matrix + tenant guards |
| Public verify/QR | Enumeration, abuse | `@PublicRateLimited`, strict id validation, global throttle |
| Cookie/credentials POST | CSRF | `OriginGuard` enabled by default in production |
| All mutating routes | Bad input | Global `ValidationPipe` (class-validator DTOs) |

## Authentication

- **Bearer JWT** via `JwtAuthGuard` (global). Public routes opt out with `@Public()` or `@PublicRateLimited()`.
- **Session principal** (`SecurityActor`): `id`, `role`, `companyId`, optional provider/instructor ids — populated by `JwtStrategy` from DB (not trusted from token alone).
- **Token lifetime**: `JWT_ACCESS_SECONDS` (default 3600). Secret from `JWT_SECRET` (validated at boot).

## Authorization (RBAC)

Three complementary layers:

1. **`@Roles(...)`** — route-level role lists; `RolesGuard` uses **role hierarchy** (`roleSatisfiesAny`) so e.g. `COMPANY_ADMIN` satisfies `SUPERVISOR`.
2. **`@RequirePermission(...)`** — fine-grained capability keys (`Permission.WORKER_VIEW`, `INSPECTION_SUBMIT`, `COMPANY_READINESS_VIEW`, etc.) enforced by `PermissionGuard`.
3. **`PermissionService`** — centralized async checks combining permissions + tenant:
   - `assertCanViewWorker`, `assertCanEditWorker`
   - `assertCanViewInspection`, `assertCanEditInspection`, `assertCanSubmitInspection`
   - `assertCanViewCompanyReadiness`

Role groups live in `modules/vera-core/roles.ts`. Permission matrix in `security/permission.service.ts`.

## Tenant isolation

Every company-scoped resource must resolve to the actor's `companyId` unless the actor is a platform `SUPER_ADMIN` / `ADMIN`. `COMPANY_ADMIN` is scoped to their own company (no cross-tenant bypass).

- **`@TenantScoped('companyId')`** — `TenantIsolationGuard` compares param/query/body `companyId` to the actor tenant.
- **`TenantScopeService`** — service-level helpers:
  - `assertCompanyAccess`, `assertWorkerInTenant`, `assertInspectionInTenant`
  - `companyWhere(actor, requestedCompanyId)` for Prisma filters

Cross-tenant access returns **403 Forbidden**; missing resources return **404** to avoid leaking existence.

### Audit endpoint scope

- `/audit` endpoints require supervisor-role membership plus `admin.access` permission.
- Non-platform admins are restricted to their own tenant audit stream.
- Only `SUPER_ADMIN`/`ADMIN` can query cross-tenant audit records.

## Public endpoints

`/verify/*` and `/qr/*` use `@PublicRateLimited(limit, ttl)` — stricter per-route throttle on top of the global 120/min cap. Path ids use `PositiveIntPipe`.

## CSRF

State-changing requests without `Authorization: Bearer` are checked against `CORS_ORIGIN` allow-list. In production, wildcard origins are rejected and origin guard must be enabled.

## Production env policy

- `JWT_SECRET` must be explicitly set and not use known weak defaults.
- `CORS_ORIGIN` must be explicit (no `*`) in production.
- `ENABLE_ORIGIN_GUARD=1` is required in production.
- API gateway enforces:
  - `JWT_ACCESS_SECRET` minimum length
  - `AUDIT_SERVICE_KEY` present
  - explicit non-wildcard `CORS_ORIGIN`

## Input validation

- Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`.
- DTOs use `class-validator`; public query parsers use dedicated validators (e.g. `parseValidateTrainingRecordQuery`).

## Guard execution order

Registered in `AppModule` (last registered runs first):

`ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard` → `OriginGuard` → `PermissionGuard` → `TenantIsolationGuard`

## Adding a protected route

```typescript
@Get('readiness/summary')
@Roles(...SUPERVISOR_ROLES)
@RequirePermission(Permission.COMPANY_READINESS_VIEW)
@TenantScoped('companyId')
async summary(@Query('companyId') companyId: string, @Req() req) {
  const actor = toSecurityActor(req.user);
  await this.permissions.assertCanViewCompanyReadiness(actor, Number(companyId));
  return this.readiness.summary(Number(companyId));
}
```

## Tests

- `security/permission.service.spec.ts` — RBAC + cross-tenant worker/inspection denial
- `security/tenant-scope.service.spec.ts` — company access rules
- `security/role-hierarchy.spec.ts` — role inheritance

Run: `npm test -- --testPathPattern=security` from `backend/`.

## Structured audit logging

Safety-critical actions are recorded in the central `AuditLog` table via `AuditLogService.logAudit(actor, action, entity, metadata)`.

| Field | Purpose |
|-------|---------|
| `actorId` | User who performed the action (nullable for public QR/verify) |
| `tenantId` | Company tenant for isolation and reporting |
| `action` | Canonical key from `audit/audit-actions.ts` |
| `entityType` / `entityId` | Target resource (string id supports UUID inspections) |
| `metadataJson` | Structured context (scores, status transitions, correlation id) |

Instrumented surfaces include PM inspections (create/submit/escalate/automation), assessments (TAE/SKE/SPCE/SGAE/competency/fit test), PM incidents, QR/verification, inspection templates, and ACP admin changes. Domain-specific logs (e.g. `PmInspectionAuditLog`) remain for module UX; central logs power compliance queries.

Tests: `npm test -- --testPathPattern=audit-log` from `backend/`.

Public QR/verify surfaces: see [public-surfaces.md](./public-surfaces.md).

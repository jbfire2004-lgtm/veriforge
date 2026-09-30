# VeriForge Developer Account System

System-level accounts for platform developers and support engineers. Separate JWT namespace from org and hiring-client auth.

## Models

| Model | Purpose |
|-------|---------|
| `Developer` | email, password, role, permissions JSON |
| `DeveloperRefreshToken` | Session refresh |
| `DeveloperApiKey` | Hashed API keys |
| `FeatureFlag` | Platform feature flags |
| `ImpersonationSession` | Audited org impersonation |
| `DeveloperActionLog` | Dedicated audit trail for developer actions |

### Roles & permissions

| Role | Permissions |
|------|-------------|
| **SystemAdmin** | `system.full_access`, `org.impersonate`, `modules.create`, `modules.edit`, `billing.override`, `logs.view`, (+ full bundle) |
| **ModuleArchitect** | `modules.create`, `modules.edit`, `feature_flags.manage`, `api_keys.manage` |
| **SupportEngineer** | `org.impersonate`, `org.view`, `org.users.view`, `logs.view` |
| **BillingAdmin** | `billing.view`, `billing.override`, `org.view` |

`system.full_access` satisfies any permission check.

## Auth

- Audience: `veriforge-developer`, claim `ns: developer`
- `POST /developer/auth/bootstrap` — first account open in non-prod; afterward / production requires `DEVELOPER_BOOTSTRAP_SECRET`
- `POST /developer/auth/login`
- `GET /developer/auth/me`

## API (authenticated)

| Path | Permission |
|------|------------|
| `GET /developer/dashboard` | any developer |
| `GET /developer/orgs` | org.view / impersonate |
| `POST /developer/impersonate` | org.impersonate |
| `POST /developer/impersonate/:id/end` | org.impersonate |
| `GET/POST /developer/modules`, `PATCH /developer/modules/:code` | modules.* |
| `GET/POST /developer/feature-flags` | feature_flags.manage |
| `GET /developer/logs` | logs.view |
| `GET/POST /developer/api-keys`, `POST .../revoke` | api_keys.manage |
| `POST /developer/billing/override` | billing.override |

All mutating actions write `DeveloperActionLog`.

## UI

- `/developer` — dashboard
- `/developer/impersonate`, `/modules`, `/feature-flags`, `/logs`, `/api-keys`
- `/developer/login`, `/developer/bootstrap`

Navigate Vera → **Developer**.

## Bridges

- Next: `/api/developer/[...path]` → SaaS
- Nest tRPC: `developer` router

Env: `VERIFORGE_SAAS_URL`, `DEVELOPER_BOOTSTRAP_SECRET`

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma db seed
```

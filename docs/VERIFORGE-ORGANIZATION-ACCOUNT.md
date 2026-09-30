# VeriForge Organization Account System

Organization accounts are the **system of record** in Postgres via `services/veriforge-saas-service` (default `http://127.0.0.1:3020`). Nest’s JSON tenant registry remains the operational VeriForge control surface until a later cutover — see `docs/VERIFORGE-MULTI-TENANT-SAAS.md`.

## Models (SaaS Prisma)

| Model | Role |
|-------|------|
| `Organization` | Tenant: profile, `modulesEnabled` JSON cache, `subscriptionProfile`, contact fields |
| `User` | Org members (`firstName` / `lastName` + `fullName`) |
| `Role` / `Permission` / `UserRole` | Platform catalog + JWT RBAC |
| `OrgRole` / `OrgRoleUser` | Org-scoped roles (Owner, Admin, Manager, Worker + custom) |
| `OrganizationModule` | Enabled product modules (`vericore`, `veripm`, `verihub`) |
| `OnboardingEvent` | Provisioning audit trail (`org.provisioned`) |

Worker display maps to system role code `user`.

## Provisioning

`POST /org/create` (and alias `POST /auth/signup`) runs `OrgProvisioningService.provision` in one transaction:

1. Create organization (active, empty `subscriptionProfile`)
2. Create owner user (Argon2 password)
3. Seed four `OrgRole` rows from `ROLE_PERMISSION_DEFAULTS`
4. Assign owner → Owner org role + system `owner` `UserRole`
5. Enable selected modules **plus** `verihub`; sync `modulesEnabled`
6. Start trial / subscription rows
7. Insert `OnboardingEvent` `{ type: "org.provisioned" }` + audit `auth.signup`

## API surface

Mounted on SaaS Express at `/org`:

| Method | Path | Auth |
|--------|------|------|
| POST | `/org/create` | Public (rate-limited) |
| POST | `/org/user/create` | JWT + `org.users.manage` + module `verihub` |
| POST | `/org/role/create` | JWT + `org.roles.manage` + `verihub` |
| POST | `/org/modules/update` | JWT + `org.modules.manage` + `verihub` |
| GET | `/org/:id` | JWT, same org |
| GET | `/org/:id/users` | JWT + `org.users.view` \| `org.users.manage` |
| GET | `/org/:id/modules` | JWT, same org |
| GET | `/org/:id/roles` | JWT, same org |

Org id in the path must match JWT `org_id` (platform admins excepted).

## Bridges

- **Next BFF:** `vera-frontend/app/api/org/[...path]` → SaaS `/org/*`
- **Nest tRPC:** `backend/src/server/api/routers/org.ts` proxies to SaaS with forwarded `Authorization`

Env:

```bash
VERIFORGE_SAAS_URL=http://127.0.0.1:3020
# optional alias
NEXT_PUBLIC_SAAS_URL=http://127.0.0.1:3020
```

## VeriHub console

UI under `/verihub` (Navigate Vera module **VeriHub**):

- Overview, Modules, Users, Roles, Billing, Compliance, Scorecards, Projects
- Signup: `/verihub/signup` → `POST /api/org/create`
- Client session: SaaS access token in `localStorage` (`lib/verihub-org-api.ts`)

Daily worker Hub remains `/hub`. `/verihub` is the org control plane.

## Seed

```bash
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma db seed
```

Ensures modules (including `verihub`), permissions (`org.*`, `compliance.view`, `projects.manage`, …), and system roles exist.

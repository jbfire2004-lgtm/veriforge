# VeriForge SaaS Service

Express + Prisma multi-tenant backend for organizations, RBAC, modules (VeriCore / VeriPM / VeriHub), trials, pricing, and Stripe billing.

## Services

| Service | Responsibility |
|---|---|
| `AuthService` | Signup, login, logout, JWT (`user_id` + `org_id`), sessions |
| `OrganizationService` | Org profile, slug, admin listing |
| `UserService` | Invite users, safe user projection |
| `PricingService` | Module quote → monthly/annual totals + line items |
| `RBACService` | Load role/permissions, `can()` / `assertCan()` |
| `ModulePermissionService` | Sync module permissions onto system roles |
| `ModuleService` | Enable/disable org modules (effective dating) |
| `TrialService` | Start/extend/expire 7-day trials |
| `BillingIntegrationService` | Stripe customer/subscription + webhooks |

## Routes

```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/me

POST   /pricing/quote
GET    /modules

PATCH  /organizations/:orgId
POST   /organizations/:orgId/users/invite
GET    /organizations/:orgId/trial
GET    /organizations/:orgId/modules
POST   /organizations/:orgId/trial/extend
POST   /organizations/:orgId/billing/convert

GET    /admin/organizations
GET    /admin/organizations/:orgId
PATCH  /admin/organizations/:orgId/modules
PATCH  /admin/organizations/:orgId/subscription
POST   /admin/organizations/:orgId/trial/extend
PATCH  /admin/organizations/:orgId/onboarding
GET    /admin/onboarding
PATCH  /admin/onboarding/:orgId
GET    /admin/pricing
PATCH  /admin/pricing

POST   /webhooks/stripe
GET    /health
```

## Quick start

```bash
cd services/veriforge-saas-service
cp .env.example .env
# set DATABASE_URL, JWT_* secrets
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Apply the shared SQL DDL instead of `db push` if preferred:

`docs/veriforge-saas-multi-tenant-schema.sql`

## Signup flow

1. Validate modules + password  
2. `PricingService.quote`  
3. Transaction: org → owner user → owner role → `organization_modules` → trial + `subscriptions` / `subscription_items`  
4. Issue JWT with `user_id`, `org_id`, role, permissions (module-filtered)

RBAC catalog: `src/rbac/permission-catalog.ts` · docs: `docs/veriforge-rbac.md`  
Example protected routes: `GET/POST /features/vericore/audits` (requires `vericore.audit.view|edit`)

## Trial expiry

Hourly cron (`trial-expiry.job.ts`) calls `TrialService.expireDueTrials()`:
- `is_trial_active = false`
- subscription → `canceled` if not paid
- modules locked via `organization_modules.enabled = false`

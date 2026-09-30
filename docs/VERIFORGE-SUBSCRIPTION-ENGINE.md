# VeriForge Subscription Engine

The subscription engine is the **source of truth for product module entitlements** per organization. It sits alongside the legacy Stripe `Module` catalog (`vericore`, `veripm`, `verihub`) and keeps both layers in sync.

## Data model

### `SubscriptionProfile`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `org_id` | UUID | FK → `organizations` (1:1) |
| `modules_enabled` | JSON | Map of product module code → boolean |
| `billing_plan` | enum | `trial`, `starter`, `professional`, `enterprise` |
| `billing_status` | enum | Reuses `SubscriptionStatus` (`trialing`, `active`, …) |
| `created_at` / `updated_at` | timestamp | Audit |

Migration: `20260826050000_subscription_engine`.

### Product modules

| Code | Name |
|------|------|
| `core` | Core (required, included) |
| `pm` | Project Management |
| `safety` | Safety |
| `compliance` | Compliance |
| `wallet` | Wallet |
| `training` | Training |
| `audits` | Audits |
| `investigations` | Investigations |
| `scorecards` | Scorecards |
| `hiring_client_tools` | Hiring Client Tools |

Catalog and pricing live in `services/veriforge-saas-service/src/subscription/product-modules.ts`.

## Module access middleware

`requireSubscriptionModule(code)` loads `SubscriptionProfile.modules_enabled` for the JWT org. When disabled, responds **403** with:

```json
{
  "error": "Module not enabled: Compliance",
  "code": "MODULE_ACCESS_DENIED",
  "details": {
    "module": "compliance",
    "moduleName": "Compliance",
    "upgradeUrl": "/verihub/modules",
    "suggestion": "Upgrade your subscription to enable Compliance. Open VeriHub → Modules to add this module."
  }
}
```

Wired on compliance upload/update routes. Extend to other module routers as features land.

## API (SaaS service `:3020`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/modules` | Org JWT | Catalog + enabled state + pricing + usage |
| POST | `/modules/update` | Org JWT + `org.modules.manage` | Enable/disable product modules |
| GET | `/billing` | Org JWT | Billing plan, status, Stripe snapshot, totals |
| POST | `/billing/update` | Org JWT + `org.billing.manage` | Update plan/status/cycle |
| GET | `/modules/catalog` | Public | Legacy Stripe module catalog |

Legacy org console routes (`/org/:id/modules`, `/org/modules/update`) remain for backward compatibility.

## VeriHub UI

- **Route:** `/verihub/modules`
- **Client:** `vera-frontend/lib/subscription-api.ts`
- **Proxies:** `/api/modules`, `/api/modules/update`, `/api/billing`, `/api/billing/update`

Shows plan summary, per-module pricing, usage metrics, and enable/disable actions.

## Nest tRPC

Router: `backend/src/server/api/routers/subscription.ts` → `subscription.getModules`, `updateModules`, `getBilling`, `updateBilling`.

## Provisioning

New orgs receive a `SubscriptionProfile` during `OrgProvisioningService.provision`, with `modules_enabled` derived from legacy signup module selection.

## Local setup

```powershell
cd services/veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

Ensure `VERIFORGE_SAAS_URL=http://127.0.0.1:3020` in the frontend/backend environment.

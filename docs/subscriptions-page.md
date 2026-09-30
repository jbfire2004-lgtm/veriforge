# Vera Subscription Page

## Routes

| Route | Purpose |
|-------|---------|
| `/subscriptions` | Module cards, pricing, feature comparison |
| `/subscriptions/checkout` | Plan + add-on selection and purchase |

## API (`/api/v1/subscriptions`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/catalog` | No | Full UI catalog (modules, comparison, plans, add-ons) |
| GET | `/tiers` | No | ACP tiers merged with commercial plan metadata |
| GET | `/features` | No | Feature flags + add-on mapping |
| GET | `/me` | JWT | Current tenant subscription |
| POST | `/purchase` | JWT | Assign tier + enable plan/add-on features |
| POST | `/addons` | JWT | Enable add-on feature flags only |

## Purchase flow

1. User selects plan (+ optional add-ons) on checkout.
2. `SubscriptionsService` resolves or creates `AcpTenant` for the user (company admin+).
3. `tenant_subscriptions` updated via `AcpService.assignTenantSubscription`.
4. `tenant_feature_flags` toggled for plan and add-on feature keys.
5. Client clears ACP access cache and redirects to `/welcome` (Vera Hub).

## Catalog source

`backend/src/subscriptions/subscriptions.catalog.ts` — commercial display data.

ACP seed (`acp.constants.ts`) — persisted tiers and feature flags.

## Client

- `vera-frontend/lib/subscriptions-api.ts`
- `vera-frontend/src/components/subscriptions/*`
- `vera-frontend/src/pages/subscriptions/*`

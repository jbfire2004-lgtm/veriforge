# Vera Admin Subscription Map

Official admin subscription & user tracking system.

## Routes

| UI | API |
|----|-----|
| `/admin/subscriptions` | `GET /api/v1/admin/subscriptions` |
| KPI summary (page) | `GET /api/v1/admin/subscriptions/summary` |
| Map pins | `GET /api/v1/admin/subscriptions/map` |
| Growth charts | `GET /api/v1/admin/subscriptions/growth` |
| Admin actions | `POST /api/v1/admin/subscriptions/update` |

## Data model

- **Company** — `industry`, `city`, `province`, `lat`, `lng`
- **AcpTenantSubscription** — `seatsPurchased`, `modulesEnabled` (JSON), `renewalDate`, `status`, tier
- **User** — `companyId`, `active`, `role`

## Components (`vera-frontend/src/components/admin/subscriptions/`)

| Spec | Component |
|------|-----------|
| `AdminPageLayout` | `AdminPageLayout` |
| `KpiCard` | `KpiCard` |
| `SubscriptionMap` | `SubscriptionMap` |
| `SubscriptionTable` | `SubscriptionTable` |
| `ModuleAdoptionChart` | `ModuleAdoptionChart` |
| `GrowthTimeline` | `GrowthTimeline` |
| `SubscriptionActionsMenu` | `SubscriptionActionsMenu` |
| `CompanyTooltip` | `CompanyTooltip` |
| `SeatUsageBar` | `SeatUsageBar` |

## Navigation

Settings module → **Subscription Map** (primary admin feature).

Also: User Management, System Logs, Feature Flags, Adoption Map, Feedback Manager.

# VeriForge Prisma schema

**Source of record (migrate / generate):**  
`services/veriforge-saas-service/prisma/schema.prisma`

**Domain documentation copy:**  
`packages/veriforge/src/db/schema.prisma`

## Sketch → production mapping

| Sketch | Production |
|--------|------------|
| `@default(cuid())` | `@default(uuid()) @db.Uuid` |
| `Role` (org-scoped) | `OrgRole` + `OrgRoleUser` |
| System RBAC | `Role` + `Permission` + `UserRole` |
| `Scorecard` | `Scorecard` → table `org_compliance_scorecards` |
| `modules_enabled` on org | `Organization.modulesEnabled` (legacy) + `SubscriptionProfile.modulesEnabled` (canonical) |
| `subscription` relation | `SubscriptionProfile` (1:1) |

## Core tables by domain

### Organization accounts
- `organizations`, `users`, `org_roles`, `org_role_users`
- `user_roles`, `roles`, `permissions`, `role_permissions`
- `refresh_tokens`, `onboardings`, `onboarding_events`

### Hiring client accounts
- `hiring_clients`, `hiring_client_users`, `hiring_client_refresh_tokens`
- `contract_awards`

### Developer accounts
- `developers`, `developer_refresh_tokens`, `developer_api_keys`
- `feature_flags`, `impersonation_sessions`, `developer_action_logs`

### Compliance
- `compliance_artifacts`
- `compliance_notification_logs`

### Scorecard engine
- `org_compliance_scorecards` (`Scorecard` model)
  - `global_score`, `overall_score`, `compliance_score`
  - `compliance_breakdown` (JSON)
  - `project_scores` (JSON)

### Subscription engine
- `subscription_profiles` (product module entitlements)
- `modules`, `module_prices`, `organization_modules`
- `subscriptions`, `subscription_items` (Stripe)
- `module_permissions`

### Multi-tenant isolation

| Tenant | Tables keyed by |
|--------|-----------------|
| Organization | `org_id` |
| Hiring client | `hiring_client_id` |
| Developer | `developer_id` |

Never join across tenants without an explicit bridge (`contract_awards`, `impersonation_sessions`).

## Migrations (SaaS)

| Migration | Purpose |
|-----------|---------|
| `20260720000000_init` | Base org, users, modules, Stripe |
| `20260720010000_perf_indexes` | Indexes |
| `20260826010000_org_account_system` | Org roles, contact fields |
| `20260826020000_hiring_client_account` | Hiring clients |
| `20260826030000_developer_account` | Developers |
| `20260826040000_compliance_module` | Artifacts + scorecard |
| `20260826050000_subscription_engine` | SubscriptionProfile |
| `20260826060000_scorecard_compliance_breakdown` | Rename breakdown column |
| `20260826070000_scorecard_global_project` | `global_score` + `project_scores` |

## Apply

```powershell
cd C:\Projects\veri-temp\services\veriforge-saas-service
npx prisma migrate deploy
npx prisma generate
```

## Scorecard model (current)

```prisma
model Scorecard {
  id                  String   @id @default(uuid()) @db.Uuid
  orgId               String   @map("org_id") @db.Uuid
  globalScore         Int      @default(0) @map("global_score")
  overallScore        Int      @default(0) @map("overall_score")
  complianceScore     Int      @default(0) @map("compliance_score")
  complianceBreakdown Json     @default("{}") @map("compliance_breakdown")
  projectScores       Json     @default("[]") @map("project_scores")
  calculatedAt        DateTime @default(now()) @map("calculated_at")
  // ...
  @@unique([orgId])
  @@map("org_compliance_scorecards")
}
```

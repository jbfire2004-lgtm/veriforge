# VeriForge API Route Map (tRPC)

Nest backend exposes tRPC at `/trpc`. Procedure paths use nested routers:

```
/trpc/{namespace}.{procedure}
```

All VeriForge SaaS procedures proxy to `VERIFORGE_SAAS_URL` (default `http://127.0.0.1:3020`).

Implementation: `backend/src/server/api/routers/`

---

## `/api/org` — Organization accounts (VeriHub)

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `createOrganization` | POST `/org/create` | Provision org + owner |
| `createUser` | POST `/org/user/create` | Add org member |
| `createRole` | POST `/org/role/create` | Create org role |
| `updateModules` | POST `/org/modules/update` | Legacy module toggles |
| `getOrganization` | GET `/org/:orgId` | Org detail |
| `getUsers` | GET `/org/:orgId/users` | Member list |
| `getRoles` | GET `/org/:orgId/roles` | Role list |
| `getModules` | GET `/org/:orgId/modules` | Legacy enabled modules |

Auth: org JWT (`authorization` input field).

---

## `/api/client` — Hiring client accounts

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `getContractors` | GET `/client/contractors` | Contractor directory |
| `getContractorScorecard` | GET `/client/contractor/:id/scorecard` | Scorecard view |
| `getContractorCompliance` | GET `/client/contractor/:id/compliance` | Compliance bundle |
| `awardContract` | POST `/client/contractor/:id/award` | Award work |
| `reviewCompliance` | POST `/compliance/:artifactId/review` | Approve/reject artifact |

Auth: hiring-client JWT.

---

## `/api/developer` — Developer console

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `getOrganizations` | GET `/developer/orgs` | Search orgs |
| `getLogs` | GET `/developer/logs` | Action log |
| `impersonateUser` | POST `/developer/impersonate` | Org impersonation |
| `createModule` | POST `/developer/modules` | Module builder |
| `updateModule` | PATCH `/developer/modules/:code` | Update module |
| `toggleFeatureFlag` | POST `/developer/feature-flags` | Upsert flag |

Auth: developer JWT.

---

## `/api/compliance` — Compliance module

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `uploadArtifact` | POST `/compliance/upload` | Upload artifact |
| `reviewArtifact` | POST `/compliance/:id/review` | Review workflow |
| `updateArtifact` | POST `/compliance/:id/update` | Update / re-submit |
| `getComplianceStatus` | GET `/compliance/:orgId` | Summary + scorecard |
| `getArtifacts` | GET `/compliance/:orgId` | Full org compliance |

---

## `/api/scorecards` — Safety scorecard engine

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `getScorecard` | GET `/scorecard/:orgId` | Org scorecard + breakdown |
| `recalculateScorecard` | POST `/scorecard/recalculate` | Force recalc |
| `getProjectScorecard` | GET `/client/contractor/:orgId/scorecard` | Project slice (scaffold) |
| `getGlobalScorecard` | GET `/client/contractor/:orgId/scorecard` | Global slice |

---

## `/api/modules` — Subscription engine (modules)

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `listModules` | GET `/modules` | Product catalog + entitlements |
| `updateModules` | POST `/modules/update` | Enable/disable modules |
| `getModuleStatus` | GET `/modules` | Single or all module status |
| `catalog` | GET `/modules/catalog` | Public legacy catalog |

---

## `/api/billing` — Subscription engine (billing)

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `getBillingProfile` | GET `/billing` | Plan, status, Stripe snapshot |
| `updateBilling` | POST `/billing/update` | Update plan/status/cycle |
| `updatePlan` | POST `/billing/update` | Plan-only shortcut |

---

## `/api/auth` — Authentication (3 namespaces)

| Procedure | HTTP (SaaS) | Namespace |
|-----------|-------------|-----------|
| `login` | POST `/auth/login` | Organization |
| `register` | POST `/auth/signup` | Organization |
| `clientLogin` | POST `/client/auth/login` | Hiring client |
| `developerLogin` | POST `/developer/auth/login` | Developer |
| `logout` | POST `/auth/logout` | Organization |
| `me` | GET `/auth/me` | Organization |

---

## `/api/notifications` — Notification engine

| Procedure | HTTP (SaaS) | Description |
|-----------|-------------|-------------|
| `getNotifications` | GET `/notifications` | User + org in-app inbox |
| `getOrgNotifications` | GET `/notifications/org` | Org-wide inbox |
| `markAsRead` | POST `/notifications/read` | Mark ids read |
| `sendEmail` | POST `/notifications/sendEmail` | Queue email via EmailQueue |

See `docs/VERIFORGE-NOTIFICATION-SYSTEM.md`.

---

## `/api/cron` — Scheduled jobs

| Procedure | Schedule | SaaS job |
|-----------|----------|----------|
| `runComplianceExpiryCheck` | daily 02:00 UTC | `jobs/complianceExpiryCheck.ts` |
| `runScorecardRecalculation` | hourly | `jobs/scorecardRecalculation.ts` |
| `runNotificationDispatcher` | every 5 min | `jobs/notificationDispatcher.ts` |
| `runBillingCycleCheck` | daily 03:00 UTC | `jobs/billingCycleCheck.ts` |
| `runModuleUsageTracker` | hourly | `jobs/moduleUsageTracker.ts` |

Production: `services/veriforge-saas-service` worker (`startAllCronJobs`). See `docs/VERIFORGE-CRON-JOBS.md`.

---

## Deprecated aliases

| Old namespace | New namespace |
|---------------|---------------|
| `hiringClient.*` | `client.*` |
| `subscription.*` | `modules.*` / `billing.*` |
| `scorecard.*` | `scorecards.*` |

---

## Example (tRPC client)

```typescript
// Organization modules
await trpc.modules.listModules.query({ authorization: `Bearer ${token}` });

// Hiring client review
await trpc.client.getContractorScorecard.query({
  authorization: `Bearer ${hcToken}`,
  contractorId: orgId,
});

// Scorecard recalculation
await trpc.scorecards.recalculateScorecard.mutate({
  authorization: `Bearer ${token}`,
  orgId,
});
```

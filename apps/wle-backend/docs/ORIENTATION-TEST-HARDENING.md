# Orientation System — Test & Hardening Requirements

This document defines the acceptance tests and hardening controls for the VeriForge Orientation System (`backend/src/modules/orientation/veriforge`).

## Scope

| Area | Unit | Integration | E2E |
|------|------|-------------|-----|
| OrientationDefinition | ✅ | ✅ | ✅ |
| OrientationRequirement | ✅ | ✅ | ✅ |
| OrientationCompletion | ✅ | ✅ | ✅ |
| WorkerOrientationProfile | ✅ | ✅ | ✅ |
| Security (RBAC / tenant / upload) | ✅ | ✅ | — |
| Performance | notes + indexes | listing take limits | — |

## 1. OrientationDefinition

### Requirements
- Create **native**, **uploaded**, and **hybrid** orientations.
- Validate required fields (`title` non-empty; `type`; `companyId`).
- Versioning: content publish / bump → `1.0` → `1.1` (`bumpMinorVersion`).
- **Only published** orientations may be assigned as requirements or delivery links.

### Hardening
- `contentBlocks` must be an array of known types (`slide|text|video|quiz|policy_ack`).
- Quiz blocks require `prompt`, ≥2 `choices`, in-range `answerIndex`.
- Max 200 blocks per definition.
- Cross-tenant `get` / `update` denied via `companyId` check (`ForbiddenException`).
- List filtered by `companyId` (index: `companyId, type, isPublished`).

### Tests
- Unit: `orientation-definition.service.spec.ts`, `orientation-validation.spec.ts`
- Integration: create modes, malformed blocks → 400, version bump
- E2E: admin creates published native orientation

## 2. OrientationRequirement

### Requirements
- Create requirements scoped to **company**, **project**, **site**, **trade**, **unionDispatchType**.
- Resolve for a worker with trade + dispatch type (`resolveForWorker`).
- Honor `mustCompleteBefore`: `arrival` | `dispatch` | `assignment`.
- Unpublished definitions are excluded from resolution / create.

### Tests
- Unit: scoped create, unpublished reject, resolve filters drafts
- Integration: create arrival requirement; unpublished → 400
- E2E: admin creates arrival requirement

## 3. OrientationCompletion

### Requirements
- Record completion with optional `score` and idempotent `clientSyncId`.
- Status rules:
  - `completed` — default when score ≥ 70 or omitted
  - `failed` — score &lt; 70
  - `pending` — explicit
  - `expired` — via `expireDue` when `expiresOn < now`
- Expiry computed from `expiryRules.durationDays`.

### Tests
- Unit: status matrix + `expireDue`
- Integration: simulate past `expiresOn`, flip to `expired`
- E2E: worker completion with expiry date set

## 4. WorkerOrientationProfile

### Requirements
- Aggregate requirements + completions.
- `gatingStatus`:
  - **allowed** — all required completed and not expired
  - **blocked** — any required `arrival`/`dispatch` missing or expired
  - **warning** — assignment gaps, or completions within near-expiry window (30 days)

### Tests
- Unit: `worker-orientation-profile.service.spec.ts`
- Integration / E2E: blocked before complete → allowed/warning after

## 5. Security

### RBAC
- Workers **cannot** `POST/PUT` definitions or requirements (403).
- Supervisors / company admins manage definitions & requirements.
- Workers may complete orientations and read their profile.

### Tenant isolation
- Company admin cannot use another company’s `companyId` (TenantScope + definition `get` company check).

### Input / upload
- Malformed `contentBlocks` → 400.
- Upload: required file; allow-listed MIME; max **25MB**; object key `orientation/{companyId}/{timestamp}-{safeName}`.

### Tests
- Unit: delivery unpublished reject; upload validation helpers
- Integration: worker 403; bad MIME upload 400; tenant get check

## 6. Performance

### Targets
- Profile resolution: O(requirements + completions) with capped queries (`take: 200` / `100`).
- Definition listing for large companies: indexed by `companyId` + `isPublished`, `take: 200`.
- Requirement resolve uses composite indexes on `(companyId, projectId, isActive)` and `(tradeId, unionDispatchType)`.

### Recommended follow-ups
- Add pagination (`cursor` / `page`) when companies exceed 200 definitions.
- Materialize active completions per worker if profile hot-path exceeds SLO.
- Cron `expireDue` on interval to keep status durable (profile already treats past `expiresOn` as expired in-memory).

## How to run

```bash
# Unit (services + validation)
cd backend
npx jest --runInBand src/modules/orientation/veriforge/__tests__

# Integration (requires DATABASE_URL)
npx jest --runInBand test/orientation/orientation-system.integration.spec.ts

# E2E (same app bootstrap; also matched by test:e2e regex)
npx jest --config ./test/jest-e2e.json --runInBand test/orientation/orientation-system.e2e-spec.ts
```

## Traceability matrix

| Requirement ID | Covered by |
|----------------|------------|
| DEF-native/upload/hybrid | definition service unit + integration |
| DEF-versioning | definition service unit + integration |
| DEF-published-only | requirement + delivery unit + integration |
| REQ-scopes | requirement service unit |
| REQ-resolve | requirement service unit |
| COMP-status/expiry | completion service unit + integration |
| PROF-gating | profile service unit + e2e |
| SEC-rbac | integration |
| SEC-tenant | definition get + integration |
| SEC-validation/upload | validation unit + integration |
| PERF-indexes | schema + list/resolve take limits |
| E2E-admin-worker-wallet | `orientation-system.e2e-spec.ts` |

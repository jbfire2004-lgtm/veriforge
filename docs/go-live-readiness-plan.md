# Vera Go-Live Readiness Plan

## Goal

Move Vera Hub/Core/PM/FieldOS from integration-ready to production-ready with enforced release gates, secure runtime defaults, observable operations, and validated rollback safety.

## Phase 1: Release Governance

- Enforce protected branch rules on `main`.
- Require green checks before merge:
  - `backend-ci`
  - `vera-core-ci`
  - `vera-e2e`
  - `services-ci`
  - `go-live-smoke`
- Require reviewer approvals and disable bypass.

Exit criteria:
- Pull requests cannot merge unless all required checks are green.

## Phase 2: Environment and Secret Hardening

- Populate stage/prod secrets from `.env.production.example`.
- Validate strict production flags:
  - `NODE_ENV=production`
  - `ENABLE_ORIGIN_GUARD=1`
  - `VERA_VALIDATE_ENV_STRICT=1`
  - explicit `CORS_ORIGIN` values (no wildcard)
- Rotate legacy/default secrets.

Exit criteria:
- Production config validation passes at service startup.

## Phase 3: Deployment and Rollback Rehearsal

- Deploy release tags (`vX.Y.Z`) to stage first.
- Run migration with backup:
  - `MIGRATE_BACKUP_ON_DEPLOY=1 node scripts/migrate.mjs`
- Rehearse:
  - application rollback to previous tag
  - database restore from pre-migration backup

Exit criteria:
- Deploy and rollback both succeed in rehearsal with recorded timings.

## Phase 4: Functional Validation

- Run onboarding automation:
  - `node scripts/onboard-tenant.mjs`
- Run go-live smoke:
  - `node scripts/go-live-smoke.mjs`
- Run synthetic probe:
  - `node scripts/synthetic-probe.mjs`
- Confirm authenticated and FieldOS map flows are healthy.

Exit criteria:
- Smoke and probe suites pass with archived artifacts/logs.

## Phase 5: Observability and Incident Readiness

- Verify dashboards for:
  - API health/readiness
  - latency and error rate
  - event bus delivery/failure
  - map/offline sync reliability
- Verify alert routing to on-call for P0/P1 events.
- Run a failure drill (service outage and recovery).

Exit criteria:
- Alerts trigger correctly and on-call receives/acks incidents.

## Go/No-Go Decision Gate

Approve go-live only when all items are true:

- Required CI checks are enforced and green.
- Stage deployment and rollback rehearsals are documented.
- Security and env hardening checks are complete.
- Smoke and synthetic probes are passing.
- On-call and incident runbooks are confirmed.

## One-Command Checklist

Use this command to run core readiness checks from repo root:

```bash
npm run go-live:checklist
```

Environment variables:

- `SMOKE_BASE_URL` (default: `http://127.0.0.1:3001`)
- `SMOKE_ADMIN_EMAIL` (default: `admin@vera.com`)
- `SMOKE_PASSWORD` (default: `hashedpassword123`)
- `SYNTHETIC_BASE_URL` (defaults to `SMOKE_BASE_URL`)
- `GO_LIVE_SKIP_ONBOARDING=1` to skip seed/onboarding in already-prepared environments

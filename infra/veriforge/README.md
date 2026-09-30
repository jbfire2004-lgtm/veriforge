# VeriForge production infrastructure

## Architecture

```text
                         ┌─────────────────────┐
                         │  Clients / Stripe   │
                         └──────────┬──────────┘
                                    │ HTTPS
                         ┌──────────▼──────────┐
                         │ Ingress / NGINX     │
                         │ gateway             │
                         └───┬────────────┬────┘
                 /api /webhooks│            │ /
                    ┌──────────▼──┐   ┌─────▼────────┐
                    │ API (Node)  │   │ Frontend     │
                    │ HPA 2–10    │   │ (nginx SPA)  │
                    └─────┬───────┘   └──────────────┘
                          │
              ┌───────────┼────────────┐
              │           │            │
       ┌──────▼───┐  ┌────▼────┐  ┌───▼────────┐
       │ Postgres │  │ Redis   │  │ Worker     │
       │          │  │ cache   │  │ trial cron │
       └──────────┘  └─────────┘  └────────────┘
```

Observability: Prometheus scrapes `/metrics` · Grafana · Winston JSON logs · optional OTEL.

Local dual-stack ports (SPA :5175, SaaS :3020, workspace Next :3000, Nest :3001): see [`docs/VERIFORGE-LOCAL-PORTS.md`](../../docs/VERIFORGE-LOCAL-PORTS.md). Repo root: `npm run dev:veriforge`.

## Deploy strategies

| Path | Use |
|---|---|
| **Docker Compose** | Local / single-VM |
| **Kubernetes overlays** | Staging (`veriforge-staging`) → Production (`veriforge`) |

**Promotion (CD):**

1. Push to `main` (path-filtered) → VeriForge CI (unit + **required** Postgres integration) → build `sha-<12>` images → Cosign sign + SBOM + provenance attestations → deploy **staging** when `VERIFORGE_DEPLOY_STAGING_ENABLED=true`
2. Manual **promote-production** (`workflow_dispatch`) with the soaked `sha-*` tag → GitHub Environment `production` approval → digest-pinned apply
3. **rollback** dispatch → pin prior `sha-*@digest` or `kubectl rollout undo` (**never** migrate down)

**Zero-downtime forward deploy:** migrate Job completes → API/frontend rolling update (`maxUnavailable: 0`) → HPA scales API. Worker uses `maxUnavailable: 1` (single replica).

See also [`docs/VERIFORGE-LOCAL-PORTS.md`](../../docs/VERIFORGE-LOCAL-PORTS.md) and SPA boot via `npm run dev:veriforge` from the repo root.

## Quick start (Compose)

```bash
cp infra/veriforge/env/.env.local.example infra/veriforge/.env
# edit secrets
docker compose -f infra/veriforge/docker-compose.yml --env-file infra/veriforge/.env up -d --build
```

App: `http://localhost:8080` · API: `http://localhost:8080/api/health`

## Kubernetes

### Overlays

| Overlay | Namespace | Host (example) |
|---|---|---|
| `k8s/overlays/staging` | `veriforge-staging` | `staging.veriglobal.ca` |
| `k8s/overlays/production` | `veriforge` | `app.veriglobal.ca` |

```bash
# Preview
kubectl kustomize infra/veriforge/k8s/overlays/staging

# Secrets first (out-of-band or External Secrets — see below)
kubectl -n veriforge-staging create secret generic veriforge-secrets --from-literal=...

# Apply (CD uses scripts/kustomize-deploy.sh with tag@digest)
kubectl apply -k infra/veriforge/k8s/overlays/staging
```

### Repo variables / secrets

| Name | Purpose |
|---|---|
| `VERIFORGE_DEPLOY_STAGING_ENABLED` | `true` to auto-deploy staging on main |
| `KUBE_CONFIG_DATA` | Base64 kubeconfig (**temporary** — prefer OIDC) |
| GitHub Environments `staging` / `production` | Protection rules / required reviewers |

Legacy `VERIFORGE_DEPLOY_ENABLED` is no longer used; production is promote-only.

### Hotfix

1. Merge fix to `main` → staging auto-deploy (if enabled) → smoke
2. `workflow_dispatch` → action `promote-production` → `version=sha-<new>`
3. Emergency only: dispatch `rollback` with last-known-good `version`, or empty version for `rollout undo`

### Rollback

```bash
# Via CD (preferred)
# action=rollback, overlay=production|staging, version=sha-xxxxxxxxxxxx

# Manual
kubectl -n veriforge rollout undo deployment/veriforge-api
kubectl -n veriforge set image deployment/veriforge-api api=ghcr.io/<owner>/veriforge-api:sha-...@sha256:...
```

**Do not** run migrate down in prod. Prefer forward-fix migration or PITR. See [`docs/veriforge-migrations.md`](../../docs/veriforge-migrations.md).

## Secrets management

1. **Preferred:** External Secrets Operator + Vault/cloud SM — template at `k8s/externalsecret.example.yaml` (not applied by default).
2. **Accepted short-term:** `kubectl create secret generic veriforge-secrets` from `k8s/secrets.example.yaml` (never commit real values).
3. **CI auth:** Prefer GitHub OIDC → cloud identity (`docs/veriforge-oidc-deploy.md`). `KUBE_CONFIG_DATA` is interim only; scope SA to `veriforge` / `veriforge-staging` namespaces.

ConfigMaps hold non-secrets only (`CORS_ORIGIN`, URLs, feature flags). Include `METRICS_BEARER_TOKEN` and `FIELD_ENCRYPTION_KEY` in secrets.

## Environment templates

| File | Purpose |
|---|---|
| `env/.env.local.example` | Compose local |
| `env/.env.staging.example` | Staging checklist |
| `env/.env.production.example` | Prod checklist |

Required secrets include `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FIELD_ENCRYPTION_KEY` (prod), `STRIPE_*`, `RESEND_API_KEY`.

## Health

| Service | Live | Ready |
|---|---|---|
| API | `GET /health/live` | `GET /health/ready` |
| Worker | `GET /health/live` :3021 | `GET /health/ready` :3021 |
| Frontend | `/healthz` | `/healthz` |

## CI notes

- `npm ci` + lockfile cache (reproducible)
- Integration tests run against Postgres 16 service container (hard gate)
- Images tagged `sha-<12>` only (no `:latest` on the CD push path); deploy pins `tag@digest`
- Cosign keyless sign + SPDX SBOM artifacts + build provenance attestations

## Layout

```
infra/veriforge/
  docker-compose.yml
  scripts/kustomize-deploy.sh
  k8s/
    (base manifests)
    overlays/staging/
    overlays/production/
    externalsecret.example.yaml
    secrets.example.yaml
.github/workflows/veriforge-ci.yml
.github/workflows/veriforge-cd.yml
```

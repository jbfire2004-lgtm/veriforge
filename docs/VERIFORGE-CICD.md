# VeriForge CI/CD

Canonical workflows:

| Workflow | File | Trigger |
|----------|------|---------|
| CI | `.github/workflows/ci.yml` | push + PR (path-filtered) |
| CD | `.github/workflows/cd.yml` | push to `main` / manual |

Legacy wrappers: `veriforge-ci.yml`, `veriforge-cd.yml` (promote/rollback).

## CI jobs

1. **SaaS API** — pnpm install → Prisma validate/generate → lint → unit + integration tests (Postgres 16) → build  
2. **@veriforge/platform** — typecheck  
3. **Vite frontend** — lint + build  
4. **Next.js (`vera-frontend`)** — lint + typecheck + build  
5. **Docker smoke** — multi-stage build (no push)

## CD jobs

1. CI gate (`workflow_call` → `ci.yml`)  
2. Build/push `ghcr.io/<owner>/veriforge-api` + `veriforge-frontend` (`sha-<12>` + `latest`)  
3. **Prisma migrate** via `scripts/migrate.sh` using `secrets.VERIFORGE_DATABASE_URL`  
4. **Deploy** via `scripts/deploy.sh`

## Scripts

```bash
# Migrate (requires DATABASE_URL)
DATABASE_URL=postgres://... bash scripts/migrate.sh
DATABASE_URL=... bash scripts/migrate.sh --seed

# Deploy
DEPLOY_METHOD=kustomize DEPLOY_ENV=staging VER=sha-... API_DIGEST=... WEB_DIGEST=... bash scripts/deploy.sh
DEPLOY_METHOD=ssh DEPLOY_SSH_HOST=... DEPLOY_SSH_USER=... DEPLOY_SSH_KEY=... VER=sha-... bash scripts/deploy.sh
DEPLOY_METHOD=webhook DEPLOY_WEBHOOK_URL=... bash scripts/deploy.sh
DEPLOY_METHOD=dry-run bash scripts/deploy.sh
```

## Secrets / vars

| Name | Purpose |
|------|---------|
| `VERIFORGE_DATABASE_URL` | Production/staging Postgres for migrate |
| `DEPLOY_SSH_*` | SSH deploy |
| `DEPLOY_WEBHOOK_*` | Webhook deploy |
| `KUBE_CONFIG_DATA` / GCP / AWS / Azure OIDC | Kustomize deploy |
| `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` | AKS deploy (OIDC) |
| `AKS_CLUSTER`, `AKS_RESOURCE_GROUP` | AKS target (repo variables) |
| `VERIFORGE_DEPLOY_METHOD` | `kustomize` \| `ssh` \| `webhook` \| `dry-run` |
| `VERIFORGE_DEPLOY_STAGING_ENABLED` | `true` to allow staging kustomize |
| `VERIFORGE_RUN_DB_SEED` | `1` to seed after migrate |

## Docker

Multi-stage Dockerfiles (pnpm with npm lock fallback):

- `services/veriforge-saas-service/Dockerfile`
- `apps/veriforge-frontend/Dockerfile`

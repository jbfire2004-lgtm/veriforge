# VeriForge Docker deployment

## Layout

| File | Role |
|------|------|
| `infra/veriforge/Dockerfile` | Next.js multi-stage image (port **3000**, non-root) |
| `vera-frontend/Dockerfile` | Same app image (build context = package root) |
| `infra/veriforge/docker-compose.production.yml` | Production: **app**, **api**, **db**, **redis**, **worker**, gateway |
| `infra/veriforge/docker-compose.yml` | Local/dev stack (Vite frontend + postgres named `postgres`) |
| `infra/veriforge/scripts/production-deploy.sh` | Pull/build → migrate → recreate containers |
| `scripts/production-deploy.sh` | Root wrapper |
| `*.dockerignore` | Excludes `node_modules`, `.next/cache`, `.env*`, logs |

## Quick start (production)

```bash
cp infra/veriforge/env/.env.production.example infra/veriforge/.env
# edit secrets — DATABASE_URL host must be `db`

bash scripts/production-deploy.sh --build
```

Next.js image builds from **monorepo root** (`infra/veriforge/Dockerfile`) so `packages/*` workspace deps resolve.

## Services

| Service | Image / role | Port (internal) |
|---------|--------------|-----------------|
| `app` | Next.js (`vera-frontend`) | 3000 |
| `api` | SaaS Express | 3020 |
| `worker` | Cron jobs (`dist/worker.js`) | 3021 health |
| `db` | PostgreSQL 16 (volume `veriforge_pg_data`) | 5432 |
| `redis` | Redis 7 AOF | 6379 |
| `gateway` | nginx → app + `/api` → api | `${HTTP_PORT:-80}` |
| `migrate` | one-shot `prisma migrate deploy` | — |

## Health & restart

- All long-running services: `restart: unless-stopped`
- Healthchecks on `db`, `redis`, `api`, `worker`, `app`, `gateway`
- Deploy script waits for readiness after recreate

## Secrets

Never bake secrets into images. Use `infra/veriforge/.env` (gitignored) or your secret manager → env file / Compose `environment`.

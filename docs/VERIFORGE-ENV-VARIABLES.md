# VeriForge Environment Variables

Canonical template: [`infra/veriforge/.env.example`](../infra/veriforge/.env.example)

Service-specific copies:

| File | Process |
|------|---------|
| `services/veriforge-saas-service/.env.example` | SaaS API + worker |
| `vera-frontend/.env.example` | Next.js app |
| `apps/veriforge-frontend/.env.example` | Vite signup UI |
| `infra/veriforge/env/.env.{local,staging,production}.example` | Docker Compose |

---

## Quick reference (requested names)

| Your name | Actual variable(s) | Required |
|-----------|-------------------|----------|
| `DATABASE_URL` | `DATABASE_URL` | Yes (API/worker) |
| `JWT_SECRET` | `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET` | Yes |
| `PASSWORD_SALT_ROUNDS` | *(Argon2id — not env-tuned)* | No |
| `EMAIL_PROVIDER_API_KEY` | `RESEND_API_KEY` | No (console fallback) |
| `EMAIL_FROM` | `EMAIL_FROM` | No |
| `REDIS_URL` | `REDIS_URL` | Recommended prod |
| `NEXTAUTH_SECRET` | `NEXTAUTH_SECRET` | Yes (Next.js) |
| `NEXTAUTH_URL` | `NEXTAUTH_URL` | Yes (Next.js) |
| `CRON_ENABLED` | `RUN_CRON_IN_API` + worker deploy | See cron section |
| `LOG_LEVEL` | `LOG_LEVEL` | No (default `info`) |
| `FEATURE_FLAGS` | DB flags + optional JSON / `NEXT_PUBLIC_*` | No |
| `DEV_MODE` | `NODE_ENV=development` + seed flags | Local only |

---

## Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | **Required.** Postgres URL for Prisma (`services/veriforge-saas-service`). |
| `POSTGRES_DB` | `veriforge` | Compose postgres database name. |
| `POSTGRES_USER` | `veriforge` | Compose postgres user. |
| `POSTGRES_PASSWORD` | — | **Required in Compose.** |
| `SHADOW_DATABASE_URL` | — | Optional; `prisma migrate dev` only. |
| `DB_POOL_SIZE` | `5` / `15` prod | Prisma connection pool limit. |
| `DB_POOL_TIMEOUT` | `20` | Pool wait timeout (seconds). |
| `RUN_DB_SEED` | `1` local / `0` prod | Run catalog seed after `migrate deploy`. |
| `ALLOW_DESTRUCTIVE_MIGRATIONS` | `0` | Set `1` to allow DROP/ALTER deploy after review. |

**Source of truth schema:** `services/veriforge-saas-service/prisma/schema.prisma`

---

## Authentication & JWT

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_SECRET` | — | **Required.** Signs org/hiring-client/dev access tokens (≥32 chars prod). |
| `JWT_REFRESH_SECRET` | — | **Required.** Refresh token HMAC (≥32 chars prod). |
| `JWT_ACCESS_SECRETS` | — | Optional rotation: `kid:secret,kid2:secret2`. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL. |
| `JWT_REFRESH_EXPIRES_DAYS` | `7` | Refresh token lifetime. |
| `JWT_ISSUER` | `veriforge` | JWT `iss` claim. |
| `JWT_AUDIENCE` | `veriforge-app` | JWT `aud` claim. |
| `FIELD_ENCRYPTION_KEY` | — | **Required prod.** AES-GCM for PII fields (≥32 chars). |
| `FIELD_ENCRYPTION_OPTIONAL` | `false` | Allow missing key in non-prod. |
| `COOKIE_SECURE` | `false` | Set `true` when serving over HTTPS. |
| `ENFORCE_HTTPS` | `false` | Helmet HSTS in API. |
| `CORS_ORIGIN` | `*` | Comma-separated origins; `*` forbidden in production. |

**Password hashing:** Argon2id in `src/security/password.ts` — not configured via `PASSWORD_SALT_ROUNDS`. Legacy bcrypt hashes are verified only; new passwords use Argon2.

**Legacy aliases:** `JWT_SECRET` → use `JWT_ACCESS_SECRET`. `BCRYPT_ROUNDS` / `PASSWORD_SALT_ROUNDS` → unused for new hashes.

---

## Next Auth (Next.js)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_SECRET` | — | Session encryption for NextAuth (`vera-frontend/lib/auth-options.ts`). |
| `NEXTAUTH_URL` | — | Public URL of the Next app (e.g. `https://app.veriforge.example`). |

---

## Email

| Variable | Default | Description |
|----------|---------|-------------|
| `RESEND_API_KEY` | — | Resend API key (`EMAIL_PROVIDER_API_KEY` alias). |
| `EMAIL_FROM` | `VeriForge <onboarding@veriforge.local>` | From header. |
| `APP_PUBLIC_URL` | `http://localhost:5175` | Links in transactional email. |

Without `RESEND_API_KEY`, the API logs emails to stdout (dev-friendly).

---

## Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | — | e.g. `redis://localhost:6379` or `redis://redis:6379` in Compose. |
| `REDIS_DISABLED` | `false` | Skip Redis client (tests). |
| `CACHE_TTL_RBAC_SEC` | `120` | Permission cache TTL. |
| `CACHE_TTL_PRICING_SEC` | `300` | Pricing cache TTL. |
| `CACHE_TTL_MODULES_SEC` | `300` | Module entitlement cache TTL. |

Used for caching, notification dispatch coalescing, and session-adjacent invalidation — not the primary notification inbox store (Postgres).

---

## Cron jobs

| Variable | Default | Description |
|----------|---------|-------------|
| `CRON_ENABLED` | — | **Documented alias.** In production, deploy the `worker` service (`docker-compose.production.yml`). |
| `RUN_CRON_IN_API` | `false` | Attach node-cron to API process (dev / `RUN_CRON_IN_API=true`). |
| `WORKER_MODE` | `false` | Set `true` in worker container. |
| `WORKER_HEALTH_PORT` | `PORT+1` | Worker `/health` port (default `3021`). |
| `TRIAL_JOB_BATCH_SIZE` | `100` | Trial expiry batch size. |
| `TRIAL_JOB_CONCURRENCY` | `5` | Trial job concurrency. |

**Jobs:** compliance expiry, scorecard recalc, notification dispatch, billing cycle, module usage, trial workflow — see `docs/VERIFORGE-CRON-JOBS.md`.

---

## Logging & observability

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Pino log level. |
| `OTEL_ENABLED` | `false` | Enable OpenTelemetry. |
| `OTEL_SERVICE_NAME` | `veriforge-saas-service` | Service name in traces. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | OTLP HTTP endpoint. |
| `OTEL_DIAG_LOG` | `false` | Verbose OTEL diagnostics. |
| `METRICS_BEARER_TOKEN` | — | **Required prod** for `/metrics` scrape. |

---

## Feature flags

| Mechanism | Description |
|-----------|-------------|
| **Developer console** | Persistent flags in Postgres — `/developer/feature-flags`, `DeveloperFeatureFlag` model. |
| `FEATURE_FLAGS` | Optional JSON env for future/client scaffolding (not read by SaaS API today). |
| `NEXT_PUBLIC_VERIFORGE_DEMO_ROLE_SWITCH` | Next.js demo role dropdown (never enable in hosted prod). |

Example JSON (client scaffold):

```json
{"newScorecardEngine": true}
```

---

## Developer tools

| Variable | Default | Description |
|----------|---------|-------------|
| `DEVELOPER_BOOTSTRAP_SECRET` | — | One-time secret for first developer account bootstrap. |
| `PLATFORM_ADMIN_EMAILS` | — | Comma-separated emails with `/admin/*` access. |
| `SEED_DEV_USERS` | `1` local | Seed dev org/users (`prisma/seed-dev-users.ts`). |
| `SEED_DEV_ADMIN_EMAIL` | `admin@veriforge.local` | Dev admin email. |
| `SEED_DEV_ADMIN_PASSWORD` | `Str0ng!Passw0rd` | Dev admin password. |
| `SEED_DEV_TRIAL_DAYS` | `90` | Trial length for seeded orgs. |
| `DEV_MODE` | — | **Documented alias** for local dev: `NODE_ENV=development`, seeds on, console email. |

---

## Next.js / proxy (vera-frontend)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Vera Nest API (rewrites). |
| `NEXT_PUBLIC_SITE_URL` | — | Canonical site URL. |
| `NEXT_PUBLIC_BASE_PATH` | — | e.g. `/vera` when mounted under subpath. |
| `VERIFORGE_SAAS_URL` | `http://127.0.0.1:3020` | Server-side proxy to SaaS (`/api/org`, `/api/notifications`, …). |
| `NEXT_PUBLIC_SAAS_URL` | — | Client-visible SaaS URL fallback. |

---

## Billing (optional)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API key. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `ANNUAL_DISCOUNT_PERCENT` | Default `17`. |
| `TRIAL_DAYS` | Default trial length `7`. |
| `CURRENCY` | Default `USD`. |

---

## Document Center storage

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCUMENT_STORAGE_PROVIDER` | `local` | `local` \| `s3` \| `supabase` |
| `DOCUMENT_STORAGE_LOCAL_PATH` | `uploads/documents` | Local disk root |
| `DOCUMENT_STORAGE_PUBLIC_BASE_URL` | derived | Public URL prefix for stored objects |
| `DOCUMENT_S3_BUCKET` / `AWS_S3_BUCKET` | — | S3 bucket |
| `DOCUMENT_S3_PUT_URL` | — | PUT template containing `{key}` |
| `SUPABASE_URL` | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Service role for Storage uploads |
| `SUPABASE_STORAGE_BUCKET` | `veriforge-documents` | Storage bucket name |

See `docs/VERIFORGE-DOCUMENT-CENTER.md`.

---

## Docker Compose

| Variable | Description |
|----------|-------------|
| `HTTP_PORT` | Gateway host port (default `80`). |
| `IMAGE_TAG` | Docker image tag for deploy. |
| `APP_IMAGE` / `API_IMAGE` | Image names. |

See `docs/VERIFORGE-DOCKER.md`.

---

## Production checklist

1. Set strong `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FIELD_ENCRYPTION_KEY`, `NEXTAUTH_SECRET` (≥32 chars).
2. Set explicit `CORS_ORIGIN` and `COOKIE_SECURE=true`.
3. Set `METRICS_BEARER_TOKEN`.
4. Configure `REDIS_URL` and run worker container for crons.
5. Set `RESEND_API_KEY` + `EMAIL_FROM`.
6. Store secrets in GitHub Actions / K8s secrets — `VERIFORGE_DATABASE_URL` for CI migrate.
7. Never set `DEV_MODE` / `SEED_DEV_USERS=1` in production.

# VeriForge database migrations & versioning

## Tooling

| Piece | Choice |
|---|---|
| ORM / migrate | **Prisma Migrate** |
| History table | `_prisma_migrations` (Prisma) + `schema_releases` (app tags) |
| Seed | `prisma/seed.ts` (primary) · `prisma/seed.sql` (ops) |
| Rollback | Manual SQL under `prisma/rollbacks/*.down.sql` |
| Deploy | `scripts/migrate-deploy.sh` → preflight → `migrate deploy` → seed |

Prisma does **not** auto-apply down migrations. We keep explicit rollback SQL and an ops script.

## Layout

```
prisma/
  schema.prisma
  seed.ts
  seed.sql
  migrations/
    migration_lock.toml
    20260720000000_init/migration.sql
    _templates/online_expand_contract.sql.example
  rollbacks/
    20260720000000_init.down.sql
scripts/
  check-destructive-migrations.ts
  migrate-deploy.sh
  migrate-rollback.sh
```

## Versioning

1. Every schema change is a new folder: `prisma/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql`
2. Prisma records applied versions in `_prisma_migrations`
3. Product releases that require a schema bump insert/update `schema_releases` (tag ↔ migration name)

| Release tag | Migration | Notes |
|---|---|---|
| `v1.0.0-schema` | `20260720000000_init` | Initial multi-tenant schema |

When cutting a release:

```bash
git tag veriforge-api@1.0.0
# ensure schema_releases.release_tag matches the deploy notes
```

## Seed data

Idempotent catalog:

- Roles: Owner, Admin, Manager, User
- Modules: VeriCore, VeriPM, VeriHub (+ default monthly/annual prices)
- Permissions from `permission-catalog.ts`
- `module_permissions` + `role_permissions` mappings
- `platform_settings.annual_discount_percent`

```bash
npm run db:seed
# or
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seed.sql
```

## Deployment-safe strategy

```text
PR ──► check-destructive-migrations (CI)
     ──► review expand/contract for large tables
Deploy Job:
  1. migrate-deploy.sh
       - fail on DROP TABLE/COLUMN/TYPE unless ALLOW_DESTRUCTIVE_MIGRATIONS=1
       - prisma migrate deploy   (transactional per migration)
       - prisma db seed          (idempotent)
  2. Rolling update API / worker (maxUnavailable: 0)
```

### Rules

1. **Additive first** — add columns/tables nullable; never rename/drop in the same release as app cutover.
2. **Transactional** — keep Prisma’s default transaction for DDL that is fast on empty/small tables.
3. **Online patterns** for large tables:
   - Add nullable column
   - Backfill in batches (app job)
   - Create indexes with `CREATE INDEX CONCURRENTLY` (ops runbook; not inside a long transaction)
   - Dual-write / dual-read
   - Drop old column in a later migration (destructive gate + approval)
4. **Avoid long locks** — no table rewrite (`ALTER … TYPE`) on hot tables without a shadow-column plan.
5. **Seed after migrate** — catalog only; never seed tenant data in prod migrate Job.

### Local / Compose

```bash
npm run db:migrate:deploy
npm run db:seed
```

Compose `migrate` service runs `scripts/migrate-deploy.sh`.

### Rollback strategy

| Scenario | Action |
|---|---|
| Failed migrate mid-deploy | Fix forward with a new migration (preferred) |
| Need previous schema (dev) | `./scripts/migrate-rollback.sh 20260720000000_init` |
| Prod incident | Restore PITR snapshot **or** apply matching `.down.sql` only with change board approval; redeploy matching app image |

Forward-fix is preferred in production. Down scripts exist for disaster recovery and local reset.

```bash
./scripts/migrate-rollback.sh 20260720000000_init
```

## Creating a new migration

```bash
# After editing schema.prisma
npx prisma migrate dev --name add_foo_column
# Manually add prisma/rollbacks/<same_name>.down.sql
# Run: npx tsx scripts/check-destructive-migrations.ts
```

## CI hooks

- `npm run db:migrate:check` — destructive SQL gate
- `npm run db:migrate:deploy` — used by K8s Job / Compose

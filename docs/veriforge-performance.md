# VeriForge performance & scalability

## Performance checklist

### API
- [x] Redis cache for RBAC permission sets (`vf:rbac:user:{id}`, TTL ~120s)
- [x] Redis cache for pricing config (`vf:pricing:config:{currency}`, TTL ~300s)
- [x] Redis cache for module catalog + org modules
- [x] Invalidate caches on role assign / module enable / pricing update
- [x] Pagination on admin org list + onboarding list; users list API supports skip/take
- [x] Postgres connection pooling via `connection_limit` / `DB_POOL_SIZE`
- [ ] Optional: skip `refreshPermissions` on read-only routes (JWT permissions + shorter TTL)

### Database
- [x] Indexes on `org_id`, `module_id`, `subscription_id`, `user_id` (baseline)
- [x] Composite: `(is_trial_active, trial_end)`, `(user_id, revoked_at)`, `(org_id, effective_to, enabled)`
- [x] Partial indexes for active org-modules, active user_roles, trialing subscriptions
- [x] Flat RBAC selects (permission keys only)

### Worker
- [x] Trial expiry keyset-batched (`TRIAL_JOB_BATCH_SIZE`, default 100)
- [x] Notification concurrency pool (`TRIAL_JOB_CONCURRENCY`, default 5)
- [x] Idempotent sends via `trial_notification_logs`

### Frontend
- [x] Route-level code splitting (`React.lazy` + `Suspense`)
- [x] Lazy module + admin pages
- [x] React Query defaults: `staleTime` 60s, `gcTime` 10m
- [x] Pricing quotes `staleTime` 30s

### Scalability
- [x] API HPA 2–10 @ 70% CPU (`infra/veriforge/k8s/api.yaml`)
- [ ] Redis Cluster / Sentinel for multi-AZ (when single Redis becomes bottleneck)
- [ ] Postgres read replica + `DATABASE_URL_READ` for analytics admin queries

---

## Caching strategy

| Key | Value | TTL | Invalidate when |
|---|---|---|---|
| `vf:rbac:user:{userId}` | `{ role, permissions, orgId }` | `CACHE_TTL_RBAC_SEC` (120) | Role assign; org module enable/disable |
| `vf:pricing:config:{CCY}` | Admin pricing config | `CACHE_TTL_PRICING_SEC` (300) | Pricing / discount update |
| `vf:modules:catalog` | Active modules + prices | `CACHE_TTL_MODULES_SEC` (300) | Catalog / price change |
| `vf:modules:org:{orgId}` | Enabled org modules | 300 | Module enable/disable/lock |

**Rules**

1. Cache is best-effort — Redis down falls through to Postgres.
2. Never cache secrets or raw password hashes.
3. Prefer short RBAC TTL + invalidate-on-write over long TTLs.
4. Horizontal API pods share Redis; local memory caches are **not** used for RBAC.

```text
Request → refreshPermissions → loadUserAccess
                              ├─ Redis HIT → return
                              └─ Redis MISS → DB (flat selects) → SETEX
```

---

## SQL optimizations

Migration: `20260720010000_perf_indexes`

```sql
-- Trial expiry sweep
CREATE INDEX organizations_is_trial_active_trial_end_idx
  ON organizations (is_trial_active, trial_end);

-- Active RBAC assignment
CREATE INDEX user_roles_active_partial_idx
  ON user_roles (user_id, role_id, org_id)
  WHERE revoked_at IS NULL;

-- Enabled modules for org
CREATE INDEX organization_modules_active_enabled_partial_idx
  ON organization_modules (org_id, module_id)
  WHERE effective_to IS NULL AND enabled = true;

-- Open list prices
CREATE INDEX module_prices_module_id_billing_cycle_currency_effective_to_idx
  ON module_prices (module_id, billing_cycle, currency, effective_to);
```

### Optimized RBAC shape (Prisma)

```ts
// Role keys
userRole.findFirst({
  where: { userId, revokedAt: null },
  select: {
    role: {
      select: {
        code: true,
        rolePermissions: { select: { permission: { select: { key: true } } } },
      },
    },
  },
});

// Enabled module keys
organizationModule.findMany({
  where: { orgId, effectiveTo: null, enabled: true },
  select: {
    module: {
      select: {
        modulePermissions: { select: { permission: { select: { key: true } } } },
      },
    },
  },
});
```

### Trial expiry (batched)

```sql
SELECT id, billing_email, name
FROM organizations
WHERE is_trial_active = true
  AND trial_end <= NOW()
  AND id > $cursor
ORDER BY id
LIMIT 100;
```

### Connection pool

```
DATABASE_URL=postgresql://.../veriforge?connection_limit=15&pool_timeout=20
# or env: DB_POOL_SIZE=15 DB_POOL_TIMEOUT=20
```

With PgBouncer (transaction pooling): `?pgbouncer=true&connection_limit=1`.

### Read replicas (analytics)

Point heavy admin analytics at a replica:

```
DATABASE_URL=...primary...
DATABASE_URL_READ=...replica...
```

Wire a second Prisma client for read-only list/report endpoints (follow-up).

---

## Frontend optimizations

| Technique | Implementation |
|---|---|
| Code splitting | `React.lazy` for dashboard, modules, admin, billing |
| Lazy modules | `/modules/vericore|veripm|verihub` separate chunks |
| API cache | TanStack Query `staleTime: 60s`, pricing 30s |
| Avoid refetch storms | `refetchOnWindowFocus: false` |
| Bundle hygiene | Keep landing/login/signup eager for fast first paint |

### Follow-ups

- Prefetch `/pricing/quote` on module step hover
- Virtualize large admin tables when `total > 200`
- CDN cache hashed Vite assets (already immutable by build)

---

## Horizontal scaling notes

| Layer | Guidance |
|---|---|
| API | Stateless JWT + shared Redis; HPA 2–10 |
| Worker | Single active cron leader preferred (or Redis lock); scale for notification throughput |
| Redis | Start standalone; move to Cluster/Sentinel when memory/CPU or AZ resilience requires it |
| Postgres | Primary for writes; replica for analytics; PgBouncer in front of primary |

Env knobs:

```
REDIS_URL=redis://redis:6379
CACHE_TTL_RBAC_SEC=120
CACHE_TTL_PRICING_SEC=300
CACHE_TTL_MODULES_SEC=300
DB_POOL_SIZE=15
TRIAL_JOB_BATCH_SIZE=100
TRIAL_JOB_CONCURRENCY=5
```

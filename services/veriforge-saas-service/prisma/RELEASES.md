# Schema release tags ↔ Prisma migrations
# Update when cutting a VeriForge API release that requires schema changes.

| Release tag | Git tag (example) | Migration folder | Notes |
|---|---|---|---|
| v1.0.0-schema | veriforge-api@1.0.0 | 20260720000000_init | Initial multi-tenant SaaS schema |
| v1.1.0-perf-indexes | veriforge-api@1.1.0 | 20260720010000_perf_indexes | Hot-path + partial indexes |

Query applied tags:

```sql
SELECT release_tag, migration_name, applied_at, notes
FROM schema_releases
ORDER BY applied_at;
```

Prisma history:

```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at;
```

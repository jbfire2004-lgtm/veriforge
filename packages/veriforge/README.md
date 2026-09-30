# @veriforge/platform

Domain-driven, multi-tenant VeriForge kernel. Feature modules, typed contracts, and tRPC procedure maps for:

- Organization accounts (VeriHub)
- Hiring client accounts
- Developer accounts
- Compliance + safety scorecards
- Subscription / module access
- RBAC + tenant isolation

## Folder map

```
src/
  app/                 # UI compositions (canonical routes)
  server/
    api/               # tRPC procedure maps (org, client, developer, …)
    services/          # Domain services → SaaS gateway
    middleware/        # auth · rbac · module-access · tenant
    utils/             # logger · errors · validators · permissions
  db/                  # Domain Prisma map (SoR migrations elsewhere)
  types/               # Bounded-context DTOs
  config/              # env · database · security · modules
```

## Runtime mapping

| Concern | Live location |
|---------|---------------|
| Data SoR + migrations | `services/veriforge-saas-service` |
| Next.js App Router UI | `vera-frontend/app` |
| Nest tRPC bridges | `backend/src/server/api/routers` |
| Unified nav | `vera-frontend/lib/navigation/vera-nav-config.ts` |

This package is the **architecture scaffold**. Do not run Prisma migrate from `src/db/schema.prisma`.

## Multi-tenant rules

1. Three JWT namespaces — never mix org, hiring-client, and developer tokens.
2. Every org-scoped query is bound to `org_id` from the JWT (`assertSameOrg`).
3. Product modules are gated via `SubscriptionProfile.modules_enabled` (`assertModuleEnabled`).
4. UI uses Vera global header + module bar — no sidebars for module switching.

## Scripts

```bash
cd packages/veriforge
npx tsc -p tsconfig.json --noEmit
```

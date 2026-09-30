# VeriForge folder structure

Production-oriented, domain-driven layout for the multi-tenant SaaS platform.

## Canonical package

```
packages/veriforge/src/
├── app/
│   ├── verihub/          # dashboard, modules, billing, users, roles, compliance, scorecards
│   ├── client/           # review, contractors
│   ├── developer/        # dashboard, modules, flags, logs
│   └── auth/             # login, register, client-login, developer-login
├── server/
│   ├── api/              # org, client, developer, compliance, scorecards, modules, billing, auth
│   ├── services/         # domain services + notifications + cron registry
│   ├── middleware/       # auth, rbac, module-access, tenant
│   └── utils/            # logger, errors, validators, permissions, constants
├── db/
│   ├── schema.prisma     # domain map (SoR migrations in SaaS service)
│   └── migrations/
├── types/                # org, client, developer, compliance, scorecards, modules, billing, auth
└── config/               # env, database, security, modules
```

Package: `@veriforge/platform` — see `packages/veriforge/README.md`.

## Live runtime map

| Layer | Path |
|-------|------|
| Next.js UI | `vera-frontend/app/**` |
| Next API proxies | `vera-frontend/app/api/{org,client,developer,compliance,modules,billing,scorecard}` |
| Nest tRPC | `backend/src/server/api/routers/**` |
| SaaS SoR (Postgres + Prisma) | `services/veriforge-saas-service` |
| Unified navigation | `vera-frontend/lib/navigation/vera-nav-config.ts` |

## Tenant isolation

| Account | JWT namespace | Isolation key |
|---------|---------------|---------------|
| Organization | `organization` / `veriforge-app` | `org_id` |
| Hiring client | `hiring_client` | `hiring_client_id` |
| Developer | `developer` | developer user id |

Middleware contracts: `assertSameOrg`, `requirePermission`, `assertModuleEnabled`.

## Alias routes (Next.js)

| Path | Target |
|------|--------|
| `/verihub/dashboard` | `/verihub` |
| `/developer/dashboard` | `/developer` |
| `/developer/flags` | `/developer/feature-flags` |
| `/auth/login` · `/auth/register` | `/verihub/signup` |
| `/auth/client-login` | `/client/login` |
| `/auth/developer-login` | `/developer/login` |
| `/client/contractors` | Hiring-client contractor directory |

## UI navigation rule

Every signed-in surface uses Vera global header + module bar (`VeraAlwaysOnChrome` / shells). Do not add sidebars or module tab strips.

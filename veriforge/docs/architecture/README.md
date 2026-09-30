# Architecture Documentation

Enterprise architecture for the forged-metal VeriForge platform.

## Enterprise architecture

Layers:

| Layer | Responsibility |
|-------|----------------|
| Presentation | Web + mobile angular UI, metallic gradients, Orbitron/Exo 2 |
| Application | Auth, Training, Verification, Compliance, Incident, Risk, Workflow, … |
| API | REST + `{ status, data, meta }` with tenant metadata |
| Data | Relational schema, FKs, row-level / tenant isolation |
| Storage | Tenant buckets (compliance / training / incident isolation) |
| Security | JWT + `tenantId`, encryption at rest + in transit |
| Infrastructure | Horizontal scale, tenant-aware LB |
| Observability | Logs, metrics, traces with `tenantId` / `userId` / `timestamp` |

**Rules**

1. Services are **stateless**
2. Workflows are **tenant-aware**
3. Logs include **`tenantId`**, **`userId`**, **`timestamp`**
4. UI follows **forged-metal** identity

Canonical deep dive: `docs/VERIFORGE-ENTERPRISE-ARCHITECTURE.md`

## Multi-tenant SaaS

| Concern | Implementation |
|---------|----------------|
| Isolation | JWT `tenantId` must match route/header |
| Config | Per-tenant flags, retention, max users |
| Branding | Optional overrides; default forged-metal palette |
| Meta | Every API `meta` includes `tenantId`, `userId`, `timestamp` |

UI routes:

```
/veriforge/tenant
/veriforge/tenant/login
/veriforge/tenant/{tenantId}/dashboard
/veriforge/tenant/{tenantId}/training
/veriforge/tenant/{tenantId}/verification
/veriforge/tenant/{tenantId}/compliance
```

Auth: `POST /veriforge/auth/login` · `POST /veriforge/tenants/auth/login`  
See `docs/VERIFORGE-MULTI-TENANT-SAAS.md`

## Routing system

**Registry:** `vera-frontend/src/router/veriforge-routes.ts`

Each route: `path`, `title`, `section`, `icon`, `critical`, optional `permission`.

| Concern | Implementation |
|---------|----------------|
| Shell | `(main)/layout.tsx` → `VeriForgeAppShell` + nav from `VERIFORGE_ROUTES` |
| Transitions | `VFRouteTransition` — angularSlide + metallicFade |
| Critical | `redGlowPulse` on compliance, incidents, risk, emergency, command-center, predictive |
| Mobile | `(mobile)` layout — mobile shell, not desktop sidebar |
| Docs | `/veriforge/docs` — docs shell (this system) |

**Do not** use Vera unified nav (`WorkspaceShell` / `GlobalNav`) on VeriForge pages.

## Layout system

| Component | Role |
|-----------|------|
| `VFAppShell` | Full workspace: header + sidebar + content + footer |
| `VFHeader` | Top chrome, metallic, Orbitron brand |
| `VFSidebar` | Fixed/sticky angular nav; steel hover; red active; bevelShift |
| `VFContent` | Main region |
| `VFFooter` | Footer links / meta |
| Mobile shell | Bottom nav, 44px targets, lighter motion |

Paths: `vera-frontend/src/layouts/`  
Mobile: `vera-frontend/src/mobile/`

See `docs/VERIFORGE-LAYOUTS.md` · `docs/VERIFORGE-ROUTING.md`

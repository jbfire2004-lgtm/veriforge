# Vera Access System — Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # User.acpTenantId, User.active, acp_* models
│   └── migrations/
│       ├── 20260529140000_acp_control_panel/
│       └── 20260530120000_user_active_flag/
├── src/
│   ├── acp/
│   │   ├── acp.module.ts
│   │   ├── acp.controller.ts       # Admin CRUD
│   │   ├── acp-access.controller.ts # /api/v1/access (all users)
│   │   ├── acp.service.ts
│   │   ├── acp-access.service.ts   # Access engine
│   │   ├── acp-seed.service.ts
│   │   ├── acp.constants.ts
│   │   ├── acp-module-catalog.ts
│   │   ├── acp-access.guard.ts
│   │   ├── vera-access.guard.ts    # Combined check
│   │   ├── guards/
│   │   │   ├── vera-permission.guard.ts
│   │   │   ├── vera-feature.guard.ts
│   │   │   ├── vera-tier.guard.ts
│   │   │   └── vera-module.guard.ts
│   │   └── decorators/
│   │       ├── acp-permission.decorator.ts
│   │       └── vera-access.decorator.ts
│   ├── subscriptions/              # Customer purchase flow
│   ├── worker-wallet/              # QR, sync, download links
│   └── modules/vera-hub-homepage/
│       ├── hub-widgets.service.ts
│       └── hub-homepage.controller.ts

vera-frontend/
├── app/
│   ├── admin/acp/page.tsx
│   ├── admin/{tenants,users,roles,permissions,subscriptions,features,logs}/
│   ├── subscriptions/
│   ├── hub/
│   ├── core/layout.tsx             # VeraModuleBoundary core
│   └── pm/layout.tsx                 # PmAccessWrapper
├── components/
│   ├── acp/                          # AcpPage, AcpNav, AcpModal, PermissionMatrix
│   ├── hub/workspace/                # Banner, module grid
│   ├── hub/widgets/                  # Daily pulse widgets
│   ├── subscriptions/                # Pricing, comparison, checkout
│   └── vera-access/                  # Gates, boundaries, toggles
└── lib/
    ├── acp-api.ts
    ├── acp-access.ts
    ├── subscriptions-api.ts
    ├── worker-wallet-api.ts
    ├── hub/hub-dashboard-api.ts
    └── vera-access/index.ts
```

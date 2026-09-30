# VeriForge Multi-Tenant SaaS Infrastructure

Industrial-grade tenancy for VeriForge: strict isolation, tenant-aware auth, dual DB modes, bucket storage, horizontal scaling, and forged-metal branding defaults.

> **Organization system of record:** Postgres in `services/veriforge-saas-service` (`Organization` / `User` / `OrgRole` / modules). See `docs/VERIFORGE-ORGANIZATION-ACCOUNT.md` and the `/verihub` console. **Hiring clients** (EPC / owner / GC reviewers) are a separate account type — see `docs/VERIFORGE-HIRING-CLIENT-ACCOUNT.md` and `/client/review`. **Developers** (platform / support) use yet another auth namespace — see `docs/VERIFORGE-DEVELOPER-ACCOUNT.md` and `/developer`. **Compliance artifacts** (insurance / WCB / COR / SCSA) — see `docs/VERIFORGE-COMPLIANCE-MODULE.md` and `/compliance`. The Nest **JSON tenant registry** below remains the operational VeriForge control surface until cutover — do not treat it as the long-term org SoR.

## Tenancy model

| Concern | Implementation |
|---------|----------------|
| Isolation | JWT `tenantId` only; headers/body tenantId are never authoritative. Tenant list is authenticated and tenant-scoped (SuperAdmin may list all). |
| Persistence | `VERIFORGE_TENANT_REGISTRY_PATH` JSON snapshot (required in production). Dev seed users only when the store is empty. |
| Config | Per-tenant feature flags, retention, max users |
| Branding | Optional color/logo overrides; default `#1A1A1A` / `#424242` / `#C62828` |
| Metadata | Every API `meta` includes `tenantId`, `userId`, `timestamp` |

Seed tenants: `tenant-alloy` (shared DB), `tenant-forgeco` (dedicated DB), `tenant-steelgate` (provisioning).

Dev seed users (`ops@alloy.works`, `worker@alloy.works`, `admin@forgeco.io`) use bcrypt hashes of `Str0ng!Passw0rd`. Login does **not** accept truncated hashes, and there is no unsigned `forge-access-*` token fallback.

## Operator walkthrough (plain language)

A third-party preproduction checkout is someone from outside the team asking: *if we turned this on for real companies tomorrow, what would break?* The work below is what that review was going to fail, and what changed.

### 1. Logins used to be fake enough to walk through a demo

The server would accept almost any password of 4+ characters, or mint an unsigned token if anything went wrong. Restarting the API wiped every tenant user. That is now closed: passwords are bcrypt-hashed, tokens are signed, and tenant users are written to a file (`VERIFORGE_TENANT_REGISTRY_PATH`) so a reboot does not reset the company list.

**Local try:** `/veriforge/auth/login` with slug `alloy`, email `ops@alloy.works`, password `Str0ng!Passw0rd`. That hits Nest, not a browser-forged JWT. The login form does not prefill those values.

Hosted black-box review (no GitHub): see `docs/VERIFORGE-HOSTED-REVIEW.md`. Use `reviewer@alloy.works` / `VERIFORGE_REVIEWER_PASSWORD` (role Auditor). Do not add reviewers as GitHub collaborators.

**Production you still must set:** `VERIFORGE_TENANT_REGISTRY_PATH` and `VERIFORGE_LEDGER_PATH` on a disk that survives pod restarts. Without those, production boot fails on purpose.

### 2. Anyone could list tenants and poke scaling

`GET /veriforge/tenants` and the scaling endpoints were public. They now require a signed-in tenant token. A worker only sees their company; only SuperAdmin sees every tenant. New accounts are created by an Admin who is already signed in (no open register).

### 3. “Forgot password” did not actually reset anything

Forgot/reset now issue a hashed, 30-minute token. Production never returns the token in JSON (it belongs in email/ops). Local/dev APIs may echo it so you can finish `/veriforge/auth/reset-password`.

### 4. NFT admin was a single wallet

Training/equipment/workflow contracts used OpenZeppelin `Ownable` (one key can mint or revoke everything). They now use `MINTER_ROLE` and `ADMIN_ROLE` so the mint service can mint without owning the contract. Local evidence: `npx hardhat test` and `npx hardhat run scripts/soak-local.ts` in `apps/wle-contracts`. There is still no live Telcoin soak until RPC secrets exist.

### 5. CI could go green while Playwright failed

VeriForge E2E `continue-on-error` is removed. A failing Playwright job fails the workflow.

### 6. Production deploy used a long-lived kubeconfig

Production CD rejects `KUBE_CONFIG_DATA`. GitHub must authenticate with OIDC (GKE workload identity or AWS IAM role). Staging may keep kubeconfig only if `VERIFORGE_ALLOW_KUBECONFIG=true`. Axelar is not a product claim.

### What is still not “enterprise database tenancy”

The durable Nest store is a JSON file, not Postgres. That survives restarts and is honest for checkout; a later cutover should move tenants onto the SaaS `Organization` tables if you want HA across many API pods (each replica needs the **same** mounted volume or you will split-brain the JSON).

## Layers

### 1. Authentication
- `POST /veriforge/tenants/auth/login` — tenant-aware login (tenantId or slug + email/password)
- `POST /veriforge/tenants/auth/register` — tenant-specific user pool
- JWT claims: `sub`, `email`, `role`, **`tenantId`**, `iss=veriforge-saas`, `aud=veriforge-tenants`
- Guard: `VeriForgeTenantGuard` rejects JWT/route tenant mismatch

### 2. Routing (UI)
- `/veriforge/tenant` — directory
- `/veriforge/tenant/login` — tenant-aware login
- `/veriforge/tenant/{tenantId}/dashboard`
- `/veriforge/tenant/{tenantId}/training`
- `/veriforge/tenant/{tenantId}/verification`
- `/veriforge/tenant/{tenantId}/compliance`

### 3. Database
- **Option A (shared):** `sharedWhere(tenantId)` → `{ tenantId }` column filter + FK checks via `withTenantFk`
- **Option B (dedicated):** `dedicatedConnection(tenantId)` → per-tenant `dbConnectionKey` + `encryptionKeyId`

### 4. Storage
- Bucket per tenant: `veriforge-tenant-{slug}`
- Categories: `compliance`, `training`, `verification`, `general`
- `POST /veriforge/tenants/:tenantId/storage/upload`

### 5. API
- Controller: `VeriForgeTenantController` (`/veriforge/tenants`)
- Domain facades: training, verification, compliance (all tenant-scoped)
- Responses: `buildSuccess(..., { tenantId })`

### 6. Scaling
- `GET /veriforge/tenants/scaling/topology` — API nodes + tenant-aware LB
- `POST /veriforge/tenants/scaling/evaluate` — auto-scale on `loadScore`
- Routing: pinned affinity or least-connections

### 7. Security
- Row-level predicate: `tenant_id = '{tenantId}'`
- Tenant-level encryption key IDs (`kek-*-v1`)
- Audit log entries always include `tenantId` (`GET .../audit`)

### 8. Branding
- `GET/PUT /veriforge/tenants/:tenantId/branding`
- UI injects `--vf-tenant-primary` / `--vf-tenant-accent` CSS variables

## Backend files

- `backend/src/modules/veriforge-api/tenancy/*`
- `backend/src/modules/veriforge-api/controllers/tenant.controller.ts`
- `veriforge-response.ts` — `meta.tenantId`
- `veriforge-request.util.ts` — `resolveTenantId`

## Frontend files

- `vera-frontend/components/veriforge/tenant-saas.tsx`
- `vera-frontend/app/veriforge/(tenant)/tenant/**`

## Logic rules

1. No tenant can read another tenant’s rows, objects, or audit entries.
2. All logs include `tenantId`.
3. All workflows (training, forgeCheck, compliance uploads) are tenant-aware.

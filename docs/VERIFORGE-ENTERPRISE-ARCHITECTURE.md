# VeriForge Enterprise Architecture

Industrial-grade, multi-layer architecture for VeriForge — secure, scalable, modular, and visually aligned with the forged-metal identity (`#1A1A1A` / `#424242` / `#C62828`).

## Enterprise rules

1. All services must be **stateless**.
2. All workflows must be **tenant-aware**.
3. All logs must include **`tenantId`**, **`userId`**, **`timestamp`**.
4. All UI must follow the **forged-metal** identity.

## Architecture layers

| Layer | Responsibility |
|-------|----------------|
| **Presentation** | Web + Mobile angular geometry UI, metallic gradients, bold typography |
| **Application** | Modular services: Auth, Training, Verification, Compliance, Incident, Risk, Workflow |
| **API** | REST + `{ status, data, meta }` with `tenantId` in every request/response |
| **Data** | Relational schema, strict FKs, row-level security |
| **Storage** | Tenant-specific buckets; compliance / training / incident isolation |
| **Security** | JWT + `tenantId`, encryption at rest + in transit, angular audit metadata |
| **Infrastructure** | Horizontal scaling, tenant-aware LB, auto-scale on workload |
| **Observability** | Logs, metrics, traces; metallic angular dashboards |

## Application services

| Service | Workflow primitives |
|---------|---------------------|
| AuthService | Tenant JWT issuance |
| TrainingService | Tenant-scoped modules |
| VerificationService | `forgeCheck` / `forgeStatus` |
| ComplianceService | Document validity |
| IncidentService | Capture → investigate → close |
| RiskService | Hazard scoring |
| WorkflowService | `forgeFlow` orchestration |

## API contract

```json
{
  "status": "ok",
  "data": {},
  "meta": {
    "timestamp": "ISO-8601",
    "userId": 1,
    "tenantId": "tenant-alloy",
    "forgeStatus": "verified"
  }
}
```

`tenantId` is resolved from JWT claim, `x-tenant-id` header, or body.

## Data schema (tenant-scoped)

Tables with FK constraints + RLS (`tenant_id = current_setting('app.tenant_id')`):

- `users`, `companies`
- `trainingModules`, `verificationChecks`
- `complianceRequirements`, `incidents`
- `audits`, `workflows`
- `equipment`, `contractors`

## Storage

- Bucket pattern: `veriforge-tenant-{slug}`
- Categories: `compliance`, `training`, `incidents` (+ `verification` where enabled)
- Cross-tenant object access denied

## Security

- JWT claims include **`tenantId`**
- Encryption at rest via per-tenant KEK ids
- TLS in transit
- Audit logs carry angular metadata: `tenantId`, `userId`, `timestamp`, `layerId`

## Infrastructure

- Stateless API / worker pools
- Tenant-aware load balancer (pinned affinity or least-connections)
- Auto-scale when `loadScore` ≥ 70

## Observability

- Structured logs with `tenantId` / `userId` / `timestamp`
- Metrics: API latency, forgeFlow fail rate, infra load
- Traces: `workflow.forgeCheck` spans
- Console: `/veriforge/enterprise-architecture`

## Backend

- `services/enterprise-architecture.service.ts`
- `controllers/enterprise-architecture.controller.ts`
- Routes under `/veriforge/enterprise-architecture`

## Frontend

- `components/veriforge/enterprise-architecture.tsx`
- Page: `/veriforge/enterprise-architecture`
- Live sync: `veriforge.enterprise-architecture.analytics`

## Related

- Multi-tenant SaaS: `docs/VERIFORGE-MULTI-TENANT-SAAS.md`
- Brand system: forged-metal tokens in `components/veriforge/tokens`

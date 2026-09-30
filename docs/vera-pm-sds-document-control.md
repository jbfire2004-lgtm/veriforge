# Vera PM — SDS & Document Control System

Production module at `/api/v1/pm/document-control` and UI `/pm/documents`.

## Architecture

| Layer | Path |
|-------|------|
| API | `backend/src/pm-document-control/` |
| Legacy SDS API | `/api/v1/pm/safety/sds` (backward compatible) |
| Prisma | Extended `SdsDocument`, `ChemicalInventoryItem`, `PolicyDocument` + `pm_controlled_document`, `sds_version`, `document_acknowledgment`, `manufacturer_instruction`, `document_audit` |
| Migration | `20260521200000_pm_document_control` |

### Engines

- **DocumentWorkflowEngine** — `draft → review → approved → published → superseded → archived`
- **ChemicalCompatibilityEngine** — storage class incompatibility matrix
- **PmDocumentCailIntelligenceService** — expired/missing SDS, policy ack gaps, outdated manuals

### Integrations

- **Site access** — blocks when `requiresAckForAccess` policies or `requiresAck` SDS not acknowledged
- **CAPA** — `PmCapaAutoGenerateService.fromDocumentDeficiency()` on scan (expired chemicals, missing SDS, incompatible storage)
- **Safety stations** — `GET .../station/:companyId` publishes SDS + emergency plans payload
- **Offline** — `GET/POST .../sync/project/:projectId`

## Workflows

### SDS lifecycle

1. **Create** (`draft`) — metadata: product, manufacturer, CAS, WHMIS JSON, PPE/first-aid/handling in `metadataJson`
2. **Review → Approved → Published** — supervisor transitions; version snapshot in `sds_version`
3. **Expiry** — `expiresAt` / `reviewDueAt`; CAIL flags; scan creates CAPA
4. **Replacement** — parent `superseded`, child draft with `parentDocumentId`, incremented `version`

### Chemical inventory

- Fields: project, site, container, quantity, storage class, expiry, SDS link
- Auto-flags: `missingSdsFlag`, expired `chemicalExpiry`, incompatible pairs (same `locationNote`)
- **POST** `/chemical-inventory/scan/:projectId` — CAPA + storage issue report

### Policy distribution

- `PolicyDocument.requiresAckForAccess` gates site entry
- **POST** `/acknowledge` — dual write to `PolicyAcknowledgment` + `document_acknowledgment`

### Controlled documents

Types: `policy`, `procedure`, `sop`, `manual`, `manufacturer_instruction`, `safety_bulletin`, `emergency_plan`, `training`, `equipment_manual`, `project_specific`

## API summary

| Method | Path | Role |
|--------|------|------|
| GET | `/sds` | List SDS |
| POST | `/sds` | Create draft |
| PUT | `/sds/:id/status` | Workflow transition |
| POST | `/sds/:id/replace` | Replacement chain |
| GET/POST | `/chemical-inventory` | Inventory CRUD |
| POST | `/chemical-inventory/scan/:projectId` | Deficiency scan |
| GET/POST | `/controlled` | Document library |
| GET | `/policies` | Policy list |
| POST | `/policies/:id/publish` | Publish policy |
| POST | `/acknowledge` | Worker acknowledgment |
| GET | `/analytics/project/:projectId` | Dashboard metrics |
| GET | `/intelligence/project/:projectId` | CAIL insights |
| GET/POST | `/sync/project/:projectId` | Offline bundle |

## Analytics scoring

- **Leading indicators**: `missingSdsRate`, `expiredChemicalRate`
- **CAIL insight score**: `min(100, count * weight)` per type with confidence 0.8–0.95
- **Policy compliance %**: acknowledgments vs published access-gated policies

## Frontend

- Hub: `vera-frontend/src/pages/pm/documents/dashboard.tsx`
- Client: `vera-frontend/lib/pm-document-control.ts`
- Offline action: `pmDocuments.sync` in `lib/field/sync-handlers.ts`

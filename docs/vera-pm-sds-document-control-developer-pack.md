# SDS & Document Control — Developer-Ready Pack

PM chemical safety document management: SDS library, hazard extraction, versioning, worker acknowledgments, chemical inventory, site access enforcement, CAPA on deficiencies, and offline sync.

**Primary API:** `/api/v1/pm/document-control`  
**Spec alias API:** `/api/v1/pm/sds`  
**UI:** `/pm/documents`  
**Offline sync:** `pmDocuments.sync`  
**Backend:** `backend/src/pm-document-control/`  
**Migration:** `20260521200000_pm_document_control`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| sds-service | `PmDocumentControlService` (SDS CRUD, lifecycle) |
| chemical-hazard-engine | `ChemicalHazardEngine` |
| document-versioning-service | `SdsDocumentVersion`, `PmDocumentVersion` + `DocumentWorkflowEngine` |
| sds-acknowledgment-service | `acknowledgeDocument()` → `document_acknowledgment` |
| offline-sync-service | `syncBundle` / `applyOfflineSync` |
| cail-inference-service | `PmDocumentCailIntelligenceService` |
| audit-service | `PmDocumentAuditLog` (`document_audit`) |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| SDS Library Engine | `PmDocumentControlService.listSds` | Search, filter, publish |
| Chemical Hazard Extraction Engine | `chemical-hazard.engine.ts` | WHMIS/metadata → hazards, controls, PPE, risk score |
| SDS Versioning Engine | `replaceSds`, `SdsDocumentVersion` | Parent superseded → child draft |
| SDS Expiry Engine | `expiresAt` / `reviewDueAt` + analytics | Expired → CAPA + CAIL |
| Worker SDS Acknowledgment Engine | `acknowledgeDocument`, `getWorkerSds` | Per-worker ack tracking |
| SDS Enforcement Engine | `workerAccessCheck` | Blocks chemical zones without ack |
| Offline SDS Engine | `syncBundle`, `applyOfflineSync` | Project bundle + ack replay |
| Chemical Compatibility Engine | `chemical-compatibility.engine.ts` | Incompatible storage pairs |

### Module wiring

- `PmCorrectiveActionsModule` — `fromDocumentDeficiency` on scan
- `PmSiteAccessControlModule` — policy + SDS ack gates
- `PmSafetyStationsModule` — `stationSyncPayload`
- `PmCompanySafetyContextModule` — corporate SDS library (`PmCompanySdsLibrary`)

---

## 2. Database schema

### `sds_document` (spec: `sds_documents`)

| Field | Type | Spec alias |
|-------|------|------------|
| id | UUID PK | id |
| companyId | Int | company_id |
| productName | String | product_name |
| manufacturer | String? | manufacturer |
| casNumbers | Json | cas_number (array) |
| whmisJson | Json | whmis_classification |
| metadataJson | Json | ppe_requirements, first_aid, handling_storage |
| expiresAt | DateTime? | expiry_date |
| version | Int | version |
| storageKey | String? | file_path |
| status | `PmDocumentStatus` | active/expired/superseded (derived) |
| requiresAck | Boolean | gate for chemical zones |
| parentDocumentId | String? | superseded chain |
| createdAt | DateTime | created_at |

**Derived lifecycle:** `active` (published, not expired), `expired`, `superseded`.

### `document_acknowledgment` (spec: `sds_acknowledgments`)

| Field | Spec |
|-------|------|
| sdsDocumentId | sds_id |
| workerId | worker_id |
| acknowledgedAt | acknowledged_at |
| clientSyncId | offline idempotency |
| (audit payload) | device_id via `document_audit.payload` |

### `document_audit` (spec: `sds_audit`)

| Field | Spec |
|-------|------|
| entityType | `sds`, `chemical_inventory`, `policy`, … |
| entityId | sds_id |
| eventType | created, acknowledged, status_published, … |
| payload | event_data |
| createdAt | timestamp |

### Related tables

| Table | Purpose |
|-------|---------|
| `sds_version` | Version snapshots on publish |
| `sds_attachment` | PDF/file attachments |
| `chemical_inventory` | On-site chemical quantities + SDS link |
| `pm_controlled_document` | SOPs, manuals, emergency plans |
| `policy_document` | Access-gated policies |
| `manufacturer_instruction` | Equipment OEM hazard/control hints |

---

## 3. API contract

### Spec paths (`/api/v1/pm/sds`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create SDS draft |
| GET | `/:id` | Detail + extracted hazards/controls |
| POST | `/:id/acknowledge` | Worker acknowledgment |
| GET | `/worker/:workerId` | Worker SDS list + compliance |
| POST | `/offline/sync` | Apply offline acks/creates |
| GET | `/:id/hazards` | Hazard/control extraction |
| GET | `/:id/score` | Chemical risk score |
| GET | `/worker/:workerId/compliance` | CAIL compliance bundle |

### Full document-control API (`/api/v1/pm/document-control`)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/sds` | List / create |
| PUT | `/sds/:id/status` | Workflow transition |
| POST | `/sds/:id/replace` | Supersede + new version |
| POST | `/sds/:id/attachments` | Upload metadata |
| GET/POST | `/chemical-inventory` | Inventory CRUD |
| POST | `/chemical-inventory/scan/:projectId` | Deficiency scan → CAPA |
| POST | `/acknowledge` | Generic ack (SDS/policy/controlled) |
| GET | `/access/worker` | Access gate check |
| GET | `/analytics/project/:projectId` | Dashboard metrics |
| GET | `/intelligence/project/:projectId` | CAIL insights |
| GET/POST | `/sync/project/:projectId` | Offline bundle |
| POST | `/intelligence/suggest-sds` | Task-based SDS suggestions |

### Acknowledge body

```json
{
  "workerId": 12,
  "signatureData": "base64...",
  "deviceId": "tablet-uuid",
  "clientSyncId": "offline-ack-1"
}
```

### Hazard extraction response

```json
{
  "sdsId": "uuid",
  "hazards": ["Flammable liquid Cat 2"],
  "controls": ["Ventilation", "No smoking"],
  "ppeRequirements": ["Chemical goggles", "Nitrile gloves"],
  "firstAid": { "eye": "Flush 15 min" },
  "handlingStorage": { "store": "Cool dry place" },
  "whmisClassification": {},
  "chemicalRiskScore": 45,
  "suggestedControls": ["Eliminate ignition sources"]
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/documents` | SDS library + inventory + analytics | `documents/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-document-control.ts` — full module API
- `vera-frontend/lib/pm-sds.ts` — spec alias paths

| Spec screen | Vera |
|-------------|------|
| SDS Library | `/pm/documents` SDS tab |
| SDS Viewer | `getPmSds` / `getPmSdsDetail` |
| SDS Acknowledgment | `acknowledgePmSds` |
| SDS Expiry Dashboard | Analytics cards on dashboard |
| Offline SDS Queue | `pmDocuments.sync` + `syncPmSdsOffline` |

### Spec components

| Component | API |
|-----------|-----|
| SDSCard | `listPmSds` |
| SDSHazardList | `extractPmSdsHazards` |
| SDSControlList | Included in hazards response |
| SDSAcknowledgmentButton | `acknowledgePmSds` |

---

## 5. Workflow logic

### SDS lifecycle states

| Spec | Vera `PmDocumentStatus` + derived |
|------|-----------------------------------|
| Active | `published` + not expired |
| Expired | `expiresAt` < now |
| Superseded | `status: superseded` |

### Workflow transitions

```
draft → review → approved → published → superseded → archived
```

Use `PUT /document-control/sds/:id/status` with valid transitions enforced by `DocumentWorkflowEngine`.

### Validation

| Rule | Enforcement |
|------|-------------|
| Ack before chemical zones | `requiresAck` SDS + `workerAccessCheck` |
| Published SDS for inventory link | `missingSdsFlag` if not published |
| Certificate N/A for SDS | Acknowledgment + optional signature |

---

## 6. CAIL intelligence logic

### Hazard/control auto-generation

`ChemicalHazardEngine.extract()` reads:
- `hazardClasses` JSON
- `metadataJson.hazards`, `ppeRequirements`, `first_aid`, `handling_storage`
- `whmisJson`

`suggestedControls()` maps hazard keywords → control recommendations.

### Predictive scoring

| Endpoint | Output |
|----------|--------|
| `GET /sds/:id/score` | `chemicalRiskScore`, `lifecycleStatus` |
| `GET /sds/worker/:id/compliance` | `complianceScore`, `predictiveChemicalRisk`, `missingAcks` |
| `GET /document-control/intelligence/project/:id` | Insight cards (expired SDS, missing links, policy gaps) |

### Worker compliance scoring

```
complianceScore = acknowledged_required / total_required * 100
predictiveChemicalRisk = avg(chemicalRiskScore) across required SDS
```

---

## 7. Offline mode

### Download bundle

`GET /document-control/sync/project/:projectId` returns published SDS, inventory, policies, controlled docs.

### Upload sync

`POST /sds/offline/sync` or `POST /document-control/sync/project/:projectId`:

```json
{
  "projectId": 1,
  "acknowledgments": [
    {
      "workerId": 12,
      "sdsDocumentId": "uuid",
      "clientSyncId": "ack-1",
      "signatureData": "..."
    }
  ],
  "sdsCreates": [
    {
      "clientSyncId": "sds-1",
      "productName": "Acetone",
      "manufacturer": "ChemCo"
    }
  ]
}
```

**Field handler:** `pmDocuments.sync`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Hazards | Extracted hazards feed unified hazard library (manual ingest) |
| Controls | `suggestedControls` + manufacturer `controlHints` |
| Worker Safety Profiles | SDS gaps → profile score penalties |
| Site Access | `workerAccessCheck`, zone rules |
| PM Module | Project-scoped SDS + inventory |
| Corrective Actions | Scan → expired SDS, missing SDS, incompatible storage |
| Company Safety Context | `PmCompanySdsLibrary` corporate catalog |
| Safety Stations | `GET /station/:companyId` emergency + SDS payload |
| JHA/FLHA | `suggestSdsForTask` keyword match |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| sdsTotal | All SDS documents |
| sdsExpiringSoon | Expires within 30 days |
| sdsExpired | Past expiry (published) |
| sdsCompliancePct | Leading indicator |
| missingSds | Inventory without valid SDS |
| expiredChemicals | Inventory past chemical expiry |
| chemicalHazardTrend | groupBy SDS category |
| expiryTrends | expiringSoon + expired counts |
| leadingIndicators | missingSdsRate, expiredChemicalRate |
| cailInsights | CAIL insight array |

### Leading indicators

- `sdsCompliancePct`
- `missingSdsRate`

### Lagging indicators

- `sdsExpired` count
- `expiredChemicalRate`
- CAIL `sds_expired` insight score

---

## File index

```
backend/src/pm-document-control/
  pm-document-control.service.ts
  pm-document-control.controller.ts
  pm-sds.controller.ts
  pm-document-cail-intelligence.service.ts
  chemical-hazard.engine.ts
  chemical-compatibility.engine.ts
  document-workflow.engine.ts

vera-frontend/
  lib/pm-document-control.ts
  lib/pm-sds.ts
  src/pages/pm/documents/dashboard.tsx

docs/
  vera-pm-sds-document-control.md
  vera-pm-sds-document-control-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

No new migration required for this pack (uses existing `20260521200000_pm_document_control`).

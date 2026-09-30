# Equipment Safety — Developer-Ready Pack

PM equipment registry, inspections, certifications, operator authorizations, failures, LOTO lockout, condition scoring, site access gates, CAPA auto-generation, and offline sync.

**Primary API:** `/api/v1/pm/equipment-safety`  
**Spec alias API:** `/api/v1/pm/equipment`  
**UI:** `/pm/equipment-safety`  
**Offline sync:** `pmEquipment.sync`  
**Backend:** `backend/src/pm-equipment-safety/`  
**Migration:** `20260521210000_pm_equipment_safety`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| equipment-service | `Equipment` + `registerEquipment` / `listProfiles` |
| equipment-inspection-service | `PmEquipmentInspection` + `recordEquipmentInspection` |
| equipment-certification-service | `PmEquipmentCertification` |
| equipment-status-service | `operationalStatus`, `EquipmentComplianceService` |
| equipment-authorization-service | `PmWorkerEquipmentAuthorization` |
| equipment-failure-service | `PmEquipmentFailure` |
| corrective-action-service | `PmCapaAutoGenerateService.fromDocumentDeficiency` |
| offline-sync-service | `syncBundle` / `applyOfflineSync` |
| cail-inference-service | `PmEquipmentCailIntelligenceService` |
| audit-service | `PmEquipmentSafetyAudit` (`equipment_audit`) |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Equipment Registry Engine | `registerEquipment`, `listProfiles` | Create fleet + project assignment |
| Equipment Condition Scoring Engine | `equipment-condition.engine.ts` | 0–100 score, risk band |
| Equipment Inspection Engine | `registerEquipmentInspection` | PM inspection link + standalone inspections |
| Equipment Certification Engine | `createCertification`, `flagExpiredCertifications` | Cert lifecycle + auto lockout |
| Operator Authorization Engine | `grantAuthorization`, `validateWorkerAuthorization` | Per-worker/equipment auth |
| Equipment Failure Detection Engine | `reportFailure` | Auto LOTO + CAPA |
| Equipment Lockout Engine | `LotoWorkflowEngine` + `createLoto` / `removeLoto` | LOTO + legacy `EquipmentLockout` |
| Equipment Assignment Engine | `EquipmentAssignmentEngine` | Pre-use validation rules |
| Offline Equipment Engine | `syncBundle`, `applyOfflineSync` | Field replay |

### Module wiring

- `EquipmentComplianceModule` — compliance recalculation on LOTO/cert changes
- `PmCorrectiveActionsModule` — failure + deficiency CAPA
- `PmInspectionsModule` — equipment deficiencies → lockout
- `PmSiteAccessControlModule` — `workerAccessCheck`
- Registered as `PmEquipmentSafetyModule` in `app.module.ts`

---

## 2. Database schema

### `Equipment` (spec: `equipment`)

| Field | Spec alias |
|-------|------------|
| id | id (int) |
| companyId | company_id |
| (via assignment) | project_id |
| typeId / safetyCategory | type |
| model | model |
| serialNumber | serial_number |
| operationalStatus | status: active, in_service, out_of_service, locked_out |
| (condition score table) | condition_score |
| lastInspectionAt | last_inspection_date |
| nextInspectionAt | next_inspection_due |
| createdAt | created_at |

### `equipment_inspections` → `PmEquipmentInspection`

| Field | Notes |
|-------|-------|
| equipmentId | equipment_id |
| (inspector via PM inspection) | inspector_id |
| pmInspectionId | template_id / PM inspection FK (optional) |
| passed | status pass/fail |
| items[].notes | notes |
| createdAt | created_at |

### `equipment_certifications` → `PmEquipmentCertification`

| Field | Spec |
|-------|------|
| certificationType | certification_type |
| approvedByUserId | issued_by |
| issuedAt | issue_date |
| expiresAt | expiry_date |

### `equipment_authorizations` → `PmWorkerEquipmentAuthorization`

| Field | Spec |
|-------|------|
| workerId | worker_id |
| equipmentId | equipment_id |
| authType | authorization_type |
| issuedByUserId | issued_by |
| issuedAt (createdAt) | issue_date |
| expiresAt | expiry_date |

### `equipment_failures` → `PmEquipmentFailure`

| Field | Spec |
|-------|------|
| failureType | failure_type |
| title/description | severity narrative |
| createdAt | occurred_at |

### `equipment_audit` → `PmEquipmentSafetyAudit`

| Field | Spec |
|-------|------|
| entityId | equipment_id (string) |
| eventType | event_type |
| payload | event_data |
| createdAt | timestamp |

---

## 3. API contract

### Spec paths (`/api/v1/pm/equipment`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Register equipment (+ optional project assign) |
| GET | `/:id` | Equipment profile |
| GET | `/:id/score` | Condition score + status |
| GET | `/:id/predict` | CAIL failure likelihood + actions |
| POST | `/:id/inspection` | Record inspection (auto-lockout on fail) |
| POST | `/:id/certification` | Add certification |
| POST | `/:id/authorize` | Grant operator authorization |
| POST | `/:id/lockout` | Apply LOTO |
| POST | `/:id/unlock` | Remove active LOTO(s) |
| POST | `/offline/sync` | Offline failures/LOTO/inspections |

### Full equipment-safety API (`/api/v1/pm/equipment-safety`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profiles` | Fleet list |
| GET | `/profiles/:id` | Full profile |
| PUT | `/profiles/:id` | Update metadata |
| POST | `/profiles/:id/condition` | Recalculate condition |
| POST | `/certifications` | Create cert |
| POST | `/certifications/:id/approve` | Approve cert |
| POST | `/certifications/flag-expired` | Expire → out_of_service |
| POST | `/inspections/register` | Link PM inspection layer |
| POST | `/failures` | Report failure + auto LOTO |
| POST | `/loto` | Create LOTO |
| POST | `/loto/:id/remove` | Remove LOTO |
| POST | `/authorizations` | Grant auth |
| GET | `/authorizations/validate` | Worker + equipment check |
| POST | `/assignments/validate` | Pre-assignment gate |
| GET | `/access/worker` | Site access |
| GET | `/analytics/project/:id` | Dashboard |
| GET | `/intelligence/project/:id` | CAIL insights |
| GET/POST | `/sync/project/:id` | Offline bundle |

### Inspection body

```json
{
  "companyId": 1,
  "projectId": 1,
  "passed": false,
  "notes": "Hydraulic leak at boom base",
  "conditionScore": 35,
  "templateId": "crane-daily",
  "items": [{ "itemKey": "hydraulic", "label": "Hydraulic system", "passed": false }]
}
```

### Score response

```json
{
  "equipmentId": 12,
  "conditionScore": 72,
  "riskBand": "medium",
  "status": "in_service",
  "nextInspectionDue": "2026-06-01T00:00:00.000Z",
  "lockoutStatus": "CLEAR",
  "complianceStatus": "COMPLIANT"
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/equipment-safety` | Equipment list + analytics | `equipment-safety/dashboard.tsx` |
| `/pm/equipment-safety/[id]` | Equipment profile | `app/pm/equipment-safety/[id]/page.tsx` |

**Libs:**
- `vera-frontend/lib/pm-equipment-safety.ts` — full module
- `vera-frontend/lib/pm-equipment.ts` — spec alias paths

| Spec screen | Vera |
|-------------|------|
| Equipment List | Dashboard fleet table |
| Equipment Profile | `[id]` page |
| Inspection Form | PM inspections + `recordPmEquipmentInspection` |
| Certification Manager | Certifications endpoints |
| Authorization Manager | Authorizations tab / API |
| Equipment Failure Report | `reportEquipmentFailure` |
| Equipment Lockout Screen | `lockoutPmEquipment` / `unlockPmEquipment` |
| Offline Equipment Queue | `pmEquipment.sync` |
| Equipment Analytics Dashboard | Dashboard analytics cards |

### Spec components

| Component | API |
|-----------|-----|
| EquipmentCard | `listEquipmentProfiles` |
| ConditionScoreBadge | `fetchPmEquipmentScore` |
| InspectionChecklist | PM inspections module |
| CertificationCard | `createCertification` |
| AuthorizationCard | `grantEquipmentAuthorization` |
| LockoutTag | `createEquipmentLoto` |

---

## 5. Workflow logic

### Operational states

| Spec | `PmEquipmentOperationalStatus` |
|------|-------------------------------|
| Active | `active` |
| In Service | `in_service` |
| Out of Service | `out_of_service` |
| Locked Out | `locked_out` |

### Transitions

```
active → in_service (passed inspection)
in_service → out_of_service (expired cert / compliance)
out_of_service → locked_out (failure / failed inspection / LOTO)
locked_out → in_service (LOTO removed + supervisor unlock)
```

### Validation rules

| Rule | Enforcement |
|------|-------------|
| Expired certification → auto-lockout | `flagExpiredCertifications` sets `out_of_service` |
| Failed inspection → auto-lockout | `recordEquipmentInspection` when `passed: false` |
| Missing operator authorization | `validateAssignment` + site access deny |
| Condition score < 50 | Assignment blocked |
| Under LOTO | Assignment blocked |

---

## 6. CAIL intelligence logic

### Inputs

- Compliance status, safety status, lockout status
- Open critical inspection deficiencies
- Expired certifications
- Chronic failures (90d)
- Active LOTO

### Outputs

| Endpoint | Output |
|----------|--------|
| `GET /equipment/:id/predict` | `predictiveFailureLikelihood`, `recommendedActions` |
| `GET /equipment-safety/intelligence/project/:id` | High-risk equipment insights |
| `GET /equipment-safety/intelligence/operator/:workerId` | Operator risk score |

### Condition scoring

```
score = f(compliance, LOTO, deficiencies, expired certs, chronic failures)
riskBand = low | medium | high | critical
critical → safetyStatus UNSAFE
```

---

## 7. Offline mode

### Download

`GET /equipment-safety/sync/project/:projectId` — equipment + authorizations.

### Upload

```json
{
  "projectId": 1,
  "failures": [{ "clientSyncId": "f1", "equipmentId": 12, "failureType": "mechanical", "title": "Boom drift" }],
  "lotoCreates": [{ "clientSyncId": "l1", "equipmentId": 12, "reason": "Field lockout" }]
}
```

**Field handler:** `pmEquipment.sync`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| PM Inspections | `pmInspectionId` link; critical deficiencies lockout |
| Corrective Actions | Failures, expired certs, incompatible storage |
| Worker Safety Profiles | `PmWorkerSafetyAuthorization` equipment auth types |
| Site Access | `workerAccessCheck` on assigned equipment |
| JHA/FLHA | Equipment on task gates |
| Project Management | Project equipment assignments |
| Safety Stations | `stationPayload` real-time fleet status |
| Unified CAIL | Project + per-equipment predictions |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| equipmentCount | Fleet size on project |
| lockedOut | Locked out count |
| overdueInspection | Past `nextInspectionAt` |
| expiredCerts | Expired certification rows |
| openFailures | Non-closed failures |
| avgConditionScore | Mean condition score |
| projectEquipmentScore | Leading composite |
| certificationCompliancePct | Cert compliance |
| inspectionCompliancePct | Inspection due compliance |
| equipmentComplianceScore | Same as project score |
| trends.failures90d | Failures in 90 days |
| trends.failureByType | Failure type distribution |
| leadingIndicators | failureRate, lockoutRate, inspection % |
| cailInsights | CAIL insight cards |

### Leading indicators

- Inspection compliance %
- Average condition score

### Lagging indicators

- Lockout rate
- Failure rate (90d)
- Expired certifications

---

## File index

```
backend/src/pm-equipment-safety/
  pm-equipment-safety.service.ts
  pm-equipment-safety.controller.ts
  pm-equipment.controller.ts
  pm-equipment-cail-intelligence.service.ts
  equipment-condition.engine.ts
  equipment-assignment.engine.ts
  loto-workflow.engine.ts
  failure-workflow.engine.ts

vera-frontend/
  lib/pm-equipment-safety.ts
  lib/pm-equipment.ts
  src/pages/pm/equipment-safety/*

docs/
  vera-pm-equipment-safety-system.md
  vera-pm-equipment-safety-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

No new migration required for this pack.

# Site Access Control — Developer-Ready Pack

Unified worker and equipment gate validation across training, JHA/FLHA, CAPA, SDS, equipment safety, emergency lockdown, SIF/HECA, inspections, and safety meetings — with supervisor/safety overrides and offline field sync.

**Primary API:** `/api/v1/pm/site-access-control`  
**Spec alias API:** `/api/v1/pm/access`  
**UI:** `/pm/site-access-control`  
**Offline sync:** `pmSiteAccess.sync`  
**Backend:** `backend/src/pm-site-access-control/`  
**Migration:** `20260521230000_pm_site_access_control`  
**Legacy:** `/api/v1/pm/safety/site-access` delegates `evaluate` when PM module loaded

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| access-control-service | `PmSiteAccessControlService.validateAccess` |
| worker-validation-service | Training, orientation, FLHA, meetings, bans |
| equipment-validation-service | `PmEquipmentSafetyService.validateAssignment` |
| zone-rule-service | `SiteAccessRule` + `ZoneAccessRulesEngine` |
| override-service | `createOverride`, `revokeOverride` |
| safety-station-integration-service | `POST /station/validate` |
| emergency-integration-service | `PmEmergencyResponseService.workerAccessCheck` |
| offline-sync-service | `syncBundle`, `applyOfflineSync` |
| cail-inference-service | `PmSiteAccessCailIntelligenceService` |
| audit-service | `PmAccessAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Worker Access Validation Engine | `validateAccess` (worker gates) | Training, orientation, FLHA, JHA, SDS |
| Equipment Access Validation Engine | equipment branch in `validateAccess` | Assignment, LOTO, condition |
| Zone Rule Engine | `zone-access-rules.engine.ts` | Time windows, PPE, permits |
| Access Decision Engine | `access-decision.engine.ts` | granted / denied / override paths |
| Supervisor Override Engine | `createOverride` (supervisor sig) | Training/orientation gaps |
| Safety Override Engine | `createOverride` (safety sig) | High-risk zone failures |
| Emergency Lockdown Engine | emergency gate in `runModuleGates` | Active emergency / muster missing |
| Offline Access Engine | `applyOfflineSync` | Replay attempts + overrides |

### Module wiring

- `SifHecaModule`, `PmInspectionsModule`, `PmSafetyEventsModule`
- `PmCorrectiveActionsModule`, `PmDocumentControlModule`
- `PmEquipmentSafetyModule`, `PmEmergencyResponseModule`
- `PmProjectSafetyContextModule`, `PmCompanySafetyContextModule`

---

## 2. Database schema

### `access_points` → `PmAccessPoint`

| Field | Spec alias |
|-------|------------|
| id | UUID PK |
| projectId | project_id |
| pointType | type |
| name / geoJson | location |
| (link via safety station validate) | station_id proxy |

### `access_attempts` → `PmAccessAttempt`

| Field | Spec |
|-------|------|
| accessPointId | access_point_id |
| workerId | worker_id |
| equipmentId | equipment_id |
| createdAt | timestamp |
| decision | result (mapped via `mapSpecResult`) |
| denialReasons | reason |

**Result mapping (spec → Vera):**

| Spec | Vera `PmAccessDecision` |
|------|-------------------------|
| granted | `granted` |
| denied | `denied`, `denied_with_reason` |
| override_required | `requires_supervisor_override`, `requires_safety_override` |

### `access_overrides` → `PmAccessOverride`

| Field | Spec |
|-------|------|
| overrideType | override_type |
| supervisorUserId / safetyUserId | approved_by |
| createdAt | approved_at |
| expiresAt | expiry |
| (optional link) | access_attempt_id via `attemptId` on create |

### `access_zone_rules` → `SiteAccessRule` (`access_zone_rules`)

| Spec field | Vera column |
|------------|-------------|
| zone_id (code) | `zoneCode` |
| required_training | `requiresTrainingCodes` (jsonb) |
| required_ppe | `requiredPpe` (jsonb) |
| required_jha | `requiresJha` + FLHA hours |
| required_permits | `requiresPermitIds` (jsonb) |
| required_sds | `requiresSdsAck` |

### Supporting tables

- `access_denials` — per-reason rows on each attempt
- `worker_access_requirements` — cached requirement satisfaction
- `equipment_access_requirements` — equipment gates
- `access_audit` — `PmAccessAuditLog`

---

## 3. API contract

### Spec paths (`/api/v1/pm/access`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/validate` | Full validation + attempt log |
| POST | `/override` | Create supervisor/safety override |
| POST | `/offline/sync` | Upload offline attempts/overrides |
| GET | `/worker/:id?projectId=` | Worker access profile + CAIL |
| GET | `/worker/:id/predict?projectId=` | Predictive denial model |
| GET | `/equipment/:id?projectId=` | Equipment access profile |
| GET | `/equipment/:id/predict` | Equipment risk model |

### Full API (`/api/v1/pm/site-access-control`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/validate` | Same engine |
| GET/POST | `/access-points` | Gate registry |
| GET/POST | `/zone-rules` | Zone requirement CRUD |
| GET/POST | `/overrides` | List/create overrides |
| POST | `/overrides/:id/revoke` | Revoke override |
| GET | `/analytics/project/:id` | 30d trends + zone/worker scores |
| GET | `/intelligence/project/:id` | CAIL insight cards |
| GET | `/sync/project/:id` | Offline download bundle |
| POST | `/offline/sync` | Offline upload |
| POST | `/station/validate` | Safety station check-in gate |

### Validate body

```json
{
  "workerId": 12,
  "projectId": 1,
  "zoneCode": "CONFINED_A",
  "equipmentId": 45,
  "accessPointId": "uuid-gate-1"
}
```

### Validate response

```json
{
  "decision": "requires_supervisor_override",
  "granted": false,
  "result": "override_required",
  "workflowState": "override_required",
  "denialReasons": ["Missing or expired training: confined_space"],
  "checks": { "training_confined_space": false },
  "attemptId": "uuid"
}
```

### Override body

```json
{
  "companyId": 1,
  "projectId": 1,
  "workerId": 12,
  "zoneCode": "CONFINED_A",
  "overrideType": "temporary",
  "reason": "Supervisor escort — training scheduled today",
  "expiresAt": "2026-05-20T18:00:00Z",
  "attemptId": "uuid-attempt",
  "supervisorSignature": "data:image/png;base64,..."
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/site-access-control` | Access dashboard | `site-access-control/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-site-access-control.ts` — primary API
- `vera-frontend/lib/pm-access.ts` — spec alias paths

| Spec screen | Vera |
|-------------|------|
| Access Validation Screen | Validate tab |
| Override Approval Screen | Overrides tab |
| Zone Rule Manager | Zones tab |
| Worker Access Profile | `GET /access/worker/:id` |
| Equipment Access Profile | `GET /access/equipment/:id` |
| Offline Access Queue | `pmSiteAccess.sync` |
| Access Analytics Dashboard | Analytics cards on dashboard |

### Spec components

| Component | API / data |
|-----------|------------|
| AccessResultCard | `validate` response |
| OverrideRequestCard | `requires_*_override` decisions |
| ZoneRuleEditor | `zone-rules` POST |
| AccessHistoryList | `recentAttempts` on worker profile |

---

## 5. Workflow logic

### States (spec → `workflowState`)

| Spec | Phase |
|------|-------|
| Access Granted | `access_granted` |
| Access Denied | `access_denied` |
| Override Required | `override_required` |
| Override Approved | `override_approved` (active override) |
| Override Expired | `override_expired` |

### Validation rules

| Condition | Outcome |
|-----------|---------|
| Training incomplete | Denied or supervisor override |
| CAPA overdue / critical open | Denied |
| Equipment unsafe (LOTO, failures) | Denied |
| Emergency active / muster missing | Denied (emergency gate) |
| Active valid override | Granted |

### Decision engine summary

1. Active override → **granted**
2. No denials → **granted**
3. High-risk + SIF/critical failures → **requires_safety_override**
4. Training/orientation/meeting-only (≤3) → **requires_supervisor_override**
5. Otherwise → **denied** / **denied_with_reason**

---

## 6. CAIL intelligence logic

### Worker (`GET /access/worker/:id/predict`)

| Output | Description |
|--------|-------------|
| predictiveDenialLikelihood | 0–100 next-denial estimate |
| workerRiskScore | Denials + open CAPA weighted |
| chronicNonCompliance | ≥5 denials in 30d |
| denialRate30d | Historical rate |

### Equipment (`GET /access/equipment/:id/predict`)

| Output | Description |
|--------|-------------|
| equipmentRiskScore | LOTO, failures, OOS |
| predictiveDenialLikelihood | Equipment gate failure likelihood |
| accessBlocked | Operational lockout state |

### Zone (`analytics.zoneComplianceScores`)

| Output | Description |
|--------|-------------|
| zoneRiskScore | Rule type + historical denials |
| predictiveDenialLikelihood | Zone-specific denial model |

### Project insights (`GET /intelligence/project/:id`)

- High denial rate (>25% / 7d)
- Chronic non-compliance workers (≥5 denials)

---

## 7. Offline mode

### Download

`GET /site-access-control/sync/project/:projectId`

Returns: access points, zone rules, roster, active overrides.

### Upload

```json
{
  "projectId": 1,
  "attempts": [
    {
      "workerId": 12,
      "zoneCode": "SITE",
      "decision": "denied",
      "denialReasons": ["FLHA/JHA not completed within last 24 hours"],
      "clientSyncId": "att-1"
    }
  ],
  "overrides": [
    {
      "workerId": 12,
      "overrideType": "temporary",
      "reason": "Field supervisor approval",
      "expiresAt": "2026-05-20T23:00:00Z",
      "clientSyncId": "ovr-1"
    }
  ]
}
```

**Field handler:** `pmSiteAccess.sync` — download when no payload; upload when `attempts` or `overrides` present.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Worker Safety Profiles | Project/company enforcement gates; access log sync |
| Equipment Safety | `validateAssignment`, fleet `workerAccessCheck` |
| JHA / FLHA | Recency + approved JHA + supervisor signature |
| Training | `requiresTrainingCodes` per zone |
| SDS / Document Control | `requiresSdsAck`, policy acks |
| Emergency Response | Site lock, muster missing worker denial |
| Safety Stations | `POST /station/validate` |
| Corrective Actions | Overdue/critical CAPA denial |
| PM Inspections | Critical deficiencies, overdue equipment |
| SIF / HECA | Critical events + CAPA gate |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| compliancePct | Granted / total attempts (30d) |
| denialRate | Denials / attempts |
| overrideRate | Overrides / attempts |
| projectAccessScore | Same as compliance % |
| trends.denialByZone | Top zones by denial count |
| trends.topDeniedWorkers | Workers with most denials |
| trends.equipmentDenials30d | Equipment-linked denials |
| zoneComplianceScores | Per-zone CAIL risk |
| workerComplianceScores | Per-worker compliance estimate |
| cailInsights | Project insight cards |

### Leading indicators

- Denial rate trend
- Override rate
- Zone risk scores

### Lagging indicators

- Chronic non-compliance workers
- Equipment denial count
- Project access score

---

## File index

```
backend/src/pm-site-access-control/
  pm-site-access-control.service.ts
  pm-site-access-control.controller.ts
  pm-access.controller.ts
  pm-site-access-cail-intelligence.service.ts
  access-decision.engine.ts
  zone-access-rules.engine.ts

vera-frontend/
  lib/pm-site-access-control.ts
  lib/pm-access.ts
  src/pages/pm/site-access-control/dashboard.tsx

docs/
  vera-pm-site-access-control-system.md
  vera-pm-site-access-control-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Restart backend to load `PmAccessController`. No new migration required for this pack.

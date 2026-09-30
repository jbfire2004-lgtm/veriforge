# Emergency Response — Developer-Ready Pack

PM emergency declaration, muster/evacuation, plan management, emergency equipment readiness, multi-channel notifications, site lockdown, safety station integration, and offline field sync.

**Primary API:** `/api/v1/pm/emergency-response`  
**Spec alias API:** `/api/v1/pm/emergency`  
**UI:** `/pm/emergency-response`  
**Offline sync:** `pmEmergency.sync`  
**Backend:** `backend/src/pm-emergency-response/`  
**Migration:** `20260521220000_pm_emergency_response`  
**Legacy muster:** `/api/v1/pm/safety/emergency` (backward compatible)

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| emergency-service | `PmEmergencyResponseService.declareEmergency`, `transitionEvent` |
| muster-service | `startMuster`, `musterCheckIn`, `musterAllClear` |
| emergency-plan-service | `createPlan`, `publishPlan`, `acknowledgePlan` |
| emergency-notification-service | `dispatchNotifications` → `PmEmergencyNotification` |
| emergency-equipment-service | `PmEmergencyEquipment` + inspections |
| safety-station-integration-service | `stationPayload`, `safety_station` channel |
| site-access-integration-service | `pm_site_emergency_lock`, `workerAccessCheck` |
| offline-sync-service | `syncBundle`, `applyOfflineSync` |
| cail-inference-service | `PmEmergencyCailIntelligenceService` |
| audit-service | `PmEmergencyAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Emergency Event Engine | `declareEmergency`, workflow transitions | Declare, lock site, notify |
| Emergency Plan Engine | `EmergencyWorkflowEngine` + plan CRUD | draft → published |
| Muster Tracking Engine | `MusterEvent`, `MusterCheckin` | Roster, missing workers |
| Evacuation Workflow Engine | `evacuationPhase`, event statuses | Phased response |
| Emergency Notification Engine | `dispatchNotifications` | SMS, email, push, in-app, station |
| Emergency Equipment Engine | readiness scores, inspections | AED, spill kits, etc. |
| Emergency Lockdown Engine | `pm_site_emergency_lock` | Auto-lock on declare |
| Offline Emergency Engine | `syncBundle`, offline check-ins | Field replay |
| Muster Geofence Engine | `muster-geofence.engine.ts` | GPS verify at muster point |

### Module wiring

- `NotificationsModule` — outbound alerts
- `PmCorrectiveActionsModule` — failed/expired emergency equipment
- `PmSiteAccessControlModule` — `workerAccessCheck` integration
- `PmSafetyStationsModule` — real-time muster payload

---

## 2. Database schema

### `emergency_events` → `PmEmergencyEvent`

| Field | Spec alias |
|-------|------------|
| id | UUID PK |
| companyId | company_id |
| projectId | project_id |
| eventType | type |
| (derived) | severity via eventType |
| status | active / all_clear / closed (see mapping) |
| declaredByUserId | triggered_by |
| declaredAt | triggered_at |
| closedAt | closed_at |

**Status mapping (spec → Vera):**

| Spec | Vera `PmEmergencyEventStatus` |
|------|------------------------------|
| active | `declared`, `active`, `muster_in_progress`, `evacuation_in_progress` |
| all_clear | `all_clear` |
| closed | `closed` |

### `muster_sessions` → `MusterEvent` (`muster_event`)

| Field | Notes |
|-------|-------|
| emergencyEventId | emergency_id link |
| triggeredAt | started_at |
| allClearAt | ended_at |
| musterPointCode | muster_point_id (code) |
| expectedWorkerIds / missingWorkerIds | roster JSON |

### `muster_attendance` → `MusterCheckin` (`muster_checkin`)

| Field | Spec |
|-------|------|
| musterEventId | session_id |
| workerId | worker_id |
| (derived) | status: present if check-in exists |
| checkedInAt | check_in_time |
| method | check_in_method |
| identityVerified | geofence verified |

### `emergency_plans` → `EmergencyPlan`

| Field | Spec |
|-------|------|
| planType | plan_type |
| versionNum | version |
| contentJson | content (jsonb) |
| publishedAt | published_at |
| musterPointsJson | muster points embedded |

### `emergency_equipment` → `PmEmergencyEquipment`

| Field | Spec |
|-------|------|
| equipmentType | type |
| locationNote | location |
| readinessScore | status proxy |
| lastInspectionAt | last_inspection |
| expiresAt | next_inspection_due proxy |

### `emergency_notifications` → `PmEmergencyNotification`

| Field | Spec |
|-------|------|
| channel | channel |
| title/body | message |
| sentAt | sent_at |
| emergencyEventId | emergency_id |

### `emergency_audit` → `PmEmergencyAuditLog`

---

## 3. API contract

### Spec paths (`/api/v1/pm/emergency`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/declare` | Declare emergency (requires published plan) |
| GET | `/:id/status` | Full status dashboard |
| GET | `/:id/predict` | CAIL risk + compliance scores |
| POST | `/:id/all_clear` | All clear (validates workers accounted) |
| POST | `/:id/close` | Close after all clear |
| POST | `/:id/muster/start` | Start muster for event |
| POST | `/:id/muster/checkin` | Worker check-in |
| POST | `/plan` | Create emergency plan |
| POST | `/equipment` | Register emergency equipment |
| POST | `/offline/sync` | Offline check-ins |

### Full API (`/api/v1/pm/emergency-response`)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/plans` | Plan library |
| POST | `/plans/:id/publish` | Publish plan |
| POST | `/plans/acknowledge` | Worker ack |
| POST | `/events/declare` | Declare (same as spec) |
| PUT | `/events/:id/status` | Workflow transition |
| POST | `/muster/start` | Start muster |
| GET | `/muster/active?siteId=` | Active muster board |
| POST | `/muster/:id/checkin` | Check-in |
| POST | `/muster/:id/all-clear` | Muster all clear |
| GET/POST | `/equipment` | Emergency equipment |
| POST | `/equipment/:id/inspect` | Inspection |
| GET | `/access/worker` | Access gate |
| GET | `/site-lock/:projectId` | Lock status |
| GET | `/analytics/project/:id` | Analytics |
| GET | `/intelligence/project/:id` | CAIL insights |
| GET/POST | `/sync/project/:id` | Offline bundle |
| GET | `/station/:companyId?siteId=` | Safety station payload |

### Declare body

```json
{
  "companyId": 1,
  "siteId": 1,
  "projectId": 1,
  "eventType": "evacuation",
  "title": "Site gas leak — Building C",
  "description": "H2S alarm activated",
  "autoMuster": true,
  "lockSiteAccess": true
}
```

### Status response

```json
{
  "workflowPhase": "muster_active",
  "musterComplianceScore": 87,
  "missingWorkerCount": 2,
  "checkedInCount": 45,
  "expectedWorkerCount": 47,
  "siteAccessLocked": true,
  "canAllClear": false,
  "canClose": false
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/emergency-response` | Emergency dashboard | `emergency-response/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-emergency-response.ts`
- `vera-frontend/lib/pm-emergency.ts` (spec paths)

| Spec screen | Vera |
|-------------|------|
| Emergency Dashboard | Main tabs: Muster, Plans, Declare, CAIL |
| Emergency Declaration | Declare tab |
| Muster Tracking | Active muster + check-ins |
| Missing Worker Screen | `missingWorkerIds` on muster |
| Emergency Plan Viewer | Plans tab |
| Emergency Equipment Manager | Equipment API |
| Notification Console | Notification rows on event |
| Offline Emergency Queue | `pmEmergency.sync` |

### Spec components

| Component | API |
|-----------|-----|
| EmergencyTypeSelector | `eventType` on declare |
| MusterPointCard | `musterPointsJson` on plan |
| WorkerStatusBadge | check-in / missing |
| EmergencyTimer | `declaredAt` → `allClearAt` |
| NotificationChannelSelector | channels on declare |

---

## 5. Workflow logic

### Phases (spec → derived `workflowPhase`)

| Spec | Phase |
|------|-------|
| Normal | No open event |
| Emergency Declared | `emergency_declared` |
| Muster Active | `muster_active` |
| All Clear | `all_clear` |
| Closed | `closed` |

### Transitions

```
Normal → declare → Emergency Declared (+ auto muster optional)
Emergency Declared → start muster → Muster Active
Muster Active → all clear (all workers accounted) → All Clear
All Clear → close → Closed
```

### Validation

| Rule | Enforcement |
|------|-------------|
| Emergency plan must exist | Published plan required on declare (unless `requirePublishedPlan: false`) |
| Muster cannot close with missing workers | `allClearEmergency` / `closeEmergency` unless `force: true` |
| Site access during emergency | `pm_site_emergency_lock` active |
| Missing at muster | `workerAccessCheck` denies |

---

## 6. CAIL intelligence logic

### Inputs

- Active muster missing roster
- Emergency equipment readiness scores
- Plan acknowledgment gaps
- Recent high-severity safety events
- Declare-to-muster response time

### Outputs (`GET /emergency/:id/predict`)

| Output | Description |
|--------|-------------|
| predictiveEmergencyLikelihood | 0–100 ongoing risk |
| musterComplianceScore | checkedIn / expected |
| responseQualityScore | Time + missing + equipment penalties |
| missingWorkerDetection | boolean |
| hazardCorrelation | JHA, inspections, incidents, CAPA links |

### Project-level (`GET /emergency-response/intelligence/project/:id`)

- Missing workers at active muster
- Low readiness emergency equipment
- Plan acknowledgment gaps

---

## 7. Offline mode

### Download

`GET /emergency-response/sync/project/:projectId` — plans, roster, equipment, emergency equipment.

### Upload

```json
{
  "projectId": 1,
  "checkins": [
    {
      "musterEventId": "uuid",
      "workerId": 12,
      "clientSyncId": "chk-1",
      "lat": 53.55,
      "lng": -113.49
    }
  ]
}
```

**Field handler:** `pmEmergency.sync`

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Site Access | Auto-lock on declare; `workerAccessCheck` |
| Safety Stations | `GET /station/:companyId` — active muster + events |
| Worker Safety Profiles | Plan ack gates; meeting attendance context |
| Equipment Safety | Event equipment links; fleet status on sync bundle |
| Corrective Actions | Failed/expired emergency equipment |
| PM Module | Project roster for expected workers |
| Document Control | Emergency plans as `emergency_plan` controlled docs |
| Notifications | SMS, email, push, in-app |

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| avgMusterCompliance | Historical muster % |
| equipmentReadinessAvg | Emergency equipment readiness |
| openEmergencyEvents | Non-closed events |
| projectEmergencyScore | Composite leading score |
| trends.avgResponseTimeMinutes | Declare → muster start |
| trends.totalMissingWorkerEvents | Missing worker sum |
| leadingIndicators | musterGapRate, lowReadinessEquipment |
| cailInsights | Insight cards |

### Leading indicators

- Muster compliance %
- Equipment readiness avg
- Avg response time (declare → muster)

### Lagging indicators

- Missing worker patterns
- Open emergency events
- Failed emergency equipment inspections

---

## File index

```
backend/src/pm-emergency-response/
  pm-emergency-response.service.ts
  pm-emergency-response.controller.ts
  pm-emergency.controller.ts
  pm-emergency-cail-intelligence.service.ts
  emergency-workflow.engine.ts
  muster-geofence.engine.ts

vera-frontend/
  lib/pm-emergency-response.ts
  lib/pm-emergency.ts
  src/pages/pm/emergency-response/dashboard.tsx

docs/
  vera-pm-emergency-response-system.md
  vera-pm-emergency-response-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

No new migration required for this pack.

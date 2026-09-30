# Safety Stations — Developer-Ready Pack

Multi-company safety station hardware: registration, heartbeat monitoring, worker/equipment validation, JHA gates, muster integration, emergency mode, offline cache, CAIL intelligence, and full PM safety orchestration.

**Primary API:** `/api/v1/pm/safety-stations`  
**Spec alias API:** `/api/v1/pm/station`  
**Device API (no JWT):** `/api/v1/pm/safety-stations/device/*`  
**Legacy:** `/api/v1/pm/safety/stations` (heartbeat delegate)  
**UI:** `/pm/safety-stations`  
**Offline sync:** `pmSafetyStations.sync`  
**Backend:** `backend/src/pm-safety-stations/`  
**Migration:** `20260521240000_pm_safety_stations`

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| safety-station-service | `PmSafetyStationsService` |
| station-registration-service | `register`, `activate`, `deactivate` + `StationRegistrationEngine` |
| station-heartbeat-service | `recordHeartbeat` + `StationHeartbeatEngine` |
| worker-validation-service | `validateWorker` → site access + JHA |
| equipment-validation-service | `validateEquipment` → equipment safety |
| jha-validation-service | `StationJhaEngine` |
| muster-integration-service | `musterCheckIn`, `musterStatus` → `MusterEvent` |
| emergency-integration-service | `setEmergencyMode`, `emergencyPayload` |
| offline-sync-service | `buildOfflineBundle`, `applyOfflineSync` |
| cail-inference-service | `PmSafetyStationsCailIntelligenceService` |
| audit-service | `PmSafetyStationAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| Station Registration Engine | `station-registration.engine.ts` | Register / activate validation |
| Station Heartbeat Engine | `station-heartbeat.engine.ts` | Offline, battery, sensor, firmware alerts |
| Worker Sign-In/Out Engine | `validateWorker` + access logs | Sign-in/out with zone rules |
| Equipment Validation Engine | `validateEquipment` | Assignment + operational status |
| JHA Validation Engine | `station-jha.engine.ts` | FLHA window, JHA signatures, PPE |
| Muster Tracking Engine | `musterCheckIn` | Station → muster attendance |
| Emergency Mode Engine | `setEmergencyMode` | Blocks access; emergency payload |
| Offline Station Engine | `buildOfflineBundle`, `applyOfflineSync` | Field replay + dedupe |

### Module wiring

- `PmSiteAccessControlModule` — full access gate via `stationValidate`
- `PmEquipmentSafetyModule` — `validateAssignment`
- `PmEmergencyResponseModule` — plans, lock, muster context
- `PmDocumentControlModule` — SDS/policy offline payload

---

## 2. Database schema

### `safety_stations` → `SafetyStation`

| Field | Spec alias |
|-------|------------|
| id | id |
| companyId | company_id |
| projectId | project_id |
| stationType | station_type |
| hardwareId | hardware_id |
| firmwareVersion | firmware_version |
| location / latitude+longitude | location |
| zoneCode | zone_id (code) |
| status | status (`pending`, `active`, `offline`, `maintenance`, `deactivated`) |
| lastPing | last_heartbeat |
| emergencyModeActive | emergency mode flag |
| networkMode | online/offline network state |

### `safety_station_heartbeats` → `SafetyStationHeartbeat`

| Field | Spec |
|-------|------|
| batteryLevel | battery_level |
| storageFreeMb | storage_used (inverse) |
| sensorHealthJson | sensor_status |
| createdAt | timestamp |

### `safety_station_access_logs` → `PmSafetyStationAccessLog`

| Field | Spec |
|-------|------|
| workerId | worker_id |
| equipmentId | (via checks / linked equipment log) |
| createdAt | timestamp |
| granted | result (granted/denied) |
| denialReasons | reason |

### `safety_station_muster_logs` → `PmSafetyStationMusterLog`

| Field | Spec |
|-------|------|
| workerId | worker_id |
| createdAt | timestamp |
| action | status (`check_in`, etc.) |

### `safety_station_attachments` → `PmSafetyStationAttachment`

| Field | Spec |
|-------|------|
| dataUrl / storageKey | file_path |
| createdAt | uploaded_at |

### Supporting tables

- `safety_station_equipment_logs` — equipment validation at station
- `safety_station_offline_cache` — downloaded bundle cache
- `safety_station_audit` — `PmSafetyStationAuditLog`

---

## 3. API contract

### Spec paths (`/api/v1/pm/station`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register station (supervisor) |
| POST | `/heartbeat` | Heartbeat by `stationCode` in body |
| POST | `/validate/worker` | Worker access + JHA validation |
| POST | `/validate/equipment` | Equipment validation |
| POST | `/muster/checkin` | Muster check-in at station |
| POST | `/emergency/mode` | Toggle emergency mode |
| POST | `/offline/sync` | Upload offline logs |
| GET | `/:id` | Station detail + operational state |
| GET | `/:id/predict` | CAIL risk bundle |

### Device paths (no JWT)

| Method | Path |
|--------|------|
| POST | `/device/heartbeat/:code` |
| POST | `/device/validate-worker` |
| POST | `/device/validate-equipment` |
| POST | `/device/muster-check-in` |
| GET | `/device/offline-bundle/:stationId` |
| POST | `/device/offline-sync/:stationId` |

### Full API (`/api/v1/pm/safety-stations`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register |
| PUT | `/:id/activate`, `/:id/deactivate` | Lifecycle |
| GET | `/`, `/health`, `/analytics` | List + monitoring |
| POST | `/validate-worker`, `/validate-equipment` | Validation |
| POST | `/muster/check-in`, GET `/muster/status` | Muster |
| PUT | `/:id/emergency-mode` | Emergency toggle |
| GET | `/:id/offline-bundle`, POST `/:id/offline-sync` | Offline |
| GET | `/access-logs`, `/equipment-logs` | Log viewers |
| GET | `/cail/insights` | Project CAIL cards |

### Validate worker body

```json
{
  "stationCode": "GATE-NORTH-01",
  "workerId": 12,
  "projectId": 1,
  "zoneCode": "CONFINED_A",
  "action": "sign_in",
  "equipmentId": 45
}
```

### Validate worker response

```json
{
  "granted": false,
  "denialReasons": ["Missing or expired training: confined_space"],
  "checks": { "training_confined_space": false, "flha": true },
  "requiredPpe": ["hard_hat", "safety_glasses"],
  "cail": {
    "likelyDenied": true,
    "probability": 0.44,
    "topFactors": ["training_confined_space"]
  }
}
```

### Heartbeat body

```json
{
  "stationCode": "GATE-NORTH-01",
  "batteryLevel": 78,
  "storageFreeMb": 1200,
  "sensorHealth": { "nfc": true, "camera": true },
  "firmwareVersion": "2.1.0",
  "online": true
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/safety-stations` | Station monitoring dashboard | `safety-stations/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-safety-stations.ts` — primary API
- `vera-frontend/lib/pm-station.ts` — spec paths

| Spec screen | Vera |
|-------------|------|
| Station Admin Panel | Register / activate |
| Station Monitoring Dashboard | List + health |
| Heartbeat Dashboard | Health cards + alerts |
| Access Log Viewer | Access logs tab |
| Muster Dashboard | Muster status |
| Emergency Dashboard | Emergency mode + payload |
| Offline Station Queue | `pmSafetyStations.sync` |

### Spec components

| Component | API / data |
|-----------|------------|
| StationCard | Station list item |
| HeartbeatStatus | `operationalState`, `healthy`, alerts |
| AccessLogCard | Access log row |
| MusterStatusBadge | `muster/status` |
| EmergencyModeIndicator | `emergencyModeActive` |

---

## 5. Workflow logic

### Operational states (derived `operationalState`)

| Spec | Condition |
|------|-----------|
| Online | Healthy heartbeat, no critical alerts |
| Offline | Stale heartbeat or `networkMode=offline` |
| Low Battery | `batteryLevel < 20%` |
| Sensor Fault | Any sensor unhealthy |
| Emergency Mode | `emergencyModeActive=true` |

### Station lifecycle

```
pending → active (hardwareId + projectId required)
active → offline / maintenance
any → emergency_mode (supervisor toggle)
active → deactivated (soft delete)
```

### Validation rules

| Rule | Enforcement |
|------|-------------|
| Worker must meet all access rules | `PmSiteAccessControlService.stationValidate` |
| Equipment must be safe | `validateAssignment` or operational status |
| JHA must be complete for high-risk zones | `StationJhaEngine` when `requiresJha` |

---

## 6. CAIL intelligence logic

### Per-validation (`validateWorker` response `cail`)

| Output | Description |
|--------|-------------|
| likelyDenied | Any failed check |
| probability | Failed checks × 0.22 |
| topFactors | Failed check keys |

### Project insights (`GET /cail/insights`)

| Type | Description |
|------|-------------|
| access_denial_trend | >20% denials in 7d |
| station_uptime | Offline/stale stations |
| chronic_non_compliance | Workers with ≥4 denials |
| muster_anomaly | >15% missing at active muster |

### Station predict (`GET /:id/predict`)

| Output | Description |
|--------|-------------|
| workerRiskScore | Denials + CAPA weighted |
| zoneRiskScore | Zone type + high-risk |
| predictiveAccessDenial | Historical denial likelihood |

---

## 7. Offline mode

### Download

`GET /:stationId/offline-bundle` — workers, equipment, JHA, zone rules, emergency plans, SDS.

### Upload

```json
{
  "stationId": 3,
  "accessLogs": [
    {
      "workerId": 12,
      "granted": true,
      "zoneCode": "SITE",
      "clientSyncId": "acc-1"
    }
  ],
  "musterLogs": [
    { "workerId": 12, "action": "check_in", "clientSyncId": "mus-1" }
  ]
}
```

**Field handler:** `pmSafetyStations.sync` — upload when payload includes log arrays; otherwise downloads bundle.

---

## 8. Integration map

| Module | Integration |
|--------|-------------|
| Site Access | Full `validateAccess` at station |
| Worker Safety Profiles | Worker roster in offline bundle |
| Equipment Safety | Equipment validation + roster |
| JHA / FLHA | `StationJhaEngine` + offline JHA payload |
| Emergency Response | Plans, site lock, muster attendance |
| Corrective Actions | Via site access CAPA gates |
| Document Control | SDS/policy in offline bundle |
| Offline Mode Engine | `pmSafetyStations.sync` batch router |

---

## 9. Analytics

**GET `/analytics?projectId=`**

| Metric | Description |
|--------|-------------|
| access.granted / denied | Access log counts (30d) |
| denialRate | Denied / total |
| syncSuccessRate | Granted / total (access proxy) |
| musterCompliancePct | Grant rate proxy |
| stationUptimePct | Healthy stations % |
| equipmentValidations | Equipment log count |
| musterCheckins | Muster log count |
| cailInsights | Insight cards + muster anomaly |

### Leading indicators

- Station uptime %
- Denial rate trend
- Offline station count

### Lagging indicators

- Muster missing worker rate
- Chronic non-compliance workers
- Emergency mode duration

---

## File index

```
backend/src/pm-safety-stations/
  pm-safety-stations.service.ts
  pm-safety-stations.controller.ts
  pm-station.controller.ts
  pm-safety-stations-cail-intelligence.service.ts
  station-registration.engine.ts
  station-heartbeat.engine.ts
  station-jha.engine.ts

vera-frontend/
  lib/pm-safety-stations.ts
  lib/pm-station.ts
  src/pages/pm/safety-stations/dashboard.tsx

docs/
  vera-pm-safety-stations-system.md
  vera-pm-safety-stations-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Restart backend to load `PmStationController`. No new migration required if `20260521240000_pm_safety_stations` is already applied.
